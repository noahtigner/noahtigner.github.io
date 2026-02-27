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

#### Log Semantics

#### Operation Versus Data Log

#### Steal and Force Policies

#### ARIES

---

### Concurrency Control

#### Serializability

#### Transaction Isolation

#### Read and Write Anomalies

#### Isolation Levels

#### Optimistic Concurrency Control

#### Multiversion Concurrency Control

#### Pessimistic Concurrency Control

#### Lock-Based Concurrency Control

---

### Other Resources

Ben Dicken of PlanetScale released a video discussing bulk-loading techniques for B-Trees.

<iframe
    src="https://www.youtube.com/embed/b2JHybcmY34?si=0JlgipCsqc9ykAop"
    title="Video - FAST data loading. Bulk-loading techniques for B-trees."
    allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrer-policy="strict-origin-when-cross-origin"
    allow-full-screen="true"
    loading="lazy"
    style="width:100% !important"
></iframe>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
