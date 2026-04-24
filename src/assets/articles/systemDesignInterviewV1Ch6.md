---
title: System Design Interview Vol. 1 Ch. 6 - Design a Key-Value Store
description: Notes on Chapter 6 of System Design Interview by Alex Xu. Considerations when designing a highly available distributed key-value store.
published: April 24, 2026
updated: April 24, 2026
minutesToRead: 10
path: /articles/system-design-interview-volume-1-chapter-6/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 6 - Design a Key-Value Store
  shortDescription: Considerations when designing a highly available distributed key-value store.
  order: 6
---

<p class="subtitle">10 minute read • April 24, 2026</p>

This post contains my notes on Chapter 6 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

This chapter touches on many of the concepts covered in <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov.
I quote and link to <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals/">my notes on that book</a> several times here.

---

## Introduction

Key-value (KV) stores are non-relational databases that store data as key-value pairs, with each key being some unique identifier.
Keys can either be plain-text or hashed values.
Values can be primitives, lists, objects, etc.

> [!TIP]
> Short keys tend to perform better.

---

## Understand the Problem

At a minimum, our KV store should support the following operations:

- `GET(key)`
- `PUT(key, value)`
- `DELETE(key)`

For this example, our KV store should do the following:

- Expect small (<10 KB) KV pairs
- Support a large quantity of KV pairs
- Be highly available
- Be highly scalable and support auto-scaling
- Have tunable consistency
- Have low latency

---

## Single-Server Key-Value Store

We can easily implement a single-server KV store with an in-memory hash map, which is fast, but may eventually run out of memory.
We can fit more data into our single-server setup by compressing our data, storing "cold" (infrequently read) data on disk and "hot" data in memory, etc.
Even with these optimizations, we can still easily hit our capacity limits.

---

## Distributed Key-Value Store

In its most basic form, a distributed KV store is essentially just a distributed hash map.
It is important to understand the implications of the <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-11/#infamous-cap">CAP Theorem</a> for our system.
Since network failures (and therefore partitions) are unavoidable in distributed systems, we must support partition tolerance.
This pushes us towards either a system that prioritizes consistency and partition tolerance (CP) or a system that prioritizes availability and partition tolerance (AP).

Per the requirements we settled on for this exercise, we should prioritize availability and partition tolerance.
This means that our system could serve stale data, but it will offer lower latency and support increased concurrency.

---

## System Components

### Data Partitioning and Replication

In order for our system to scale, we will need to partition the data across several servers with the help of <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-5/">consistent hashing</a>.
Using consistent hashing to partition the data has two main advantages:

1. Auto-scaling is supported, allowing nodes to be dynamically added and removed as needed
2. Heterogeneity, meaning that the number of virtual nodes for a given server is proportional to the server's capacity

For better reliability, we should distribute replicas across several data centers.
Individual keys should be duplicated across several nodes, starting at the corresponding "primary" point on the hash ring and then being replicated to the next <em>N - 1</em> nodes going clockwise.
Here, <em>N</em> represents the total replication factor.

### Consistency

Since we are optimizing for availability and partition tolerance, we will opt for eventual consistency.

> Following CAP principles, we can tune our eventual consistency with three parameters:
>
> - Replica factor <em>N</em> - the number of nodes / amount of replication
> - Write consistency <em>W</em> - the number of nodes that have to acknowledge a write for it to succeed
> - Read consistency <em>R</em> - the number of nodes that have to respond to a read operation for it to succeed
>
> Choosing levels where <em>R + W > N</em> helps reduce the chance of stale reads by forcing read and write quorums to overlap.
> Write-heavy systems sometimes pick <em>W = 1</em> and <em>R = N</em>, which allows writes to be acknowledged by just one node, but requires all replicas to be available for reads.
> Increasing <em>W</em> or <em>R</em> increases latency and raises requirements for node availability. Decreasing them improves system availability while sacrificing consistency.

<div class="subtitle" style="text-align: center">Notes on <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-11/#tunable-consistency">Tunable Consistency</a> from <em>Database Internals</em> chapter 11</div>

We can optimize for lower read latency by choosing <em>R = 1</em>, usually in combination with a larger <em>W</em>.

### Conflict Resolution

Our choices so far provide high availability but open us up to data inconsistencies.
We can use versioning and vector clocks to help mitigate this issue.
Updates are append-only instead of being made in-place, and causal orderings are established between updates and immutable snapshots of data.

> Establishing causal order allows the system to reconstruct the sequence of events even if messages are delivered out of order, fill the gaps between messages, and avoid publishing operation results in case some messages are still missing.
> A vector clock is a structure for establishing a partial order between the events, detecting and resolving divergences between the event chains.
> We can simulate common time, global time, and represent asynchronous events as synchronous.
> Processes maintain vectors of logical clocks, with one clock per process.

<div class="subtitle" style="text-align: center">Notes on <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-11/#causal-consistency">Causal Consistency</a> from <em>Database Internals</em> chapter 11</div>

This solution improves consistency at the cost of complexity.

### Handling Failures

Node failures are unavoidable when working with distributed systems.
Software can crash, hardware can fail, and networks can experience disruptions.
We need to be able to detect and handle failures.

#### Failure Detection

A common approach to decentralized failure detection is gossip.

> Gossip protocols propagate updates with the reach of a broadcast and the reliability of anti-entropy.
> They are probabilistic communication procedures that work like rumors and diseases in human societies.
> A process that holds info that needs to be spread around is called “infective”, and nodes that haven’t yet received the news are “susceptible”.
> Infective nodes spread the info to random neighbors.
> Gossip can be used for asynchronous message delivery, and is useful in systems with high “churn”, where nodes come and go frequently.

<div class="subtitle" style="text-align: center">Notes on <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-12/#gossip-dissemination">Gossip</a> from <em>Database Internals</em> chapter 12</div>

#### Handling Temporary Failures

> “Hinted handoff” is a write-side repair mechanism.
> If the target node fails to acknowledge the write, the write coordinator or one of the replicas stores a special “hint” record.
> This hint is relayed to the target node as soon as it comes back up.
> Some DBs use “sloppy quorums” alongside hinted handoff.
> Sloppy quorums improve availability at the cost of consistency.

<div class="subtitle" style="text-align: center">Notes on <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-12/#hinted-handoff">Hinted Handoff and Sloppy Quorums</a> from <em>Database Internals</em> chapter 12</div>

#### Handling Permanent Failures

What happens if a node becomes permanently unavailable?
We need an anti-entropy mechanism for discovering inconsistencies.
Merkle Trees are often used to efficiently compare data between replicas.

> Merkle Trees compose a compact hashed representation of the local data, building a tree of hashes.
> The lowest levels of the tree consist of hashes of the table’s record ranges.
> Higher levels consist of hashes of the combined lower-level hashes.
> This allows us to quickly detect inconsistencies by comparing hashes and following the tree nodes recursively to narrow down the inconsistent ranges.
> This can be done by exchanging and comparing entire trees or just subtrees.
> Since these trees are constructed from the bottom-up, entire subtrees must be recomputed when data changes.
> There’s also a tradeoff between tree size and precision.

<div class="subtitle" style="text-align: center">Notes on <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-12/#merkle-trees">Merkle Trees</a> from <em>Database Internals</em> chapter 12</div>

#### Handling Data Center Outages

Although engineered to be extremely resilient, data centers still experience outages.
The solution is to replicate data across data centers (DCs) or zones.
Some go further, opting for a multi-cloud setup that doesn't rely entirely on a single provider.
This introduces significant operational complexity.

---

## System Architecture

<img
  src="/images/system-design-interview/sdi-v1-ch6-1.png"
  alt="Our High-Level System Architecture"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our High-Level System Architecture</p>

The main features of our architecture are:

- A simple API (`GET`, `PUT`, `DELETE`)
- Nodes can temporarily <em>act</em> as the coordinator, proxying requests between clients and nodes in the KV store
- Nodes are distributed on a ring using consistent hashing
- Data is replicated across several nodes
- The system is decentralized and auto-scaling is supported
- Each node has the same set of responsibilities and there is no SPoF

Each node is responsible for:

- The client API
- Failure detection (Gossip)
- Conflict resolution
- The failure repair mechanism
- Replication
- The storage engine

### Writes

When a write is received by a node, it follows these steps:

1. The request is persisted to an append-only log file (commit history)
2. Data is saved to the in-memory cache (memtable)
3. The cache is occasionally flushed to disk, usually as SSTables. When an SSTable is written, a corresponding Bloom filter is constructed for future membership checks in the read path

### Reads

After a read request is routed to a specific node, it follows these steps:

1. Check if the data is in memory, returning the value to the client if so
2. Check the <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-7/#bloom-filters">Bloom Filters</a> to see which SSTables might contain the key
3. Check only the SSTables whose Bloom Filters indicate that the key may be present (Bloom Filters can return false positives)
4. Once the SSTable containing the key has been found, read the data from it, write it to the cache, and return it to the client

### Deletes

Delete operations are not special.
The steps are almost identical to writes, except the value that is written is a special "tombstone" value.
During subsequent reads, if the latest value for the key is one of these tombstones, the system acts like the key was not found at all.
Data is only actually removed during periodic compaction operations.

---

## Summary

Here's a brief recap of the ways this system achieves our goals and solves our problems:

| Goal / Problem              | Technique Used                               |
| --------------------------- | -------------------------------------------- |
| Ability to store big data   | Partitioning with consistent hashing         |
| High availability reads     | Replication and tunable quorums              |
| High availability writes    | Replication, sloppy quorums, hinted handoff  |
| Dataset partitions          | Consistent hashing                           |
| Incremental scalability     | Consistent hashing                           |
| Heterogeneity               | Virtual nodes                                |
| Tunable consistency         | Quorum reads/writes and eventual consistency |
| Handling temporary failures | Hinted handoff and sloppy quorums            |
| Handling permanent failures | Merkle trees and anti-entropy                |
| Handling DC outages         | Cross-DC replication                         |

---

## Other Resources

<iframe
    src="https://www.youtube.com/embed/Dwt8R0KPu7k?si=eB2nV8GIhkEe_ZV1"
    title="Video - How Key value Stores Work (Redis, DynamoDB, Memcached)?"
    allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrer-policy="strict-origin-when-cross-origin"
    allow-full-screen="true"
    loading="lazy"
    style="width:100% !important"
></iframe>

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
