---
title: Database Internals Ch. 6 - B-Tree Variants
description: Notes on Chapter 6 of Database Internals by Alex Petrov. B-Tree implementation techniques, optimizations, and real-world variants.
published: March 1, 2026
updated: March 1, 2026
minutesToRead: 12
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

<p class="subtitle">12 minute read • March 1, 2026</p>

This post contains my notes on Chapter 6 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

This chapter discusses techniques that can be used to implement efficient B-Trees and the structures that employ them. It also discusses B-Tree variants and real-world implementations such as Lazy B-Trees, FD-Trees, Bw-Trees, and Cache-Oblivious B-Trees. Notable techniques include buffering, which can help with write amplification, and immutability, which can help with space amplification.

### Copy-on-Write

Copy-on-Write (COW) B-Trees have immutable nodes which are not updated directly. Instead, pages are copied, updated, and written to new locations. This helps guarantee data integrity with concurrent operations. The main downside is that more space and processor time is required, since the page's entire contents have to be copied. The biggest advantages of this approach are that readers require no additional synchronization or latching, and readers do not block writers, operations cannot observe a page in an incomplete state, and crashes cannot leave pages in a corrupted state.

#### Implementing Copy-on-Write: LMDB

Lightning Memory-Mapped Database (LMDB) is a key:value store that uses COW. It's design does not require a page cache, <a href="https://noahtigner.com/articles/database-internals-chapter-5/#recovery" target="_blank" rel="noopener">WAL</a>, checkpointing, or compaction. LMDB holds only two versions of the root node: the latest version, and the one where changes will be committed. This structure is inherently <a href="https://noahtigner.com/articles/database-internals-chapter-5/#multiversion-concurrency-control" target="_blank" rel="noopener">multiversioned</a>.

---

### Abstracting Node Updates

To update the page on disk we first have to update it's in-memory representation. Nodes can be represented in-memory in a few ways:

- The cached version of the node can be accessed directly
- A wrapper object can be used
- A representation of the node that is native to the implementation language can be used

---

### Lazy B-Trees

#### WiredTiger

We can materialize B-Tree nodes in memory as soon as they're paged in, and use this to store updates until they're flushed. WiredTiger, one of MongoDB's storage engines, uses a variant of this approach, with an added reconciliation step.

#### Lazy-Adaptive Tree

Rather than buffering to individual nodes, we can group nodes into subtrees and attach a buffer to each subtree for batching operations. Buffers therefore have hierarchical dependencies and updates are cascaded / propagated.

---

### FD-Trees

#### Fractional Cascading

#### Logarithmic Runs

---

### Bw-Trees

#### Update Chains

#### Taming Concurrency with Compare-and-Swap

#### Structural Modification Operations

#### Consolidation and Garbage Collection

---

### Cache-Oblivious B-Trees

#### van Emde Boas Layout

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
