---
title: System Design Interview Vol. 1 Ch. 5 - Consistent Hashing
description: Notes on Chapter 5 of System Design Interview by Alex Xu. Consistent hashing strategies for servers and database shards.
published: April 20, 2026
updated: April 20, 2026
minutesToRead: 6
path: /articles/system-design-interview-volume-1-chapter-5/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 5 - Consistent Hashing
  shortDescription: Consistent hashing strategies for servers and database shards.
  order: 5
---

## System Design Interview - Vol. 1 Ch. 5 - Consistent Hashing

<p class="subtitle">6 minute read • April 20, 2026</p>

This post contains my notes on Chapter 5 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

Although this started as my notes on the _System Design Interview_ chapter, I ended up preferring <a target="_blank" rel="noopener" href="https://www.hellointerview.com/learn/system-design/core-concepts/consistent-hashing">Hello Interview's breakdown</a> for its breadth and depth.

---

### Introduction

When horizontally scaling our API servers or sharding our databases, it becomes important to evenly distribute requests amongst them.
Similarly, it becomes important to distribute requests not only evenly, but consistently.
Requests concerning the same entity should usually be routed to the same database or cache shard, or else that data could become fragmented and inconsistent.
We could query each shard to get a complete picture of the data, but that would defeat the purpose of sharding and could still lead to inconsistencies.
We need an efficient and consistent way of determining which requests map to which servers.

> [!NOTE]
> For the purpose of discussing consistent hashing, I refer to servers, shards, and nodes interchangeably.

---

### The Rehashing Problem

A naive approach would be to hash the key (request ID, user ID, etc.) and modulo it by the number of servers to get the server index; i.e., `server_idx = hash(key) % n`.
This works well if we have a fixed number of servers but breaks down as soon as we add or remove one.

We can see this by comparing the same keys when their hashes are taken modulo a different number of servers.
The resulting server indexes change completely, leading to cache misses, inconsistent reads and writes, and the need to completely redistribute the data.

| IP       | MD5 Hash    | Hash % 4 | Hash % 5 | Moved? |
| -------- | ----------- | -------: | -------: | ------ |
| 10.0.0.1 | 190dafab... |        0 |        1 | yes    |
| 10.0.0.2 | 98a2cd7e... |        0 |        3 | yes    |
| 10.0.0.3 | 00694036... |        2 |        3 | yes    |
| 10.0.0.4 | 678e6a1d... |        3 |        1 | yes    |
| 10.0.0.5 | 0669df0f... |        2 |        2 | no     |

<p class="subtitle">Naive server identification with 4 vs. 5 servers</p>

---

### Consistent Hashing

Consistent hashing minimizes the number of keys that need to be remapped when the number of servers changes.
In the idealized case, only about <em>k/n</em> keys need to be remapped when a node is added or removed, where <em>k</em> is the number of keys and <em>n</em> is the number of nodes.

#### Hash Space and the Hash Ring

Conceptually, we take the minimum and maximum bounds of our hash space and connect them to form a ring.
We then map servers to their positions on the ring using their IP addresses or some other identifier.
When searching for a key's corresponding server, we find the key's position on the ring and move clockwise until a server is found.

Each node owns the interval from its counterclockwise predecessor up to itself.
If a server is added to the ring, only the keys between the predecessor and the new server's position need to be remapped.
Those keys were previously owned by the new server's clockwise neighbor.
Similarly, if a server is removed from the ring, only the keys that mapped to that server need to be reassigned, typically to its clockwise neighbor.

<img
  src="/images/system-design-interview/sdi-v1-ch5-1.png"
  alt="The Hash Space Represented as a Ring"
  loading="lazy"
  width="705"
  height="506"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">The Hash Space Represented as a Ring</p>

#### Issues with this Approach

With only one position per server, the ring can still be imbalanced.
Depending on where servers land on the ring, some will end up with more keys mapped to them than others, leading them to hold more data than their peers.

<img
  src="/images/system-design-interview/sdi-v1-ch5-2.png"
  alt="The Hash Ring After a Deletion"
  loading="lazy"
  width="705"
  height="506"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">The Hash Ring After a Deletion</p>

#### Virtual Nodes

Virtual nodes offer a solution to these problems.
A virtual node is a logical position on the ring that maps back to a real node.
We deterministically create one or more virtual nodes for each real node and place them on the ring.
In practice, we usually use the same hash function with different node identifiers or suffixes to give each virtual node a different position.
This results in many more points on the ring than there are real servers, with much smaller key ranges between each point.
That means the load from adding or removing a server is spread across many smaller ranges instead of one large contiguous range.
Importantly, key ownership becomes much more evenly distributed as we increase the ratio of virtual nodes to real nodes.
This parameter is tunable, with the main tradeoff being additional routing metadata and operational complexity.

<img
  src="/images/system-design-interview/sdi-v1-ch5-3.png"
  alt="The Hash Ring (with Virtual Nodes) After a Deletion"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">The Hash Ring (with Virtual Nodes) After a Deletion</p>

#### Addressing Hot Spots

Even with the much more even distribution of data brought by the use of virtual nodes, hot spots can still occur.
Consistent hashing evenly distributes keys, not traffic.
If our system is a blog, posts by a celebrity will still generate many times more read requests to the corresponding node.

Strategies for dealing with uneven traffic include read replication, key-space salting, and adaptive (automatic) rebalancing.
Most real-world distributed database systems use consistent hashing alongside replication.

---

### Wrap Up

The benefits of consistent hashing include:

- Fewer keys need to be redistributed when servers are added or removed
- With virtual nodes, data is distributed more evenly, making horizontal scaling easier

---

### Other Resources

ByteByteGo and Hello Interview both have YouTube videos covering this topic.

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/vccwdhfqIrI?si=kNlnLKyTnWyLDOU8"
        title="Video - Consistent Hashing: Easy Explanation for System Design Interviews"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/UF9Iqmg94tk?si=ojzbcj9bkJH68pqM"
        title="Video - Consistent Hashing | Algorithms You Should Know #1 "
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
