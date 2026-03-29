---
title: Database Internals Ch. 9 - Failure Detection
description: Notes on Chapter 9 of Database Internals by Alex Petrov. Failure detection in distributed systems with heartbeats, pings, and gossip.
published: March 9, 2026
updated: March 29, 2026
minutesToRead: 5
path: /articles/database-internals-chapter-9/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 9 - Failure Detection
  shortDescription: Failure detection in distributed systems with heartbeats, pings, and gossip.
  order: 9
---

## Database Internals - Ch. 9 - Failure Detection

<p class="subtitle">5 minute read • March 9, 2026</p>

This post contains my notes on Chapter 9 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Introduction

Detecting failures in asynchronous systems is difficult since it is impossible to tell if a process has crashed or if it is just running slowly (<a href="https://noahtigner.com/articles/database-internals-chapter-8/#flp-impossibility" target="_blank" rel="noopener">see FLP Impossibility</a>). Failures can occur at the link level or at the process level. There's always tradeoffs between wrongly suspecting alive processes of being dead (false-positives) and giving dead processes the benefit of doubt (false-negatives).

A failure detector is a local subsystem responsible for identifying failed processes and excluding them from the algorithm. Failure detectors guarantee properties such as:

- Liveness - a specific, intended event <em>must</em> occur, requiring the failure detector to not produce false-negatives
- Safety - unintended events <em>must not</em> occur, requiring the failure detector to not produce false-positives
- Completeness - the algorithm must be able to reach and complete its final step
- Efficiency - how quickly process failures are detected
- Accuracy - the measure of how many false-positives and false-negatives are produced (negative relationship with efficiency)

---

### Heartbeats and Pings

We can query the state of a remote process by triggering one of two periodic processes:

- Ping - checks if the process is still alive by sending it a message and asserting that it responds within a specified timeframe
- Heartbeat - the process actively notifies its peers that it's still running by sending messages to them

Many failure detection algorithms use heartbeats and timeouts. This approach can have issues with precision, and it doesn't capture process visibility from the perspective of other processes (e.g., it won't spot issues caused by unintended network partitions).

#### Timeout-Free Failure Detector

Some algorithms avoid relying on timeouts for detecting failures. For example, <em>Heartbeat</em> is a timeout-free failure detector that operates under async system assumptions. The algorithm assumes that all connections are "fair paths" (containing only <a href="https://noahtigner.com/articles/database-internals-chapter-8/#links" target="_blank" rel="noopener">fair loss links</a>), and that each process is aware of all other processes in the network.

Each process maintains a list of neighbors and counters associated with them. Processes start up by transmitting heartbeat messages to all neighbors. These messages contain the path that the heartbeat has traveled so far. When a process receives a heartbeat message, it appends itself to the message's path and forwards it to all of its neighbors that aren't already on the path. Heartbeat counters represent a global and normalized view of the system. If we're not careful though, the algorithm can produce false-positives.

#### Outsourced Heartbeats

Alternatively, outsourced heartbeats can improve reliability by using info about a process's liveness from the perspective of its neighbors. This does not require all processes to be aware of all other processes, only a subset of connected peers. This accounts for both direct and indirect reachability and allows us to make more accurate decisions.

---

### Phi-Accrual Failure Detector

Phi-accrual produces a continuous scale instead of the binary alive/dead measurement of other detection methods. It captures the probability of a process's crash by maintaining a sliding window which collects arrival times of the recent heartbeats from peers. This info is used to approximate the arrival time of the next heartbeat, which is then compared against the actual arrival time to compute the "suspicion level".

It can be viewed as a collection of three subsystems:

- Monitoring - collects liveness info through pings, heartbeats, or other request-response sampling
- Interpretation - decides if a process should be marked as suspicious
- Action - executes a callback whenever a process is marked as suspicious

---

### Gossip and Failure Detection

Gossip provides another approach that avoids relying on a single-node view to make the decision. Gossip collects and distributes the state of neighboring processes. Each member stores a list of other members, their heartbeat counters, and the timestamp when the counter was last updated. Periodically, each member increments its counter and distributes its list to a random neighbor. Upon receipt, lists are merged and counters are updated. Nodes also periodically check the list of states and heartbeat counters. If any node didn't update its counter for long enough, it is considered failed. This allows us to detect crashed nodes as well as nodes that are unreachable by any other cluster member. Gossip increases the number of messages in the system, but allows info to spread more reliably.

For more on gossip, see <em><a href="https://noahtigner.com/articles/database-internals-chapter-12/#gossip-dissemination" target="_blank" rel="noopener">Chapter 12 - Anti-Entropy and Dissemination</a></em>.

---

### Reversing Failure Detection Problem Statement

Since propagating info about failures is not always possible, and propagating it by notifying every member is expensive, one approach called FUSE (failure notification service) focuses on reliable and cheap failure propagation that works even in cases of network partitions. To detect process failures, processes are organized into groups. If one group becomes unavailable, all participants within the group fail. Every time a process fails, the failure propagates to the whole group. This allows detection in the presence of any partitions or node failures. This approach uses the absence of communication as a means of info propagation (when one process in the group fails, all processes within the group stop sending heartbeats).

---

### Other Resources

Ben Dicken has a video covering pinging, gossip, and their associated tradeoffs.

<iframe
    src="https://www.youtube.com/embed/S_cizfXDd3w?si=K_GubyIDP3zsRcp3"
    title="Video - Detecting server failure in a distributed system"
    allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrer-policy="strict-origin-when-cross-origin"
    allow-full-screen="true"
    loading="lazy"
    style="width:100% !important"
></iframe>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
