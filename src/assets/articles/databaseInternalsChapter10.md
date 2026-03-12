---
title: Database Internals Ch. 10 - Leader Election
description: Notes on Chapter 10 of Database Internals by Alex Petrov. Leader election strategies like the Bully Algorithm, Invitation Algorithm, and Ring Algorithm.
published: March 11, 2026
updated: March 11, 2026
minutesToRead: 5
path: /articles/database-internals-chapter-10/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 10 - Leader Election
  shortDescription: Leader election strategies like the Bully Algorithm, Invitation Algorithm, and Ring Algorithm.
  order: 10
---

## Database Internals - Ch. 10 - Leader Election

<p class="subtitle">5 minute read • March 11, 2026</p>

This post contains my notes on Chapter 10 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Introduction

To reduce synchronous overhead and the number of message round-trips required to reach a decision, some algorithms elect a leader process. The leader is responsible for executing and coordinating steps of a distributed algorithm. Leadership is usually only held temporarily (until the process crashes and another takes its place). The liveness of the election algorithm guarantees that there will be a leader <em>most</em> of the time, and that election will eventually complete. Ideally, we would also have a guarantee of safety; that there will never be <em>more than one</em> leader at a time. Many real-world leader election algorithms violate this agreement. Because every leader process will eventually fail, <a href="https://noahtigner.com/articles/database-internals-chapter-9" target="_blank" rel="noopener">failure has to be detected</a>, reported, and acted upon, resulting in a new leader being elected.

---

### Bully Algorithm

The Bully Algorithm uses process ranks to identify the new leader. Each process gets assigned a unique rank, and the process with the highest rank gets selected when the previous leader fails. The algorithm is very simple; the highest ranking process "bullies" other processes into accepting it as the leader. The leader is elected in a three-step process:

1. The process that noticed the leader failure sends election messages to higher-ranking processes
2. The process waits for higher-ranked processes to respond. If some respond, highest ranking process is allowed to proceed to step 3. If none respond, the initial process proceeds to step 3
3. The process assumes that there are no active processes with a higher rank and notifies all lower-ranked processes of its successful election

The safety guarantee is violated in cases of network partitions, leading to a "split brain" situation with multiple leaders. Issues can also be caused when unstable high-ranking processes keep failing and getting re-elected continuously.

---

### Next-In-Line Failover

An improvement of the Bully Algorithm, Next-In-Line Failover has each leader provide a list of failover nodes. When a process notices that the leader has failed, it tries messaging the highest-ranked process in the previous leader's list. If this node is alive, it automatically assumes leadership without a standard election cycle taking place. This results in fewer steps during election if the next-in-line process is available.

---

### Candidate/Ordinary Optimization

We can reduce the number of messages needed by splitting nodes into two subsets: "candidates" and "ordinary", where only one candidate can eventually become leader. An ordinary process initiates election by contacting all candidates, collecting their responses, picking the highest ranking live node from among them, and notifying the rest about its election. To solve the problem with simultaneous elections, a tiebreaker process-specific delay is used to allow higher-ranking nodes to initiate election before lower ones.

---

### Invitation Algorithm

The Invitation Algorithm allows processes to "invite" other processes to join the group instead of trying to outrank them. Each group therefore has its own leader. Each process starts in its own group, and groups are gradually merged.

---

### Ring Algorithm

All nodes in the system form a ring, with each node being aware of its predecessor and successor (essentially a circular doubly-linked list). When a process discovers that the leader has failed, it contacts the next alive successor (skipping dead successors). This process passes over the whole ring, with each process passing on the list of live nodes seen so far, similar to <a href="https://noahtigner.com/articles/database-internals-chapter-9/#timeout-free-failure-detector" target="_blank" rel="noopener">timeout-free failure detection</a>. When this process has made its way back to the process that initiated it, the alive node with the highest rank is chosen from the list. To optimize this, we can simply track the node with the maximum rank seen so far, rather than maintaining the whole set. Since the ring could be partitioned into two or more parts, safety is not guaranteed here either.

---

### Summary

All algorithms discussed so far are prone to allowing multiple leaders at once. To avoid this split-brain problem, we have to obtain a cluster-wide majority of votes. We need to combine leader election with failure detection. Algorithms that rely on leader election often allow the existence of multiple leaders, but attempt to resolve conflicts between the leaders as soon as possible. Multi-Paxos and Raft, discussed in future chapters, both use this approach.

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
