---
title: Database Internals Ch. 7 - Log-Structured Storage
description: Notes on Chapter 7 of Database Internals by Alex Petrov. Log-Structured Storage and LSM Trees.
published: March 1, 2026
updated: March 1, 2026
minutesToRead: 7
path: /articles/database-internals-chapter-7/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 7 - Log-Structured Storage
  shortDescription: Log-Structured Storage and LSM Trees.
  order: 7
---

## Database Internals - Ch. 7 - Log-Structured Storage

<p class="subtitle">6 minute read • March 1, 2026</p>

This post contains my notes on Chapter 7 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

As discussed in previous chapters, in-place update storage structures are optimized for read performance, while append-only structures are optimized for write performance. Log-structured storage (LSS) takes advantage of this simple fact. LSS is used everywhere: from the flash translation layer, to filesystems and database systems.

### LSM Trees

The Log-Structured Merge-Trees (LSM Trees) is one of the most popular immutable on-dick storage structures. It uses buffering and append-only storage to achieve sequential writes. Immutable files are written and merged over time. These immutable files have higher density and are optimized for sequential writes. Since the number of files steadily grows, LSM Trees have to merge and rewrite files to minimize the number of files that have to be read when accessing records.

#### LSM Tree Structure

LSM Trees consist of smaller memory-resident and larger disk-resident components. To write immutable file contents on disk, the contents must first be buffered and sorted. A memory-resident and mutable "memtable" component serves as a buffer for read and write operations without I/O costs. Its contents are persisted to disk when it hits a configurable size threshold. A separate <a href="https://noahtigner.com/articles/database-internals-chapter-5/#recovery" target="_blank" rel="noopener">WAL</a> is used to guarantee durability. B-Trees are often used for the internal indexing inside of LSM files.

Buffering is done in-memory, meaning all reads and write ops are applied to memory-resident sorted data structures such as a tree. Disk-resident components are built by flushing buffered contents. They are only ever used for reads, simplifying read & write logic.

Two-Component LSM Trees have only one disk component, comprised of immutable segments. One possible implementation for the disk component is to organize it as a B-Tree with 100% occupancy and read-only pages.

Multi-Component LSM Trees have more than one disk-resident table. Entire memtable contents are flushed in a single run. Compaction is done to merge memtables and keep their numbers to a minimum.

Memtable flushes can be triggered periodically or with a size threshold. Before a memtable can be flushed, it must be "switched", meaning that a new memtable is allocated and it becomes the target for all new writes while the old one begins flushing. When memtable contents are fully flushed, the log can be "trimmed".

#### Updates and Deletes

Inserts, updates, and deletes on LSM Trees don't require locating data records on disk. Instead, redundant records are reconciled during the read. Deletes need to be recorded explicitly with "tombstones" delete markers. The reconciliation process picks up these tombstones and filters out shadowed values. "Range tombstones" are used when a set of records are deleted.

#### Merge-Iteration

Since the contents of disk-resident tables are sorted, we can use a multi-way merge sort algorithm. The algorithm uses a priority queue (PQ) data structure such as a min-heap.

#### Reconciliation

Since different tables might hold different records for the same key, our PQ must allow multiple values associated with the same key, and must trigger the reconciliation process. This process is responsible for determining which record takes precedence, and for calculating the resultant values appropriately.

#### Maintenance in LSM Trees

"Leveled compaction" is a strategy that separates disk-resident tables into levels, each with a target size and identifier. As soon as the number of tables on a level hits its threshold, tables from the current level are merged with tables on the next level (that hold overlapping key ranges). Size grows exponentially between levels. The "freshest" data is kept on the level with the lowest index, and older data is gradually migrated to higher levels.

"Size-tiered compaction" is another popular compaction strategy. Rather than grouping disk-resident tables based on their level, they're grouped by size. Level 0 holds the smallest tables that were either flushed from memtables or created by the compaction process. When tables are compacted, the merged results are written to the level holding tables with the corresponding sizes. This process continues recursively, with tables being compacted and promoted or demoted between levels. One issue with this approach is the possibility of "table starvation", in which case we have to force compaction for a level.

---

### Read, Write, and Space Amplification

When implementing an optimized compaction strategy, we have to take multiple factors into consideration. The three main problems are:

- Read amplification - caused by having to reference multiple tables to retrieve data.
- Write amplification - caused by continuous rewrites due to the compaction process.
- Space amplification - caused by storing multiple records for the same key.

One approach is to reclaim space used by overhead and duplicated records, which results in higher write amplification due to needing to read and rewrite records more often. An alternative approach is to avoid continuous rewrites, increasing read amplification and space amplification.

#### RUM Conjecture

The RUM Conjecture is a cost model for calculating read, update, and memory overhead. It states that reducing any two of these overheads negatively impacts the third, and optimizations always come at the cost of one of the three. As discussed in previous chapters, B-Trees are read-optimized while LSM Trees are write-optimized.

---

### Implementation Details

The book now discusses details common to many real-world LSM Tree implementations.

#### Sorted String Tables

Disk-resident tables are often implemented with Sorted String Tables (SSTs), where data is laid out in key-sorted order. They usually consist of two components: index files and data files. Index files are usually implemented with B-Trees or hash tables. The data consists of concatenated key-value pairs.

#### Bloom Filters

Read amplification on LSM trees is caused by needing the check multiple disk-resident tables during reads, since we don't always know whether or not a disk-resident table contains the searched key. This situation can be improved with a Bloom Filter, a space efficient probabilistic data structure that can be used to determine whether a set contains an element or not. They can produce false-positives (telling us that an item is part of a set when it is not), but they cannot produce false-negatives (telling us an item is not part of a set when it is). We can therefore use them to check if a table <em>might</em> contain the searched key, or if it <em>definitely</em> does not. They are constructed using a large bit array and multiple hash functions. The larger the bit set, the lower the probability of false-positives.

#### Skiplist

The Skiplist is a data structure used for keeping sorted data in memory. They are less complex than B-Trees (closer to a linked-list), but are less cache-friendly. Apache Cassandra uses them for secondary index memtables, and WiredTiger uses them for some in-memory operations.

#### Disk Access

Many techniques in <a href="https://noahtigner.com/articles/database-internals-chapter-5/#buffer-management" target="_blank" rel="noopener">buffer management</a> are also applicable to LSM Trees, since most table contents are disk-resident and most storage devices allow blockwise data accesses. The biggest difference is that in-memory contents are immutable and therefore require no additional locks or latches for concurrent accesses.

#### Compression

many of the ideas in <a href="https://noahtigner.com/articles/database-internals-chapter-4/#compression" target="_blank" rel="noopener">B-Tree compression</a> apply to LSM Trees too. The main difference here is that tables are immutable and written in a single pass. To be able to address compressed pages, we need an indirection layer which stores offsets and sizes of compressed pages.

---

### Unordered LSM Storage

#### Bitcask

#### WiscKey

---

### Concurrency in LSM Trees

---

### Log Stacking

#### Flash Translation Layer

#### Filesystem Logging

---

### LLAMA and Mindful Stacking

#### Open-Channel SSDs

---

### Other Resources

Ben Dicken of PlanetScale has a video on Copy-on-Write, as well as a video recapping the entire chapter.

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/Iwfe5d-DlVU?si=Tr34Rf2Kz0FAVUPa"
        title="Video - Using CoW in Unix processes and database B-trees (Copy-on-Write)"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/HqtakVHkYYU?si=PDfPXMSJBO7hPNzq"
        title="Video - Buzzword trees, Copy-on-Write, and more! (Database Internals chapter 6)"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
