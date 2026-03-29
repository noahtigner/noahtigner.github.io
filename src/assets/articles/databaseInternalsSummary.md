---
title: Database Internals - Summary & Review
description: Summary and review of Database Internals by Alex Petrov.
published: March 29, 2026
updated: March 29, 2026
minutesToRead: 10
path: /articles/database-internals-summary/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Summary & Review
  shortDescription: Summary and review of Database Internals by Alex Petrov.
  order: 15
---

## Database Internals - Summary & Review

<p class="subtitle">10 minute read • March 29, 2026</p>

This post contains my summary and review of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Part I - Storage Engines

#### B-Trees and LSM Trees

Storage engines are shaped less by asymptotic complexity than by hardware behavior, access patterns, and operational tradeoffs.
<a href="https://noahtigner.com/articles/database-internals-chapter-2/" target="_blank" rel="noopener">B-Trees</a> and <a href="https://noahtigner.com/articles/database-internals-chapter-7/#lsm-trees" target="_blank" rel="noopener">LSM Trees</a> are the clearest example of this.
Both are ordered structures optimized for disk-backed storage, but they make very different choices around buffering, mutability, and maintenance.

B-Trees are the most commonly used example of a read-oriented structure.
They use wide nodes, high fanout, and low height to reduce seeks while preserving efficient point lookups and range scans.
The real complexity is not just the tree itself, but everything required to make it practical: slotted pages, separator keys, sibling links, overflow handling, rebalancing, compression, bulk loading, and <a href="https://noahtigner.com/articles/database-internals-chapter-6/" target="_blank" rel="noopener">variants such as copy-on-write trees, buffered trees, and Bw-Trees</a>.
Storage-engine design is about preserving ordered access while balancing read performance, write cost, space usage, and concurrency.

LSM Trees start from the opposite side of the tradeoff space.
Instead of optimizing in-place updates, they buffer writes in memory, flush sorted immutable structures to disk, and use compaction to merge and reconcile data over time.
This reduces the cost of small writes and takes advantage of sequential I/O, but it pushes work into later maintenance and introduces read, write, and space amplification tradeoffs.
That is why components such as memtables, SSTables, tombstones, bloom filters, and leveled or size-tiered compaction matter so much.
One especially useful connection is that B-Trees and related structures often still appear inside LSM-based systems, whether for indexing or for comparison.

|              | Buffered | Mutable | Ordered |
| ------------ | -------- | ------- | ------- |
| B+Trees      |          | ✓       | ✓       |
| WiredTiger   | ✓        | ✓       | ✓       |
| LA-Trees     | ✓        | ✓       | ✓       |
| CoW Trees    |          |         | ✓       |
| 2C LSM Trees | ✓        |         | ✓       |
| MC LSM Trees | ✓        |         | ✓       |
| FD-Trees     | ✓        |         | ✓       |
| BitCask      |          |         |         |
| WiscKey      | ✓\*      |         | ✓\*     |
| BW-Trees     |          |         | \*      |

<p class="subtitle">Buffering, immutability, and ordering properties of discussed storage structures</p>

#### Transactions

<a href="https://noahtigner.com/articles/database-internals-chapter-5/#introduction" target="_blank" rel="noopener">Transactions</a> are the indivisible logical unit of work in database management systems.
They allow us to represent multiple operations in a single step.
ACID (atomicity, consistency, isolation, durability) is one of the most important concepts related to databases.
Transaction processing usually involves components such as the lock manager, page cache, and log manager.

Most databases use a 2-level memory hierarchy: slower persistent storage (disk) and faster main memory (RAM).
Pages are cached in memory to reduce the number of disk accesses.
Page replacement algorithms use eviction policies such as FIFO, LRU, CLOCK, and LFU.
These policies have various tradeoffs surrounding precision (hit rate), overhead, and complexity.

#### Recovery

The <a href="https://noahtigner.com/articles/database-internals-chapter-5/#recovery" target="_blank" rel="noopener">WAL</a> is an append-only auxiliary on-disk structure used for crash and transaction recovery. It has several functions:

- It allows the page cache to buffer updates to disk-resident pages while ensuring durability
- It persists all ops on disk until cached copies of pages affected by these ops are synced on disk
- It allows lost in-memory changes to be reconstructed from the operation log in case of crash

The WAL is usually coupled with a primary storage structure by the interface that allows trimming it whenever a checkpoint is reached.
Checkpoints tell the log system that log records up to a certain point aren’t required anymore.
“Fuzzy checkpointing” allows this to happen asynchronously and is a more practical approach.

#### Concurrency Control

<a href="https://noahtigner.com/articles/database-internals-chapter-5/#optimistic-concurrency-control" target="_blank" rel="noopener">Concurrency control</a> is a set of techniques for handling interactions between concurrently executing transactions. They can be grouped into three buckets:

- Optimistic Concurrency Control (OCC)
- Pessimistic Concurrency Control (PCC)
- Multiversion Concurrency Control (MVCC)

A schedule is a list of ops required to execute a set of transactions from the db’s perspective.
A schedule is “complete” if it contains all ops from every transaction executed in it.
It is “serial” when transactions are executed independently and in serial (one after the other).
Serializable schedules allow us to execute transactions concurrently while maintaining the correctness of a serial schedule.

Isolation levels specify how and when parts of the transaction should become visible to other concurrent transactions.

#### Read & Write Anomalies

Read anomalies include:

- “Dirty” reads - when a transaction reads uncommitted changes from other transactions
- Non-repeatable “fuzzy” reads - when a transaction queries the same row twice and gets different results
- “Phantom” reads - when a transaction queries a set of rows twice and gets different results (the range-query equivalent of a fuzzy read)

Write anomalies include:

- “Lost” updates - when two transactions attempt to update the same value and the second transaction has no knowledge of the first and overwrites its updates without taking its updates into account
- “Dirty” writes - when a transaction takes an uncommitted value (dirty read) and modifies and saves it
- Write “skew” - when each individual transaction in a set respects the invariants, but the combination of the transactions does not

|                  | Dirty   | Non-Repeatable | Phantom |
| ---------------- | ------- | -------------- | ------- |
| Read Uncommitted | Allowed | Allowed        | Allowed |
| Read Committed   | -       | Allowed        | Allowed |
| Repeatable Read  | -       | -              | Allowed |
| Serializable     | -       | -              | -       |

<p class="subtitle">Isolation levels and allowed anomalies</p>

---

### Part II - Distributed Systems

#### Distributed Algorithms

Distributed algorithms serve many purposes, such as:

- Coordination - a process that supervises the actions and behaviors of several workers
- Cooperation - multiple participants relying on one another for finishing their task
- Dissemination - process cooperating in spreading the information to all interested parties
- Consensus - achieving agreement among multiple processes

#### Two Generals, FLP Impossibility, and Byzantine Failures

The <a href="https://noahtigner.com/articles/database-internals-chapter-8/#two-generals-problem" target="_blank" rel="noopener">Two Generals problem</a> is a thought experiment that shows that it is impossible to achieve an agreement between two parties if communication is asynchronous and links fail.
<a href="https://noahtigner.com/articles/database-internals-chapter-8/#flp-impossibility" target="_blank" rel="noopener">FLP Impossibility</a> shows that deterministic consensus cannot guarantee both safety and termination in a completely asynchronous system if even one process may fail.
<a href="https://noahtigner.com/articles/database-internals-chapter-8/#arbitrary-faults" target="_blank" rel="noopener">Arbitrary</a> (a.k.a. “Byzantine”) faults are where a process continues executing algorithm steps, but in a way that contradicts the algorithm.
These can be caused by software bugs, malicious actors, etc.

#### Failure Detection

<a href="https://noahtigner.com/articles/database-internals-chapter-9/" target="_blank" rel="noopener">Failures</a> can occur at the link level or at the process level.
There are always tradeoffs between wrongly suspecting alive processes of being dead (false-positives) and giving dead processes the benefit of doubt (false-negatives).

We can query the state of a remote process by triggering one of two periodic processes:

- Ping - checks if the process is still alive by sending it a message and asserting that it responds within a specified timeframe
- Heartbeat - the process actively notifies its peers that it’s still running by sending messages to them

Gossip provides another approach that avoids relying on a single-node view to make the decision.
Gossip collects and distributes the state of neighboring processes, with unresponsive nodes eventually being considered failed.
It increases the number of messages in the system, but allows info to spread more reliably.
In addition to failure detection, gossip is used for information propagation and dissemination.

#### Leader Election

To reduce synchronous overhead and the number of message round-trips required to reach a decision, some algorithms <a href="https://noahtigner.com/articles/database-internals-chapter-10/" target="_blank" rel="noopener">elect a leader process</a>.
The leader is responsible for executing and coordinating steps of a distributed algorithm.
Possible solutions include the Bully algorithm, Invitation algorithm, and Ring algorithm.

#### Replication & Consistency

The <a href="https://noahtigner.com/articles/database-internals-chapter-11/#infamous-cap" target="_blank" rel="noopener">CAP conjecture</a> describes the tradeoffs between consistency <em>C</em>, availability <em>A</em>, and partition tolerance <em>P</em>.
The conjecture states that a system can only choose between consistency and availability when a partition occurs.
The two most common approaches are “AP” and “CP”.
CP systems prefer failing requests to serving potentially inconsistent data.
AP systems loosen the C requirements and allow serving potentially inconsistent values during the request.

<a href="https://noahtigner.com/articles/database-internals-chapter-11/#consistency-models" target="_blank" rel="noopener">A consistency model</a> can be thought of as a contract between participants.
They describe what expectations clients might have about returned values in the presence of replication and concurrent accesses.
Consistency models include strict consistency, linearizability, sequential consistency, causal consistency, and eventual consistency.

Some systems opt for eventual consistency and use tunable parameters that follow the CAP conjecture.
Strong eventual consistency is gaining traction with <a href="https://noahtigner.com/articles/database-internals-chapter-11/#strong-eventual-consistency-and-crdts" target="_blank" rel="noopener">Conflict-Free Replicated Data Types (CRDTs)</a>.

#### Distributed Transactions

To make multiple (possibly remote) operations appear atomic, we need to use a class of algorithm called <a href="https://noahtigner.com/articles/database-internals-chapter-13/#making-operations-appear-atomic" target="_blank" rel="noopener">“atomic commitment”</a>.
These algorithms disallow disagreements between participants by not committing if even one participant voted against it.
<a href="https://noahtigner.com/articles/database-internals-chapter-13/#two-phase-commit" target="_blank" rel="noopener">Two-phase commit (2PC)</a> is the most straightforward protocol for distributed commitment, allowing multi-partition atomic updates.

The two most common approaches for distributed transaction are <a href="https://noahtigner.com/articles/database-internals-chapter-13/#distributed-transactions-with-calvin" target="_blank" rel="noopener">Calvin</a> and <a href="https://noahtigner.com/articles/database-internals-chapter-13/#distributed-transactions-with-spanner" target="_blank" rel="noopener">Spanner</a>.
Calvin sequences and batches transactions, and uses <a href="https://noahtigner.com/articles/database-internals-chapter-14/#paxos" target="_blank" rel="noopener">Paxos</a> for determining which transactions make it into the current epoch (batch).
Unlike Calvin, Spanner uses 2PC over consensus groups per partition (shard).
It uses Paxos for consistent transaction log replication, 2PC for cross-shard transactions, and TrueTime for deterministic transaction ordering.
This means that multi-partition transactions have a higher cost compared to Calvin, but Spanner usually wins in terms of availability.

#### Consensus

<a href="https://noahtigner.com/articles/database-internals-chapter-14/" target="_blank" rel="noopener">Consensus algorithms</a> in distributed systems allow multiple processes to reach an agreement on a value.
Atomic broadcast algorithms such as <a href="https://noahtigner.com/articles/database-internals-chapter-14/#zookeeper-atomic-broadcast-zab" target="_blank" rel="noopener">ZooKeeper</a> ensure a total order of events and the atomic delivery necessary to maintain consistency between replica states.
The two most widespread consensus algorithms are <a href="https://noahtigner.com/articles/database-internals-chapter-14/#paxos" target="_blank" rel="noopener">Paxos</a> and <a href="https://noahtigner.com/articles/database-internals-chapter-14/#raft" target="_blank" rel="noopener">Raft</a>, with the latter being considered easier to reason about and implement.
In adversarial environments, Byzantine fault-tolerant algorithms like <a href="https://noahtigner.com/articles/database-internals-chapter-14/#pbft-algorithm" target="_blank" rel="noopener">PBFT</a> must be employed.

---

### Review & Thoughts

#### Overall Review

I found this book to be a great deep-dive into database internals, storage engines and building blocks, and distributed systems.
The first half of the book offered unique depth into structures like B-Trees and LSM Trees.
I found the second half more interesting (and more applicable to my work), but it seems to overlap heavily with books like <em>Designing Data-Intensive Applications</em>.

#### Who Would I Recommend This To?

Naturally, I would recommend this book to anyone interested in building or modifying their own storage engines.
I would also recommend it to any software engineers tasked with tuning existing systems, or picking the right tool for the job when building from the ground up.
I would <em>not</em> recommend this for engineers early in their career, and/or those studying for system design interviews.
Those readers would be better served by something much higher-level like Alex Xu's <em>System Design Interview</em>.

#### Useful Tidbits

This book introduced me to several data structures and algorithms that I would like to study further:

- <a href="https://noahtigner.com/articles/database-internals-chapter-12/#merkle-trees" target="_blank" rel="noopener">Merkle Trees</a>, which can be used to build trees of content hashes (picture file-change detection in a system like Git)
- <a href="https://noahtigner.com/articles/database-internals-chapter-7/#bloom-filters" target="_blank" rel="noopener">Bloom Filters</a>, which efficiently (but probabilistically) check for the inclusion of an item in a set
- <a href="https://noahtigner.com/articles/database-internals-chapter-11/#strong-eventual-consistency-and-cdrts" target="_blank" rel="noopener">CRDTs</a>, specifically the <a href="https://automerge.org/" target="_blank" rel="noopener">Automerge project</a>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
