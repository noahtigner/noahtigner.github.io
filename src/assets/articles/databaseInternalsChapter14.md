---
title: Database Internals Ch. 14 - Consensus
description: Notes on Chapter 14 of Database Internals by Alex Petrov. Consensus in distributed systems, including Zookeeper, Paxos, and Raft.
published: March 29, 2026
updated: March 29, 2026
minutesToRead: 13
path: /articles/database-internals-chapter-14/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 14 - Consensus
  shortDescription: Consensus in distributed systems, including Zookeeper, Paxos, and Raft
  order: 14
---

## Database Internals - Ch. 14 - Consensus

<p class="subtitle">13 minute read • March 29, 2026</p>

This post contains my notes on Chapter 14 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Introduction

Consensus algorithms in distributed systems allow multiple processes to reach an agreement on a value.
<a href="https://noahtigner.com/articles/database-internals-chapter-8/#flp-impossibility" target="_blank" rel="noopener">FLP Impossibility</a> shows that deterministic consensus cannot guarantee both safety and termination in a completely asynchronous system if even one process may fail.
We've discussed the <a href="https://noahtigner.com/articles/database-internals-chapter-9/#introduction" target="_blank" rel="noopener">tradeoffs between failure detection accuracy and speed</a>.
Consensus algorithms assume an async model and guarantee safety while using an external failure detection algorithm to guarantee liveness.
Because failure detection is not always fully accurate, there will be some situations where the algorithm waits for a process that is incorrectly accused of being faulty.

Consensus algorithms have three essential properties:

1. Agreement - the decided value is the same for all correct processes
2. Validity - the decided value was proposed by one of the processes (not some default)
3. Termination - all correct processes eventually reach the decision

---

### Broadcast

Broadcast is a common abstraction often used in distributed systems.
These algorithms are used to disseminate info among a set of processes.
The simplest way to broadcast a message is through a "best effort broadcast", where the sender is responsible for ensuring message delivery to all targets.
If the sender fails, this type of broadcast will fail silently.

For a broadcast to be reliable, it needs to guarantee that all correct processes receive the same message, even if the sender crashes during transmission.

A naive implementation of a reliable broadcast might use a failure detector and a fallback mechanism.
This fallback mechanism could allow each process that received the message to forward it to each other process, effectively flooding the network with <em>N<sup>2</sup></em> messages.
This ensures that messages are still delivered even if the sender has crashed, improving system reliability.
The major downside to this approach is the obvious overhead of sending <em>N<sup>2</sup></em> messages, many of them redundant.

---

### Atomic Broadcast

The "flooding" algorithm described above ensures message delivery, but not delivery order.
Atomic broadcast guarantees both reliable delivery and total order.
Atomic broadcast algorithms have two essential properties:

- Atomicity - processes have to agree on the set of received messages. Either all non-failed processes deliver the message, or none do
- Order - all non-failed processes deliver the messages in the same order

#### Virtual Synchrony

Virtual synchrony is a framework for group communication.
An atomic broadcast delivers totally ordered messages to a <em>static</em> group of processes, and virtual synchrony delivers totally ordered messages to a dynamic group of peers.
It has not received broad adoption in real-world systems.

#### Zookeeper Atomic Broadcast (ZAB)

Apache Zookeeper is the most popular implementation of atomic broadcast.
It uses a hierarchical distributed key-value store, which is used to ensure a total order of events and the atomic delivery necessary to maintain consistency between replica states.

Processes in ZAB are either a follower or a (temporary) leader.
The leader executes algorithm steps, broadcasts messages to followers, and establishes the event order.
All writes, and reads that require the most recent values, are routed to the leader.

The protocol timeline is split into epochs, with one leader per epoch.
The process starts by using <a href="https://noahtigner.com/articles/database-internals-chapter-10/" target="_blank" rel="noopener">leader election</a> to find a <em>prospective</em> leader.
As soon as a prospective leader is established, it executes the protocol in three phases:

1. Discovery - the prospective leader contacts each process to get the IDs of the latest transactions in the previous epoch, then proposes a new epoch.
   After this, processes stop responding to broadcast proposals for the previous epoch
2. Synchronization - the prospective leader sends a message to the followers proposing itself as the leader for the next epoch and collects their acknowledgements.
   After this, the leader is established, and followers will not accept attempts to become the leader for this epoch.
   The leader then ensures that all followers have the same history and delivers committed proposals from the prior epoch's leader
3. Broadcast - active messaging starts.
   The leader receives client messages, establishes their order, and broadcasts them to followers.
   This continues until the leader crashes

Zookeeper is very efficient, requiring only two rounds of messaging during the broadcast, and leader failures can easily be recovered from with a single up-to-date process.

> [!WARNING]
> On October 29, 2020, GitHub experienced an outage due to a "split brain" issue in their Zookeeper system.
>
> Their <a href="https://github.blog/news-insights/company-news/github-availability-report-october-2020/#introduction" target="_blank" rel="noopener">availability report</a> goes into more details.\
> Arpit Bhayani's <a href="https://youtu.be/bycFzB6yrK0?si=TLQU0rxjXDlGig62" target="_blank" rel="noopener">discussion of this outage</a> provides useful insights and takeaways about this Zookeeper-related pitfall.

---

### Paxos

Paxos is one of the most well-known consensus algorithms.
Every proposal consists of a value and a monotonically increasing identifier which helps establish a total ordering of operations.
Participants assume one of three roles:

- Proposers - receive values from clients, create proposals to accept those values, and attempt to collect votes from acceptors
- Acceptors - vote to accept or reject proposals.
  Fault tolerance requires multiple acceptors, but only a <a href="https://noahtigner.com/articles/database-internals-chapter-11/#tunable-consistency" target="_blank" rel="noopener">quorum</a> of votes is required to accept the proposal for the sake of liveness
- Learners - take the role of replicas, storing the outcomes of accepted proposals

#### Paxos Algorithm

The Paxos algorithm can generally be split into a voting/proposal phase and a replication phase.
During the voting phase, proposers compete to establish themselves as the leader.
The goal of the first phase is to establish a leader for the round and understand which value is going to be accepted, allowing the leader to proceed with the second phase, where the value gets broadcast to the acceptors.

#### Quorums in Paxos

Liveness is guaranteed in the presence of <em>f</em> failed processes by requesting <em>2f + 1</em> processes in total, and a quorum size of <em>f + 1</em>.
Paxos only requires quorums for a vote so that it can guarantee a result even when some processes fail.

#### Failure Scenarios

One failure scenario that demonstrates Paxos' fault tolerance is when the proposer fails during the second phase, before it has broadcast the value to all acceptors.
In this case, a new proposer is selected, which can pick up and commit the value, distributing it to the other participants.
Another failure scenario is when two or more proposers compete to get through the propose phase, but both fail to collect a majority of votes because of the other.
This problem is usually resolved by adding a random backoff, which eventually lets one of the proposers win while the other sleeps.

#### Multi-Paxos

One problem with the classic Paxos algorithm is that a propose round is required for each replication round.
Multi-Paxos avoids repeating the propose phase, letting the proposer reuse its recognized position.
This significantly improves the algorithm's efficiency.

Having an established leader allows the propose phase to be skipped most of the time.
Proposers may have to periodically contact participants to let them know it is still alive.
This concept is called "leasing".

Multi-Paxos is sometimes described as a replicated log of ops.
To preserve the state in case a process crashes, participants keep a durable log of received messages.
After this log is synced with the primary structure to create a snapshot, it can be truncated to keep from growing too large.

#### Fast Paxos

Fast Paxos reduces the number of round-trips by one compared to the classic Paxos algorithm.
It lets <em>any</em> proposer contact acceptors directly, instead of going through the leader.
Fast Paxos is prone to collisions, which have to be reconciled by the coordinator.
This means that Fast Paxos can sometimes have higher latency than classic Paxos.

|                     | "Classic" Paxos | Fast Paxos      |
| ------------------- | --------------- | --------------- |
| Communication Steps | 3               | 2               |
| Quorum Size         | <em>2f + 1</em> | <em>f + 1</em>  |
| Total Acceptors     | <em>3f + 1</em> | <em>2f + 1</em> |

<p class="subtitle">"Classic" vs. Fast Paxos</p>

#### Egalitarian Paxos

Instead of using a leader for sequencing commands, Egalitarian Paxos (E-Paxos) uses a leader responsible for the commit of a specific command.
This command-specific leader establishes order by looking up and setting dependencies.
E-Paxos allows non-conflicting writes to be committed to the replicas directly.
Each proposal includes its dependencies and a sequence number.
The algorithm then proceeds with either a "fast path" or a "slow path", depending on whether the replicas agree and the dependencies match.
To execute a command, a dependency graph is created, which gets executed in reverse order.

#### Flexible Paxos

Flexible Paxos relaxes the definition of a quorum, trading availability for latency.
It requires fewer participants in the second phase but more votes in the leader election process.
Vertical Paxos, another variant, distinguishes between read and write quorums.
These ideas relate to the previous discussion of <a href="https://noahtigner.com/articles/database-internals-chapter-11/#tunable-consistency" target="_blank" rel="noopener">tunable consistency</a>.

#### Generalized Solution to Consensus

Paxos is notoriously difficult to reason about.
Its quorums can be generalized into a state machine with four states: <em>any</em>, <em>maybe v</em>, <em>none</em>, and <em>decided v</em>.
The decision process consists of two steps.
The first ensures that it is safe to write a value, and the second writes it.

---

### Raft

Raft is a newer, easier-to-understand alternative to Paxos for distributed consensus.
Locally, participants store a log containing the sequence of commands executed by the state machine.
Raft simplifies consensus by making the concept of leadership a first-class citizen.
A leader coordinates state machine manipulation and replication.
Like in atomic broadcast and Multi-Paxos, a single leader emerges from replicas, makes atomic decisions, and establishes message order.

Participants in Raft assume one of three roles:

- Candidate - <em>can</em> become a leader, attempts to collect a majority of votes. If no candidate wins, a new round of leader election starts
- Leader - temporary cluster leader that handles client requests and interacts with a replicated state machine. Leaders only serve for a term (epoch)
- Follower - a passive participant that persists log entries and responds to requests from the leader and candidates, similar to the leaders and acceptors in Paxos. Each participant starts as a follower

To guarantee global partial ordering without clock synchronization, time is divided into monotonically increasing terms.
The main components of the Raft algorithm include leader election, periodic heartbeats, and log replication and broadcast.

#### Leader Role in Raft

A leader can be elected only from the nodes holding all committed entries.
Once elected, the leader accepts client requests and replicates them to followers in parallel while appending the entry to its log.
Since only the most up-to-date candidates can become a leader, followers never have to bring the leader up-to-date.

#### Failure Scenarios

Split votes for leadership election are solved by restarting the election with randomized timers applied to reduce the likelihood of future ties (similar to Paxos).
This speeds up the election round without requiring any additional coordination between candidates.

A (rather harmless) potential issue is that uncommitted messages are never shown as committed, but already committed messages can sometimes show as in-progress.

In summary, Raft provides the following guarantees:

- Only one leader can be elected for a given term (no split brain situations)
- The leader's log contents are append-only
- Committed log entries are guaranteed to be present in logs for subsequent leaders and cannot be reverted
- All messages have unique IDs and term IDs

---

### Byzantine Consensus

All the algorithms discussed so far assume <a href="https://noahtigner.com/articles/database-internals-chapter-8/#arbitrary-faults" target="_blank" rel="noopener">non-Byzantine failures</a>.
They assume that all participants execute the algorithm in good faith.
However, distributed systems are sometimes deployed in potentially adversarial environments, where we must ensure that the system behaves correctly even if some nodes behave erratically or maliciously.

Most Byzantine consensus algorithms require flooding <em>N<sup>2</sup></em> encrypted messages to complete an algorithm step, where <em>N</em> is the number of nodes in the quorum.

#### PBFT Algorithm

Practical Byzantine Fault Tolerance (PBFT) is one such algorithm.
The system makes weak synchrony assumptions, meaning that failures may occur but they are eventually recovered from.
For PBFT to guarantee safety and liveness, at most <em>f</em> replicas can be faulty, and it must have at least <em>N = 3f + 1</em> nodes.

To distinguish between cluster configurations, PBFT uses "views".
In each view, one replica is the primary and the rest act as backups.
Clients execute their operations against the primary, which broadcasts the requests to the backups.
The client waits for <em>f + 1</em> replicas to respond with the same result for the operation to be considered successful.

After the primary receives a request, protocol execution proceeds in three steps: pre-prepare, prepare, and commit. Read-only operations can be done in just one round-trip.

#### Recovery and Checkpointing

Replicas save accepted messages in a stable log.
Every message has to be kept until it has been executed by at least <em>2f + 1</em> nodes.
This log can be used to bring replicas up to speed during recovery, but recovering replicas need a means of verifying the state, else recovery could be exploited as an attack vector.

To show that the state is correct, nodes compute a digest of the state for messages up to a given sequence number.
This process is too expensive to perform for every request.
Instead, stable checkpoints are made after every <em>N</em> requests, where <em>N</em> is some configurable constant.
The sequence number of the latest request in the checkpoint and the digest of the checkpoint's state are broadcasted; to which <em>2f + 1</em> replicas must respond.

Byzantine fault tolerance is used in storage systems deployed in potentially adversarial networks.
It imposes significant overhead and should be used carefully.
There are some alternatives to PBFT that optimize for systems with a large number of participants.

---

### Other Resources

The TechPrep YouTube channel has a video explaining ZooKeeper in 5 minutes. Heidi Howard from Cambridge gave a talk comparing and contrasting Paxos and Raft.

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/iHrsHqSAe18?si=EdpJfCl_kXQbYe7G"
        title="Video - ZooKeeper Explained in 5 Minutes"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/JQss0uQUc6o?si=i2uSJeMUweksgQbU"
        title="Video - Paxos vs Raft: Have we reached consensus on distributed consensus? — Heidi Howard"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
