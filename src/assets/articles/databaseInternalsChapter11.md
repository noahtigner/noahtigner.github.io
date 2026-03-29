---
title: Database Internals Ch. 11 - Replication and Consistency
description: Notes on Chapter 11 of Database Internals by Alex Petrov. Replication and consistency in distributed systems, CAP, and CRDTs.
published: March 18, 2026
updated: March 29, 2026
minutesToRead: 10
path: /articles/database-internals-chapter-11/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 11 - Replication and Consistency
  shortDescription: Replication and consistency in distributed systems, CAP, and CRDTs.
  order: 11
---

## Database Internals - Ch. 11 - Replication and Consistency

<p class="subtitle">10 minute read • March 18, 2026</p>

This post contains my notes on Chapter 11 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Introduction

Consistency models explain visibility semantics and behavior of systems with multiple copies of data. Fault tolerance is the property of a system that can continue operating correctly despite component failures. The primary goal is usually to remove a single point of failure from the system and add redundancy for mission-critical components. This redundancy is usually transparent to the user/client.

---

### Achieving Availability

To make the system highly available, we need to design it in a way that allows handling failures or unavailability of one or more participants gracefully. This is usually done with redundancy and replication. Data replication requires data synchronization strategies and recovery mechanisms.

---

### Infamous CAP

Availability measures the system's ability to respond to every request successfully. We would also like each operation to be (<a href="https://noahtigner.com/articles/database-internals-chapter-5/#introduction" target="_blank" rel="noopener">atomically</a> / <a href="https://noahtigner.com/articles/database-internals-chapter-11/#linearizability" target="_blank" rel="noopener">linearizably</a>) consistent. Ideally, we would like to achieve both availability and consistency while tolerating network partitions. The CAP conjecture describes the tradeoffs between consistency <em>C</em>, availability <em>A</em>, and partition tolerance <em>P</em>. The conjecture states that a system can only choose between consistency and availability when a partition occurs.

The two most common approaches are "AP" and "CP". CP systems prefer failing requests to serving potentially inconsistent data. AP systems loosen the C requirements and allow serving potentially inconsistent values during the request.

#### Use CAP Carefully

CAP discusses network partitions, not node crashes or other types of failures. CAP implies that we can face inconsistency problems even if all nodes are up, but there are connectivity issues between them. CAP also places no bounds on execution latency.

#### Harvest and Yield

Instead of being either consistent or available, systems can provide relaxed guarantees. The following tunable metrics allow us to choose what constitutes correct behavior:

- Harvest - how complete the query is (i.e., returning 99 instead of 100 rows in a range query)
- Yield - the number of requests that were completed successfully compared to the total number of requests

---

### Shared Memory

From the client's perspective, distributed systems act as if storage is shared, like on a single-node system. A single unit of storage is called a "register." We define each operation by its invocation or completion events. These operations can be either sequential or concurrent.

Registers can be accessed by multiple readers and writes simultaneously. When it comes to concurrent ops, there are three types of registers:

- Safe - reads to the safe registers may return arbitrary values within the range of the register during a concurrent write op
- Regular - read ops return the value of the most recently completed write, or the value of the write that overlaps with the current read op
- Atomic - every write op has a single moment before which every read returns an old value and after which every read returns a new value. This guarantees linearizability.

---

### Ordering

To reason about operation order and have non-ambiguous descriptions of possible outcomes, we have to define consistency models.

---

### Consistency Models

A consistency model can be thought of as a contract between participants. They describe what expectations clients might have about returned values in the presence of replication and concurrent accesses. First, we'll focus on visibility and the propagation of operation results.

#### Strict Consistency

Strict consistency is the equivalent of complete replication transparency; any write by any process is available for subsequent reads by any process. Unfortunately, this is just a theoretical model and is impossible to implement.

#### Linearizability

Linearizability is the strongest single-object, single-operation consistency model. The effects of writes become visible to all readers exactly once at some point in time between its start and end, and no reader can see the impacts of in-flight writes.

One of the most important traits of linearizability is visibility; once the op is complete, it is visible to everyone. It prohibits stale reads and requires reads to be monotonic. The "linearization point" is the moment where a write's effects become visible. This provides write atomicity by describing the exact cutoff when the changes are committed (from the client's perspective). It can be achieved with locks or atomic primitives.

Many systems, including CPUs, don't always offer linearizability because synchronization instructions are expensive and slow. In distributed systems, linearizability requires coordination and ordering, and can be implemented with consensus.

#### Sequential Consistency

Sequential consistency is a relaxed model compared to linearizability; it still provides relatively strong consistency guarantees while being less expensive. Ops are ordered as if they were executed in <em>some</em> sequential order. Ops can be ordered in different ways, but all processes <em>observe</em> the ops in the same order. Similar to linearizability, modern CPUs don't guarantee sequential consistency, but we can use memory barrier "fences" to ensure that writes become visible to concurrent threads in order.

#### Causal Consistency

Under causal consistency, all processes have to see causally related ops in the same order. Concurrent writes with no causal relationship can be observed in a different order by different processes. Writes aren't made visible until all of their dependencies have arrived. It can be implemented using logical clocks and by sending contextual data about dependencies with each message.

Establishing causal order allows the system to reconstruct the sequence of events even if messages are delivered out of order, fill the gaps between messages, and avoid publishing operation results in case some messages are still missing. A vector clock is a structure for establishing a partial order between the events, detecting and resolving divergences between the event chains. We can simulate common time, global time, and represent asynchronous events as synchronous. Processes maintain vectors of logical clocks, with one clock per process.

---

### Session Models

Session models, a.k.a. "client-centric consistency models", help to reason about the state of a distributed system from the client's perspective (how each client observes the state of a distributed system while issuing read and write ops). The "read-own-writes" model holds that every read op following a write op on the same or other replica has to observe the updated value. In other words, every write issued by the client is visible to it. The "monotonic reads" model states that if the read has been observed the value <em>V</em>, the following reads have to observe a value at least as recent as <em>V</em>. The "monotonic writes" model assumes that values originating from the same client appear in the order that this client had them executed in. If <em>write(x, V2)</em> was made after <em>write(x, V1)</em>, then their effects must become visible to all other processes in the same order, else data could be lost. "Writes-follow-reads", a.k.a. "session causality" ensures that writes are ordered after writes that were observed by previous read ops. For example, if <em>write(x, V2)</em> is ordered after <em>read(x)</em> which returned <em>V1</em>, <em>write(x, V2)</em> must be ordered after <em>write(x, V1)</em>.

Combining monotonic reads monotonic writes, and read-own-writes gives "Pipelined RAM" (PRAM) consistency, or "FIFO" consistency. PRAM guarantees that write ops originating from one process will propagate to other processes in the same order in which the originating process executed them.

---

### Eventual Consistency

Synchronization is expensive in distributed systems. As discussed above, we can relax consistency guarantees and use a model that allows some divergence between nodes, such as sequential consistency. Eventual consistency propagates updates through the system asynchronously. If there are no additional updates performed against the data item, eventually all accesses return the latest value. Conflicts are often resolved using one of the techniques described above.

#### Tunable Consistency

Following CAP principles, we can tune our eventual consistency with three parameters:

- Replica factor <em>N</em> - the number of nodes / amount of replication
- Write consistency <em>W</em> - the number of nodes that have to acknowledge a write for it to succeed
- Read consistency <em>R</em> - the number of nodes that have to respond to a read operation for it to succeed

Choosing levels where <em>R + W > N</em> helps reduce the chance of stale reads by forcing read and write quorums to overlap. Write-heavy systems sometimes pick <em>W = 1</em> and <em>R = N</em>, which allows writes to be acknowledged by just one node, but requires all replicas to be available for reads. Increasing <em>W</em> or <em>R</em> increases latency and raises requirements for node availability. Decreasing them improves system availability while sacrificing consistency.

A level of <em>floor(N / 2) + 1</em> is called a "quorum", or majority of votes. In a system with <em>2f + 1</em> nodes, the system can keep responding even when up to <em>f</em> become unavailable. This does not, however, guarantee monotonicity in cases of incomplete writes.

#### Witness Replicas

Witness replicas offer a solution for improving storage costs. Instead of storing a copy of the record on each replica, we split replicas into "copy" and "witness" subsets. Copy replicas still hold data records like normal. Under normal circumstances, witness replicas merely store a record indicating that the write occurred. However, witness replicas can sometimes be upgraded if enough copy replicas have failed or timed out.

Having <em>n</em> copies and <em>m</em> witnesses gives the same availability guarantees as having <em>n + m</em> copies, assuming:

- Read and write ops are performed using quorums
- At least one of the replicas in the quorum is a copy replica

Witness replicas help reduce storage costs while preserving consistency.

---

### Strong Eventual Consistency and CRDTs

Under strong eventual consistency, updates are allowed to propagate to servers late or out of order, but when all updates finally propagate to target nodes, conflicts between them can be resolved and they can be merged to produce the same valid state. Under some conditions, we can relax our consistency requirements by allowing operations to preserve additional state that allows the diverged states to be reconciled (merged) after execution. This is often implemented with Conflict-Free Replicated Data Types (CRDTs), as in the case of Redis. CRDTs are specialized data structures that preclude the existence of conflicts and allow ops to be applied in any order without changing the results. They are extremely useful in distributed systems and are often used in eventually consistent systems.

The simplest CRDTs are operations-based Commutative Replicated Data Types (CmRDTs), which require ops to be side-effect free, commutative, and causally ordered. Another example is the unordered Grow-Only Set (G-Set), which supports additions and merges. A more complex example is Martin Kleppmann's conflict-free replicated JSON data type, which allows modifications on deeply nested JSON documents.

---

### Other Resources

Martin Kleppmann gave a great talk called "CRDTs and the Quest for Distributed Consistency" at QCon in 2018.

<iframe
    src="https://www.youtube.com/embed/B5NULPSiOGw?si=R3yVS5-JATjZ_bRL"
    title="Video - CRDTs and the Quest for Distributed Consistency"
    allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrer-policy="strict-origin-when-cross-origin"
    allow-full-screen="true"
    loading="lazy"
    style="width:100% !important"
></iframe>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
