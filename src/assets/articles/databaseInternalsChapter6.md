---
title: Database Internals Ch. 6 - B-Tree Variants
description: Notes on Chapter 6 of Database Internals by Alex Petrov. B-Tree implementation techniques, optimizations, and real-world variants.
published: March 1, 2026
updated: March 29, 2026
minutesToRead: 6
path: /articles/database-internals-chapter-6/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 6 - B-Tree Variants
  shortDescription: B-Tree implementation techniques, optimizations, and real-world variants.
  order: 6
---

## Database Internals - Ch. 6 - B-Tree Variants

<p class="subtitle">6 minute read • March 1, 2026</p>

This post contains my notes on Chapter 6 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Introduction

This chapter discusses techniques that can be used to implement efficient B-Trees and the structures that employ them. It also discusses B-Tree variants and real-world implementations such as Lazy B-Trees, FD-Trees, Bw-Trees, and Cache-Oblivious B-Trees. Notable techniques include buffering, which can help with write amplification, and immutability, which can help with space amplification.

---

### Copy-on-Write

Copy-on-Write (CoW) B-Trees have immutable nodes which are not updated directly. Instead, pages are copied, updated, and written to new locations. This helps guarantee data integrity with concurrent operations. The main downside is that more space and processor time is required, since the page's entire contents have to be copied. The biggest advantages of this approach are that readers require no additional synchronization or latching, and readers do not block writers, operations cannot observe a page in an incomplete state, and crashes cannot leave pages in a corrupted state.

#### Implementing Copy-on-Write: LMDB

Lightning Memory-Mapped Database (LMDB) is a key-value store that uses CoW. Its design does not require a page cache, <a href="https://noahtigner.com/articles/database-internals-chapter-5/#recovery" target="_blank" rel="noopener">WAL</a>, checkpointing, or compaction. LMDB holds only two versions of the root node: the latest version, and the one where changes will be committed. This structure is inherently <a href="https://noahtigner.com/articles/database-internals-chapter-5/#multiversion-concurrency-control" target="_blank" rel="noopener">multiversioned</a>.

---

### Abstracting Node Updates

To update the page on disk we first have to update its in-memory representation. Nodes can be represented in-memory in a few ways:

- The cached version of the node can be accessed directly
- A wrapper object can be used
- A representation of the node that is native to the implementation language can be used

---

### Lazy B-Trees

Lazy B-Trees reduce the number of I/O operations required from subsequent same-node writes by buffering updates.

#### WiredTiger

We can materialize B-Tree nodes in memory as soon as they're paged in, and use this to store updates until they're flushed. WiredTiger, one of MongoDB's storage engines, uses a variant of this approach with an added reconciliation step.

#### Lazy-Adaptive Tree

Rather than buffering to individual nodes, we can group nodes into subtrees and attach a buffer to each subtree for batching operations. Buffers therefore have hierarchical dependencies and updates are cascaded/propagated.

---

### FD-Trees

FD-Trees buffer updates in small B-Trees. When one of these trees fills up, its contents are written into an immutable "run". FD-Trees consists of several levels of immutable runs, with updates gradually propagating from upper to lower levels. Each level is a sorted array, allowing logN binary search on it.

#### Fractional Cascading

Fractional Cascading is a technique that maintains pointers between the levels. "Bridges" are built between levels to minimize gaps. Bridges make search <em>across</em> levels more efficient.

#### Logarithmic Runs

Logarithmic FD-Trees use logarithm-sized sorted runs which increase by a factor of K, created by merging the previous level with the current one.

---

### Bw-Trees

There are three main problems with in-place updates:

1. Write amplification
2. Space amplification
3. Complexity of solving concurrency problems and dealing with latches

Buzzword-Trees (Bw-Trees) solve these three problems by batching updates to different nodes by using append-only storage, linking nodes into chains, and using an in-memory data structure that allows installing pointers between the nodes with a single compare-and-swap operation. This makes the tree lock-free, and greatly reduces the cost of small writes by batching them together.

#### Update Chains

Bw-Trees maintain a "base node" separate from modifications, and "delta node" modifications which form a linked-list chain.

#### Taming Concurrency with Compare-and-Swap

Bw-Trees use an in-memory mapping table to map logical identifiers to delta nodes on the update chain. This mapping also helps get rid of latches, since compare-and-swap operations can be used on physical offsets in the table instead of needing latches to grant exclusive ownership during writes.

#### Structural Modification Operations

Bw-Trees are logically structured like B-Trees and therefore require operations like splits and merges, but their implementations are different. Split structural modification operations (SMOs) start by consolidating the logical contents of the splitting node, applying delta to its base node, and creating a new page with elements to the split point's right. Special split and parent update steps are then applied. Merge SMOs include steps to remove the sibling, merge, and update the parent.

#### Consolidation and Garbage Collection

Delta chains can get arbitrarily long if unmaintained. The longer the chain gets, the more expensive reads get. A configurable threshold is set for the chain length, after which the node is rebuilt by consolidating the deltas and merging them with the base node's contents.

---

### Cache-Oblivious B-Trees

Cache-Oblivious B-Trees treat on-disk data structures similarly to how we build in-memory ones. They are designed to perform well without modifications on multiple (possibly distributed) machines with different configurations. Cache-oblivious algorithms allow reasoning about data structures in terms of a two-level memory model while providing the benefits of a multilevel hierarchy model.

#### van Emde Boas Layout

A cache-oblivious B-Tree consists of a static B-Tree and a "packed array". The static B-Tree is built using the van Emde Boas Layout, which splits the tree at the middle level of the edges and then splits each subtree recursively, resulting in subtrees of sqrt(N) size. Each recursive tree is stored in a contiguous memory block. To allow for inserts/updates/deletes, a packed array is used, which uses contiguous memory segments for storing elements, but contains gaps reserved for future inserts. This results in fewer relocations across the tree due to inserts.

> [!NOTE]
> The book claims that the subtrees will have size sqr(N), but I believe they are actually sqrt(N).

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
