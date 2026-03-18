---
title: Database Internals Ch. 5 - Transaction Processing & Recovery
description: Notes on Chapter 5 of Database Internals by Alex Petrov. Transaction Processing and Recovery in Database Management Systems.
published: February 27, 2026
updated: March 18, 2026
minutesToRead: 12
path: /articles/database-internals-chapter-5/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 5 - Transaction Processing & Recovery
  shortDescription: Transaction Processing and Recovery in Database Management Systems.
  order: 5
---

## Database Internals - Ch. 5 - Transaction Processing and Recovery

<p class="subtitle">12 minute read • February 27, 2026</p>

This post contains my notes on Chapter 5 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. The chapter discusses transactions, concurrent transaction processing, serialization, locks and latches, and recovery techniques. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Introduction

Transactions are the indivisible logical unit of work in database management systems. They allow us to represent multiple operations in a single step. ACID is one of the most important and misunderstood concepts related to databases. Although <a href="https://youtu.be/5ZjhNTM8XU8?si=0UhNZayIeCPkvrhR" target="_blank" rel="noopener">Martin Kleppmann and others have raised concerns over the assumptions we make with ACID</a>, it is still an important concept to learn. In short, ACID means:

1. Atomicity - transactions are indivisible, meaning all-or-nothing. All steps within a transaction are either committed (applied) or aborted (rolled back and possibly retried).
2. Consistency - an app-specific guarantee (controlled by the app, not the DBMS); each transaction brings the DB from one valid state to another with all constraints and rules intact.
3. Isolation - concurrent transactions can execute without interference.
4. Durability - once a transaction has been committed, all db state must be persisted to disk in order to survive system failures, restarts, etc.

There are several components required to manage transactions:

- Lock manager - guards access to resources and prevents concurrent accesses that would violate data integrity
- Page cache - serves as an intermediary between persistent storage and the rest of the storage engine. All changes to the DB state are applied here first.
- Log manager - holds a history of the operations applied to cached pages that are not yet synced with persistent storage. This guarantees that operations won't be lost in case of crashes. It is also referenced when aborting transactions.

---

### Buffer Management

Most databases use a 2-level memory hierarchy: slower persistent storage (disk) and faster main memory (RAM). Pages are cached in memory to reduce the number of disk accesses (sometimes called "virtual disk" or the "buffer pool"). Uncached pages are "paged in" when they get loaded from disk. When a change is made to a cached page, it becomes "dirty" until "flushed" back to disk. When a new page is added to an already full page cache, one of the cached pages must be "evicted".

#### Caching Semantics

Synchronization between memory and disk is a one-way process - all changes made to buffers are kept in memory until they are eventually written back to disk. This abstracts disk accesses and decouples logical writes from physical ones.

#### Cache Eviction

Since page cache capacity is limited, we have to evict pages eventually. Dirty pages have to be flushed before they can be evicted. If a page is referenced by an active thread or "pinned" for later, it should not be evicted.

In order to ensure durability, we have to minimize the likelihood that un-flushed data is lost on crash. The checkpoint process helps by controlling the write-ahead log (WAL) and page cache. Dirty pages cannot be evicted until the operations that were applied to the page are persisted on disk and the logs are removed from the WAL. There is a tradeoff between several objectives:

- Postpone flushes to reduce the number of disk accesses
- Preemptively flush pages to allow quick eviction
- Pick pages for eviction and flush them in the optimal order
- Keep the cache size within memory bounds
- Avoid losing data while it is not persisted to primary storage

#### Locking Pages in Cache

Since B-Trees are narrower the higher we go, higher nodes are more likely to be cache-hits. We can "lock" or "pin" nodes that have a high probability of being used in the near future. By pinning higher nodes, we can reduce the minimum number of disk accesses needed during a query (otherwise it is `h`, where `h` is the tree's height). We can also batch multiple operations (from a primary storage write perspective) by buffering changes to the cached pages and in-memory, and committing these changes to disk in a single write.

#### Page Replacement Algorithms

We need to avoid evicting pages that are likely to be re-loaded within the near future. This strategy gets defined by our "eviction policy" algorithm. It attempts to find pages that are least likely to be accessed again soon.

- First-In First-Out (FIFO) is the most naive page-replacement strategy. It maintains a queue of page IDs in insertion order, enqueueing new elements from the tail and dequeueing elements from the head when full. It is usually impractical for real-world systems.
- Least-Recently Used (LRU) and variants such as 2Q-LRU and LRU-K are extensions of FIFO that use one or more queues, with a main queue holding elements in insertion order, but allowing repeated accesses to cause entries to be moved back to the queue's tail (and retained for later). This results in more cache hits than FIFO but more maintenance overhead.
- CLOCK is a variant of LRU that uses a circular buffer of access hits or counters. The algorithm loops around the buffer, incrementing bits when the associated page is accessed, and marking the associated page as a removal candidate if the counter or bit is already 0. It is compact, cache-friendly, and concurrent at the cost of precision.
- Least-Frequently Used (LFU) tracks page references instead of page-in events. TinyLFU uses 3 caches: admission (LRU), probation, and protected. Items get promoted or demoted between the 3 caches. More frequently accessed items have a higher chance of retention, and less frequently used items are more likely to be evicted.

---

### Recovery

The WAL is an append-only auxiliary on-disk structure used for crash and transaction recovery. It has several functions:

- It allows the page cache to buffer updates to disk-resident pages while ensuring durability
- It persists all ops on disk until cached copies of pages affected by these ops are synced on disk
- It allows lost in-memory changes to be reconstructed from the operation log in case of crash

#### Log Semantics

The WAL consists of sequentially written records, each with a unique monotonically increasing Log Sequence Number (LSN). Log records are cached on the log buffer and are flushed to disk in a "force" operation. Records must be flushed to disk in LSN order. Compensation Log Records (CLRs) can be used during undo to ensure correctness during rollback and recovery after a crash. The WAL is usually coupled with a primary storage structure by the interface that allows "trimming" it whenever a "checkpoint" is reached. Checkpoints tell the log system that log records up to a certain point aren't required anymore. "Fuzzy checkpointing" allows this to happen asynchronously and is a more practical approach.

#### Operation Versus Data Log

We can use a physical log that stores complete page state or byte-wise changes to it or a logical log that stores ops that have to be performed against the current state. Physical logging records before and after images, requiring the entire affected page to be logged. A logical log specifies which ops have to be applied, and a corresponding undo operation. In practice, we often use logical logging to perform an undo (for concurrency and performance) and physical logging to perform a redo (to improve recovery time).

#### Steal and Force Policies

A "steal" policy is a recovery method that allows flushing a page modified by the transaction even before the transaction is committed. A "no-steal" policy, on the other hand, does not allow flushing any uncommitted transaction contents on disk. "Force" policies require all pages modified by the transactions to be flushed on disk before the transaction commits. "No-force" policies allow transactions to commit even if some of the pages modified during the transaction were not yet flushed.

#### ARIES

The <a href="https://en.wikipedia.org/wiki/Algorithms_for_Recovery_and_Isolation_Exploiting_Semantics" target="_blank" rel="noopener">Algorithm for Recovery and Isolation Exploiting Semantics</a> (ARIES) is a steal & no-force policy that uses physical redo and logical undo.

---

### Concurrency Control

Concurrency control is a set of techniques for handling interactions between concurrently executing transactions. They can be grouped into three buckets:

- Optimistic Concurrency Control (OCC)
- Pessimistic Concurrency Control (PCC)
- Multiversion Concurrency Control (MVCC)

#### Serializability

A "schedule" is a list of ops required to execute a set of transactions from the db's perspective. A schedule is "complete" if it contains all ops from every transaction executed in it. It is "serial" when transactions are executed independently and in serial (one after the other). "Serializable" schedules allow us to execute transactions concurrently while maintaining the correctness of a serial schedule.

#### Transaction Isolation

Isolation levels specify how and when parts of the transaction should become visible to other concurrent transactions.

#### Read and Write Anomalies

Read anomalies include:

- "Dirty" reads - when a transaction reads uncommitted changes from other transactions
- Non-repeatable "fuzzy" reads - when a transaction queries the same row twice and gets different results
- "Phantom" reads - when a transaction queries a set of rows twice and gets different results (the range-query equivalent of a fuzzy read)

Write anomalies include:

- "Lost" updates - when two transactions attempt to update the same value and the second transaction has no knowledge of the first and overwrites its updates without taking its updates into account
- "Dirty" writes - when a transaction takes an uncommitted value (dirty read) and modifies and saves it
- Write "skew" - when each individual transaction in a set respects the invariants, but the combination of the transactions does not

#### Isolation Levels

|                  | Dirty   | Non-Repeatable | Phantom |
| ---------------- | ------- | -------------- | ------- |
| Read Uncommitted | Allowed | Allowed        | Allowed |
| Read Committed   | -       | Allowed        | Allowed |
| Repeatable Read  | -       | -              | Allowed |
| Serializable     | -       | -              | -       |

<p class="subtitle">Isolation levels and allowed anomalies</p>

Snapshot isolation allows transactions to read changes from other transactions that were committed by the time the transaction started. Each transaction takes a snapshot of data and executes queries against it, rolling back if the values modified changed during execution (before the changes were committed). This prevents lost update anomalies but does not prevent write skew.

#### Optimistic Concurrency Control

Optimistic Concurrency Control (OCC) assumes that transaction conflicts are rare. Instead of locking and blocking transaction execution, we ensure serializability before committing results. There are three phases:

1. the read phase - finds the "read set" (transaction dependencies) and the "write set" (transaction side-effects).
2. the validation phase - determines if committing the transaction preserves ACID properties. If not, the process is restarted from the read phase.
3. the write phase - the write set is committed.

#### Multiversion Concurrency Control

Multiversion Concurrency Control (MVCC) is a way of achieving transaction consistency by allowing multiple record versions and using monotonically increasing IDs or timestamps. This allows reads and writes with minimal coordination on the storage level. MVCC is often used for implementing snapshot isolation.

#### Pessimistic Concurrency Control

With Pessimistic Concurrency Control (PCC), transaction conflicts are determined while they're running and get blocked or aborted. It can be implemented with simple timestamp ordering, where max read and write timestamps are maintained and referenced.

#### Lock-Based Concurrency Control

Lock-based concurrency control schemes are a form of PCC that use locks on db objects instead of using concurrency control to resolve schedules. Downsides include contention and scalability issues. Two-phase locking (2PL) is a common approach.

When locks are introduced into the system we must consider and handle deadlocks. Strategies exist such as timeouts and "Conservative 2PL", but they limit concurrency. Typically, DBMS use a transaction manager to detect and avoid deadlocks. This is usually done with a "waits-for" graph. Cycles in the graph represent deadlocks. Detection can be done periodically or continuously. Transaction managers typically prioritize older transactions.

Locks are used to isolate and schedule overlapping transactions and manage DB contents, but not internal storage structures. They can guard either a single key or a set of keys, and are stored outside of the tree and managed by the DB lock manager. Latches, on the other hand, guard physical representations - tree structure and page contents. Since a modification on a leaf level might propagate up to higher levels, latches might have to be obtained on multiple levels. To increase concurrency, latches should be held for the smallest possible duration. Readers-Writes Locks (RWLs) allow multiple concurrent readers access to an object, with only writers needing to obtain exclusive access. "Latch crabbing" is a simple and optimistic method that allows holding latches for less time and releasing them as soon as it's clear that the executing operation doesn't need them anymore.

B<sup>link</sup>-Trees, which use <a href="https://noahtigner.com/articles/database-internals-chapter-4/#node-high-keys" target="_blank" rel="noopener">high keys</a> and <a href="https://noahtigner.com/articles/database-internals-chapter-4/#sibling-links" target="_blank" rel="noopener">sibling links</a>, allow a state called a "half-split". This approach can reduce contention and simplify concurrent access while reducing the number of locks held during tree state modifications. More importantly, it allows reads concurrent to structural tree changes and helps prevent deadlocks.

---

### Other Resources

Ben Dicken of PlanetScale released videos comparing cache eviction algorithms for page caches, the WAL, and deadlocks.

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/ofoz6wwz2p0?si=Gd6UiMu3GSFWUD75"
        title="Video - Caching algorithms (LIFO vs LRU vs CLOCK)"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/s3hKYMOpp3E?si=rX86N_dO7rtZR_HB"
        title="Video - Write-Ahead Logs. The secret to fast database queries."
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

<iframe
    src="https://www.youtube.com/embed/8-MTNO0XXlU?si=gER61qyRt8Wu9Wb1"
    title="Video - Killing transactions in databases (deadlock detection and resolution)"
    allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrer-policy="strict-origin-when-cross-origin"
    allow-full-screen="true"
    loading="lazy"
    style="width:100% !important"
></iframe>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
