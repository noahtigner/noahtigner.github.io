---
title: Database Internals Ch. 1 - Introduction & Overview
description: Notes on Chapter 1 of Database Internals by Alex Petrov. OLTP vs. OLAP, Memory vs. Disk-Based Storage, Row vs. Column Orientation, Indexing, etc.
published: January 31, 2026
updated: February 2, 2026
minutesToRead: 5
path: /articles/database-internals-chapter-1/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 1 - Introduction & Overview
  shortDescription: OLTP vs. OLAP, Memory vs. Disk-Based Storage, Row vs. Column Orientation, Indexing, etc.
  order: 1
---

## Database Internals - Ch. 1 - Introduction & Overview

<p class="subtitle">5 minute read • January 31, 2026</p>

This post contains my notes on Chapter 1 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. The chapter provides an overview of DBMS architecture, storage engine tradeoffs and considerations, and a brief summary of things to come in later chapters. Ben Dicken of PlanetScale recorded a <a href="https://www.youtube.com/live/HibHalGlIes?si=at8Pf0qPTGNp3Vv0" target="_blank" rel="noopener">great summary of the chapter</a>. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

Database Management Systems typically fall into one of three buckets:

- Online Transaction Processing (OLTP), which handles lots of user-facing requests. Queries are often predefined and short-lived.
- Online Analytical Processing (OLAP), which handles complex aggregations used for analytics, data warehousing, etc. Best for complex, long-running, ad-hoc queries.
- Hybrid Transactional and Analytical Processing (HTAP), which are unified systems that mix OLTP and OLAP techniques.

### DBMS Architecture

DBMS use client/server architectures where applications are clients and nodes (db instances) are the servers. Concerns are typically separated as follows:

- Client requests (queries) arrive through the transport system
- The transport subsystem gives queries to the query processor which parses, interpolates, and validates queries. Later, access control checks are performed
- Parsed queries are passed to the query optimizer, which creates a query execution plan
- The execution engine executes the execution plan (duh) and aggregates the results of both local and remote operations
- The storage engine executes local queries, and consists of:
  - A transaction manager
  - A lock manager
  - Access methods (storage structures, i.e., B-Trees)
  - A buffer manager, which caches data pages in-memory
  - A recovery manager, which maintains the operations logs and handles recoveries

### Memory vs. Disk-Based DBMS

In-memory, or "main memory," systems store data primarily in memory and use disks for recovery and logging. Disk-based systems hold most data on disk and use memory for caching. Memory is much faster than disk, and although it is getting cheaper, it is still much more expensive. Memory is also volatile (less durable).

#### Durability in Memory-Based Stores

Memory-based systems back up data to disks based on the operations logs. These updates are often asynchronous and batched. This is where snapshotting and checkpointing come into play. In general, in-memory stores are better for variable-sized data (variable number of fields per record, sparse datasets, etc.).

---

### Column vs. Row-Oriented DBMS

Both Row and Column-oriented layouts have their tradeoffs. To assess which layout meets your needs, you need to assess your access patterns.

#### Row-Oriented Data Layout

Examples of row-oriented DBMS include MySQL and Postgres. This layout is akin to tabular data representations (think spreadsheets). Since data is often accessed by row, storing entire rows together helps with spatial locality. This layout is less optimal when fetching individual fields of many records, i.e., the phone number of every user in the table.

#### Column-Oriented Data Layout

Column-oriented systems partition data vertically instead of horizontally. This layout is best for analytical workloads. Data can still be organized in a tabular manner, but values of the same column are stored closely together.

#### Wide Column Stores

Wide Column Stores are essentially maps with grouped column "families". Inside each column family, data is stored row-wise. This layout is best for retrieving data by key.

---

### Data Files and Index Files

There are several reasons why specialized file organizations are used over flat files:

- storage efficiency
- access efficiency
- update efficiency

Indexes are auxiliary data structures used to efficiently find records without scanning the entire table every time. They are built using a subset of fields which identify their corresponding records.

Index files are typically separated from data files and are usually smaller. Both kinds of files are partitioned into pages, typically the size of one or more disk blocks.

Tombstones are used to mark data for garbage collection rather than removing deleted records synchronously.

#### Data Files

Data files can be implemented in one of three ways:

- index-organized files (IOT files), which store records in indexes themselves, are stored in key-order, and can easily be range-scanned
- heap-organized files (heap files), which don't require ordering but require additional indexes for searching
- hash-organized files (hash files), which store records in keyed buckets

#### Index Files

Indexes are data structures that organize records on disk for efficient retrieval operations. Primary indexes are indexes on the primary data file, typically built on primary keys. These files can be clustered or unclustered.

#### Primary Index as an Indirection

There is ongoing debate over whether records should be referenced directly through file offsets or via primary key indexes. Direct reference requires fewer disk seeks, but data updates require pointer updates, as does routine maintenance. Indirection reduces the cost of pointer updates but results in higher read costs.

---

### Buffering, Immutability, and Ordering

Storage structures have to make three broad decisions: whether or not to support buffering (or to what extent), whether data is mutable or immutable, and whether values should be stored in order or not.

The choice to support buffering dictates whether a certain amount of data should be collected in memory before being written to disk.

Data immutability means that records must be append-only or copy-on-write (replaced on each update). Mutability, on the other hand, means that data can be modified in place.

The final decision is whether or not records should be stored in keyed order on disk, with tradeoffs in both cases.

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
