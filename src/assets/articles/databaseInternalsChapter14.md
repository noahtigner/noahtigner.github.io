---
title: Database Internals Ch. 14 - Consensus
description: Notes on Chapter 14 of Database Internals by Alex Petrov. Consensus in distributed systems, including Zookeeper, Paxos, and Raft.
published: March 30, 2026
updated: March 30, 2026
minutesToRead: 9
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

<p class="subtitle">9 minute read • March 30, 2026</p>

This post contains my notes on Chapter 14 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Introduction

Consensus algorithms in distributed systems allow multiple processes to reach an agreement on a value.
<a href="https://noahtigner.com/articles/database-internals-chapter-8/#flp-impossibility" target="_blank" rel="noopener">FLP Impossibility</a> shows that it is impossible to guarantee consensus in a completely asynchronous system in unbounded time.
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
This fallback mechanism could allow each process that received the message to forward it to each other process, effectively flooding the network with N<sup>2</sup> messages.
This ensures that messages are still delivered even if the sender has crashed, improving system reliability.
The major downside to this approach is the obvious overhead of sending N<sup>2</sup> messages, many of them redundant.

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
It uses a hierarchical distributed key-value store, which is uses to ensure a total order of events and the atomic delivery necessary to maintain consistency between the replica states.

Processes in ZAB are either a follower or a (temporary) leader.
The leader executes algorithm steps, broadcasts messages to followers, and establishes the event order.
All writes and reads of the most recent values are routed to the leader.

The protocol timeline is split into epochs, with one leader per epoch.
The process starts by using <a href="https://noahtigner.com/articles/database-internals-chapter-10/" target="_blank" rel="noopener">leader election</a> to find a <em>prospective</em> leader.
As soon as a prospective leader is established, it executes the protocol in three phases:

1. Discovery - the prospective leader contacts each process to get the IDs of the latest transactions in the previous epoch, then proposes a new epoch.
   After this, processes stop responding to broadcast proposals for the previous epoch
2. Synchronization - the prospective leader sends a message to the followers proposing itself as the leader for the next epoch and collects their acknowledgements.
   After this, the leader is established, and followers will not accept attempts to become the leader for this epoch.
   The leader then ensures that all followers have the same history and delivers committed proposals form the prior epoch's leader
3. Broadcast - active messaging starts.
   The leader receives client messages, establishes their order, and broadcasts them to followers.
   This continues until the leader crashes

Zookeeper is very efficient, requiring only two rounds of messaging during the broadcast, and leader failures can easily be recovered from from with a single up-to-date process.

---

### Paxos

#### Paxos Algorithm

#### Quorums in Paxos

#### Failure Scenarios

#### Multi-Paxos

#### Fast Paxos

#### Egalitarian Paxos

#### Flexible Paxos

#### Generalized Solution to Consensus

---

### Raft

#### Leader Role in Raft

#### Failure Scenarios

---

### Byzantine Consensus

#### PBFT Algorithm

#### Recovery and Checkpointing

---

### Other Resources

Yugabyte provided a great talk comparing and contrasting Calvin and Spanner. ByteByteGo has a great video, article, and chapter in <em>System Design Interview</em> about consistent hashing.

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/InP4-LpdCzU?si=mjgo-BjRDvTfwkZB"
        title="Video - Spanner vs Calvin: Comparing Consensus Protocols in Strongly Consistent Database Systems"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/UF9Iqmg94tk?si=9RNC33WBZKV3ZfuE"
        title="Video - Consistent Hashing | Algorithms You Should Know #1"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
