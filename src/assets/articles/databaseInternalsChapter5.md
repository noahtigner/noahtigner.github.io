---
title: Database Internals Ch. 5 - Transaction Processing and Recovery
description: Notes on Chapter 5 of Database Internals by Alex Petrov. Transaction Processing and Recovery in Database Management Systems.
published: February 26, 2026
updated: February 26, 2026
minutesToRead: 7
path: /articles/database-internals-chapter-5/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
---

## Database Internals - Ch. 5 - Implementing B-Trees

<p class="subtitle">7 minute read • February 26, 2026</p>

This post contains my notes on Chapter 5 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. The chapter discusses transactions, concurrent transaction processing, serialization, locks and latches, and recovery techniques. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

Transactions are the indivisible logical unit of work in database management systems. They allow us to represent multiple operations in a single step. ACID is one of the most important and misunderstood concepts related to databases. Although <a href="https://youtu.be/5ZjhNTM8XU8?si=0UhNZayIeCPkvrhR" target="_blank" rel="noopener">Martin Kleppmann and others have raised concerns over the assumptions we make with ACID</a>, it is still an important concept to learn. In short, ACID means:

1. Atomicity - transactions are indivisible, meaning all-or-nothing. All steps within a transaction are either committed (applied) or aborted (rolled back and possibly retried).
2. Consistency - an app-specific guarantee (controlled by the app, not the DBMS); each transaction brings the DB from one valid state to another with all constraints and rules intact.
3. Isolation - concurrent transactions can execute without interference.
4. Durability - once a transaction has been committed, all db state must be persisted to disk in order to survive system failures, restarts, etc.

There are several components required to manage transactions:

- lock manager - guards access to resources and prevents concurrent accesses that would violate data integrity
- page cache - serves as intermdiary between persistant storage and the rest of the storage enginer. All changes to the db state are applied here first.
- log manager - holds a history of the operations applied to cached pages that are not yet synced with persistant storage. This guarantees that operations won't be lost in case of crashes. It is also referenced when aborting transactions.

### Buffer Management

Most databases use a 2-level memory hierarchy; slower persistant storage (disk) and faster main memory (RAM). Pages are cached in-memory to reduce the number of disk accesses (sometimes called "virtual disk" or the "buffer pool"). Uncached pages are "paged in" when they get loaded from disk. When a change is made to a cached page, it becomes "dirty" until "flushed" back to disk. When a new page is added to an already full page cache, one of the cached pages must be "evicted".

#### Caching Semantics

Synchronization between memory and disk is a one-way process - all changes made to buffers are kept in memory until they are eventually written back to disk. This abstracts disk accesses and decouples logical writes from physical ones.

#### Cache Eviction

Since page cache capacity is limited, we have to evict pages eventually. Dirty pages have to be flushed before they can be evicted. If a page is referenced by an active thread or "pinned" for later, it should not be evicted.

In order to ensure durability, we have to minimize the likelihood that un-flushed data is lost on crash. The checkpoint process helps by controlling the write-ahead log (WAL) and page cache. Dirty pages cannot be evicted until the operations that were applied to the page are persisted on disk and the logs are removed from the WAL. There is a tradeoff between several objectives:

- we want to postpone flushes to reduce the number of disk accesses
- we want to preemptively flush pages to allow quick eviction
- we want to pick pages for eviction and flush them in the optimal order
- we must keep the cache size within memory bounds
- we must avoid losing data while it is not persisted to primary storage

#### Locking Pages in Cache

Since B-Trees are narrower the higher we go, higher nodes are more likely to be cache-hits. We can "lock" or "pin" nodes that have a high probability of being used in the near future. By pinning higher nodes, we can reduce the minimum number of disk accesses needed during a query (otherwise it is `h`, where `h` is the tree's height). We can also batch multiple operations (from a primary storage write perspective) by buffering changes to the cached pages and in-memory, and committing these changes to disk in a single write.

#### Page Replacement

We need to avoid evicting pages that are likely to be re-loaded within the near future. This strategy gets defined by our "eviction policy" algorithm. It attempts to find pages that are least likely to be accessed again soon.

##### FIFO

First-In First-Out (FIFO) is the most naive page-replacement strategy. It maintains a queue of page IDs in insertion order, enqueueing new elements from the tail and dequeueing elements from the head when full. It is usually impractical for real-world systems.

##### LRU

Least-Recently Used (LRU) and variants such as 2Q-LRU and LRU-K are extensions of FIFO that use one or more queues, with a main queue holding elements in insertion order, but allowing repeated accesses to cause entries to be moved back to the queue's tail (and retained for later). This results in more cache hits than FIFO but more maintanence overhead.

##### CLOCK

CLOCK is a variant of LRU that uses a circular buffer of access hits or counters. The algorithm loops around the buffer, incrementing bits when the associated page is accessed, and marking the associated page as a removal candidate if the counter or bit is already 0. It is compact, cache-friendly, and concurrent at the cost of precision.

##### LFU

Least-Frequently Used (LFU) tracks page references instead of page-in events. TinyLFU uses 3 caches: admission (LRU), probation, and protected. Items get promoted or demoted between the 3 caches. More frequently accessed items have a higher chance of retention, and less frequently used items are more likely to be evicted.

---

### Recovery

The WAL is an append-only auxiliary on-disk structure used for crash and transaction recovery. It has several functions:

- it allows the page cache to buffer updates to disk-resident pages while ensuring durability
- it persists all ops on disk until cached copies of pages affected by these ops are synced on disk
- it allows lost in-mem changes to be reconstructed from the operation log in case of crash

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

- "dirty" reads - when a transaction reads uncommitted changes from other transactions
- non-repeatable "fuzzy" reads - when a transaction queries the same row twice and gets different results
- "phantom" reads - when a transaction queries a set of rows twice and gets different results (the range-query equivalent of a fuzzy read)

Write anomalies include:

- "lost" updates - when two transactions attempt to update the same value and the second transaction has no knowledge of the first and overwrites its updates without taking its updates into account
- "dirty" writes - when a transaction takes an uncommitted value (dirty read) and modifies and saves it
- write "skew" - when each individual transaction in a set respects the invariants, but the combination of the transactions does not

#### Isolation Levels

<!-- TODO: table -->

#### Optimistic Concurrency Control

#### Multiversion Concurrency Control

#### Pessimistic Concurrency Control

#### Lock-Based Concurrency Control

---

### Other Resources

Ben Dicken of PlanetScale released videos comparing cache eviction algorithms for page caches, the WAL, and deadlocks.

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/ofoz6wwz2p0?si=Gd6UiMu3GSFWUD75"
        title="Video - FAST data loading. Bulk-loading techniques for B-trees."
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/s3hKYMOpp3E?si=rX86N_dO7rtZR_HB"
        title="Video - FAST data loading. Bulk-loading techniques for B-trees."
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

<iframe
    src="https://www.youtube.com/embed/8-MTNO0XXlU?si=gER61qyRt8Wu9Wb1"
    title="Video - FAST data loading. Bulk-loading techniques for B-trees."
    allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrer-policy="strict-origin-when-cross-origin"
    allow-full-screen="true"
    loading="lazy"
    style="width:100% !important"
></iframe>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
