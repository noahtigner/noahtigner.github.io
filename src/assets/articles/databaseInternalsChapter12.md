---
title: Database Internals Ch. 12 - Anti-Entropy & Dissemination
description: Notes on Chapter 12 of Database Internals by Alex Petrov. Anti-Entropy and Dissemination in distributed systems, including read repair, hinted handoff, Merkle Trees, and gossip dissemination.
published: March 21, 2026
updated: March 29, 2026
minutesToRead: 7
path: /articles/database-internals-chapter-12/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 12 - Anti-Entropy & Dissemination
  shortDescription: Anti-Entropy and Dissemination in distributed systems, including read repair, hinted handoff, Merkle Trees, and gossip dissemination.
  order: 12
---

<p class="subtitle">7 minute read • March 21, 2026</p>

This post contains my notes on Chapter 12 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

## Introduction

Some updates need to be propagated among nodes as quickly and reliably as possible. These can include cluster-wide metadata, node states, failures, schema changes, etc. Such updates can generally be propagated to all nodes in the cluster using one of three broad approaches:

- Notifications broadcast from one process to all other processes
- Peers periodically connect pairwise to exchange info
- Cooperative broadcast, where recipients broadcast to help spread the info quickly and more reliably

Broadcasting is straightforward and works well when the amount of nodes in the cluster is small, but can be expensive and unreliable in large systems. We can make it so that all nodes in the system share responsibility for delivery by splitting things up into a primary delivery step and periodic sync steps.

In a distributed system, "entropy" represents the degree of state divergence between nodes. Anti-entropy seeks to bring the nodes back up to date in case the primary delivery mechanism failed. In other words, it lowers the convergence time bounds in eventually consistent systems.

To keep nodes in sync, background or foreground processes compare and reconcile missing or conflicting records. Background anti-entropy processes use auxiliary structures like Merkle Trees and update logs to identify divergence. Foreground anti-entropy processes piggyback read or write requests with hinted handoff, read repair, etc.

---

## Read Repair

It is easy to detect divergence between replicas during reads, since at that point the coordinator node can contact replicas, request the queried state from them, and compare the responses. This mechanism is called "read repair". Some DBs avoid contacting <em>all</em> replicas and use tunable consistency levels instead. Read repair can be implemented as blocking or async operations. Blocking read repair ensures <a href="https://noahtigner.com/articles/database-internals-chapter-11/#session-models" target="_blank" rel="noopener">monotonicity</a> for <a href="https://noahtigner.com/articles/database-internals-chapter-11/#tunable-consistency" target="_blank" rel="noopener">quorum reads</a>, but at the cost of availability.

Instead of issuing a full read request to each node, the coordinator can issue just one read request, and send the rest of the replicas "digest" requests. Replicas that receive a digest request simply compute and return a hash of the read's response, which the coordinator compares against the hash provided by the full read. If there are any mismatches, full read requests are issued to all replicas that responded with a different hash.

---

## Hinted Handoff

"Hinted handoff" is a write-side repair mechanism. If the target node fails to acknowledge the write, the write coordinator or one of the replicas stores a special "hint" record. This hint is relayed to the target node as soon as it comes back up. Some DBs use "sloppy quorums" alongside hinted handoff. Sloppy quorums improve availability at the cost of consistency.

---

## Merkle Trees

Since read repair only fixes inconsistencies on currently queried data, we need to use different mechanisms to find and repair inconsistencies in the rest of the data. Merkle Trees compose a compact hashed representation of the local data, building a tree of hashes. The lowest levels of the tree consist of hashes of the table's record ranges. Higher levels consist of hashes of the combined lower-level hashes. This allows us to quickly detect inconsistencies by comparing hashes and following the tree nodes recursively to narrow down the inconsistent ranges. This can be done by exchanging and comparing entire trees or just subtrees. Since these trees are constructed from the bottom-up, entire subtrees must be recomputed when data changes. There's also a tradeoff between tree size and precision.

<img
  src="https://ghost.oxen.ai/content/images/size/w1600/2025/01/BasicMerkleTree.png"
  alt="An example of a Merkle Tree, courtesy of oxen.ai"
  loading="lazy"
  width="600"
  style="max-width: 100%; height: auto;"
/>

<p class="subtitle">An example of a Merkle Tree, courtesy of oxen.ai</p>

---

## Bitmap Version Vectors

Bitmap Version Vectors offer a compact means of resolving data conflicts based on recency. Each node keeps a per-peer log of operations that have occurred locally or were replicated. During anti-entropy, logs are compared and missing data is replicated to the target node. An advantage of this approach is that it captures the causal relation between the writes and allows nodes to precisely identify the data points missing on other nodes. One possible downside is that logs cannot be truncated by peers when a node is temporarily down.

---

## Gossip Dissemination

<a href="https://noahtigner.com/articles/database-internals-chapter-9/#gossip-and-failure-detection" target="_blank" rel="noopener">Gossip protocols</a> propagate updates with the reach of a broadcast and the reliability of anti-entropy. They are probabilistic communication procedures that work like rumors and diseases in human societies. A process that holds info that needs to be spread around is called "infective", and nodes that haven't yet received the news are "susceptible". Infective nodes spread the info to <em>random</em> neighbors. Gossip can be used for asynchronous message delivery, and is useful in systems with high "churn", where nodes come and go frequently.

### Gossip Mechanics

Gossip has several tunable parameters, such as fanout (f) and message redundancy. These protocols offer "convergent consistency", meaning that there's a higher probability of consistency the further back in time we go.

### Overlay Networks

Gossip is highly scalable, but it comes with inherent message duplication. Selecting nodes at random improves robustness but leads to redundant messages being sent. A middle ground between randomized gossip and top-down centralized coordination is to construct a temporary fixed topology in a gossip system. An overlay network of peers can be used to help nodes select peers based on proximity (latency). This system can form spanning trees where messages can be distributed in a fixed number of steps. One downside is that "islands" can form. We can combine approaches, using fixed topologies and tree-based broadcasts when the system is stable, and falling back to gossip during failover and system recovery.

### Hybrid Gossip

"Push/lazy-push multicast trees", a.k.a. "Plumtrees", offer a middle ground between epidemic and tree-based primitives. A spanning tree tells nodes where to actively send messages. If one node is not connected to another node by the tree, it just sends it the message's ID. If a node receives an ID for a message it has not received, it queries its neighbors for the message contents. One advantage of this approach is that it tends to generate trees with minimal latency when working in a system with constant load. Since nodes can fail without warning, gossip must be used to spot issues with the tree and initiate repairs.

### Partial Views

If the churn is high, maintaining a full view of the cluster can get expensive. Gossip protocols often use a peer sampling service to avoid this. This service maintains overlapping partial views of the clusters, which are periodically refreshed via gossip.

---

## Other Resources

Greg Schoeninger of <a href="https://oxen.ai/" target="_blank" rel="noopener">oxen.ai</a> has a great blog post called <em><a href="https://ghost.oxen.ai/merkle-tree-101/" target="_blank" rel="noopener">Merkle Tree 101</a></em>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
