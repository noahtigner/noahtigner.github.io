---
title: Database Internals Ch. 13 - Distributed Transactions
description: Notes on Chapter 13 of Database Internals by Alex Petrov. Distributed Transactions, including two-phase commit, Spanner, partitioning, sharding, consistent hashing, and coordination avoidance.
published: March 26, 2026
updated: March 26, 2026
minutesToRead: 7
path: /articles/database-internals-chapter-13/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 13 - Distributed Transactions
  shortDescription: Distributed Transactions, including two-phase commit, Spanner, partitioning, sharding, consistent hashing, and coordination avoidance.
  order: 13
---

## Database Internals - Ch. 13 - Distributed Transactions

<p class="subtitle">7 minute read • March 26, 2026</p>

This post contains my notes on Chapter 13 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Introduction

In <a href="https://noahtigner.com/articles/database-internals-chapter-11/#consistency-models" target="_blank" rel="noopener">chapter 11</a> we discusses single-object, single-operation consistency models.
We now shift to discussing models where multiple ops are executed atomically and concurrently.
The main focus of transaction processing is to determine permissible histories and interleaving scenarios.
History can be represented as a dependency graph.
Histories are <a href="https://noahtigner.com/articles/database-internals-chapter-5/#serializability" target="_blank" rel="noopener">serializable</a> if they are equivalent to some sequential execution of transactions.

None of the single-partition transaction processing approaches we discussed so far solve the problem of multi-partition transactions, which require coordination between servers, distributed commits, and rollback protocols.

To ensure <a href="https://noahtigner.com/articles/database-internals-chapter-5/#introduction" target="_blank" rel="noopener">atomicity</a>, transactions must be recoverable, meaning that they can be completely rolled back if they were aborted or timed out.
Changes also have to be either propagated to all of the nodes involved in the transaction or none of them.

---

### Making Operations Appear Atomic

To make multiple (possibly remote) operations appear atomic, we need to use a class of algorithm called "atomic commitment".
These algorithms disallow disagreements between participants by not committing if even one participant voted against it.
This also means that failed processes have to reach the same conclusion as the rest of the cohort.
These algorithms don't work in the presence of <a href="https://noahtigner.com/articles/database-internals-chapter-8/#arbitrary-faults" target="_blank" rel="noopener">Byzantine failures</a>.

These algorithms only tell the system if the proposed transaction should be executed or not.
They don't set strict requirements around prepare, commit, or rollback ops.
Implementations have to decide when data is ready to commit, how to perform the commit itself, and how rollbacks should work.

---

### Two-Phase Commit

Two-phase commit (2PC) is the most straightforward protocol for distributed commitment.
It allows multi-partition atomic updates.
During the first phase, "prepare", the value is distributed to the nodes and votes are collected.
In the second phase, "commit/abort", nodes just flip the switch and make the change visible.
2PC requires a leader/coordinator that holds state, organizes votes, and decides to commit or abort.
The leader can be fixed through the lifetime of the system or picked with a <a href="https://noahtigner.com/articles/database-internals-chapter-10/" target="_blank" rel="noopener">leader election algorithm</a>.

#### Cohort Failures in 2PC

If one of the cohorts (participants) in unavailable during the prepare phase, the coordinator will abort the transaction.
This negatively impacts availability.
If a node fails during the commit/abort phase, it enters into an inconsistent state and cannot respond to requests until it has caught up.

#### Coordination Failures in 2PC

If a cohort does not receive a commit or abort command during the second phase, it must find out which decision was made by contacting either the coordinator or a peer.
Because of the possibility of a permanent coordinator failure, 2PC is a blocking atomic commitment algorithm.
It is often chosen due to its simplicity and low overhead, but it requires proper recovery mechanisms and backup coordinator nodes.

---

### Three-Phase Commit

Three-phase commit (3PC) is an improvement over 2PC that makes the protocol robust against coordinator failure and avoids undecided states.
3PC changes the first phase to "propose" and adds a middle "prepare" phase, where cohorts are notified about the vote results, and either sent a prepare or abort message.
This allows cohorts to carry on even if the coordinator fails.
Timeouts are also introduced on the cohort side.

#### Coordination Failures in 3PC

All state transitions are coordinated, and cohorts can't move to the next phase until everyone is done with the previous one.
If the coordinator fails, 3PC avoids blocking and allows cohorts to proceed deterministically.
The biggest issue with 3PC is the possibility of a "split brain" due to a network partition.
While it mostly solves the blocking problem of 2PC, it comes with a larger message overhead and does not work well in the presence of network partitions.
It is therefore not widely used.

---

### Distributed Transactions with Calvin

Traditional database systems execute transactions using two-phase locking or <a href="https://noahtigner.com/articles/database-internals-chapter-5/#optimistic-concurrency-control" target="_blank" rel="noopener">optimistic concurrency control</a> and have no deterministic transaction order.
This means that nodes have to be coordinated to preserve order.
Deterministic transaction ordering removes coordinator overhead during the execution phase, and since all replicas get the same inputs, they also produce the same outputs.
This approach is commonly known as "Calvin", a fast distributed transaction protocol.

To achieve deterministic order, Calvin used a "sequencer" - an entrypoint for all transactions that determines their execution order and establishes a global transaction input sequence.
Batches, called "epochs", are used to reduce contention.
Once replicated, these batches get forwarded to the scheduler, which orchestrates transaction execution.
Worker threads then proceed with the execution itself.
Calvin uses the Paxos consensus algorithm for determining which transactions make it into the current epoch.

---

### Distributed Transactions with Spanner

Unlike Calvin, Spanner uses 2PC over consensus groups per partition (shard).
It uses a high-precision wall-clock API called "Truetime" to achieve consistency and impose a transaction order.

Spanner offers three main operations:

- Read-write transactions - require locks, pessimistic concurrency control, and presence of the leader replica
- Read-only transactions - lock-free, can be executed on any replica
- Snapshot reads - consistent, lock-free view of the data at the given timestamp. A leader is only required when requesting the latest timestamp

Spanner uses Paxos for consistent transaction log replication, 2PC for cross-shard transactions, and Truetime for deterministic transaction ordering.
This means that multi-partition transactions have a higher cost compared to Calvin, but Spanner usually wins in terms of availability.

---

### Database Partitioning

Partitioning is simply a logical division of data into smaller manageable segments.
The most straightforward approach is to split the data into ranges.
Clients then route requests based on the routing key.
This is typically called "sharding", where every replica set acts as the single source for a subset of data.

We want to distribute reads and writes as evenly as possible, sizing partitions appropriately.
In order to maintain balance, the DB also has to repartition the data when nodes are added or removed.
In order to reduce range hot-spotting, some DBs use a hash of the value as the routing key.
A niaive approach is to map keys to nodes with something like `hash(v) % N`, where N is the number of nodes.
The downside of this is that if the number of nodes changes, the system is immediately unbalanced and needs to be repartitioned.

#### Consistent Hashing

In order to mitigate this problem, some DBs employ consistent hashing methods.
Hashed values are mapped to a ring, so that after the largest possible value, it wraps around to the smallest value.
Each node in the ring is responsible for the range of values between its two neighbors in the ring.
Consistent hashing helps to reduce the number of relocations required for maintaining balance.

---

### Distributed Transactions with Percolator

---

### Coordination Avoidance

---

### Other Resources

Greg Schoeninger of <a href="https://oxen.ai/" target="_blank" rel="noopener">oxen.ai</a> has a great blog post called <em><a href="https://ghost.oxen.ai/merkle-tree-101/" target="_blank" rel="noopener">Merkle Tree 101</a></em>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
