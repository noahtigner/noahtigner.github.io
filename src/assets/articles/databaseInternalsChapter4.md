---
title: Database Internals Ch. 4 - Implementing B-Trees
description: Notes on Chapter 4 of Database Internals by Alex Petrov. B-Tree implementation specifics such as page organization, tree traversal, maintenance, and optimization techniques.
published: February 10, 2026
updated: February 10, 2026
minutesToRead: 7
path: /articles/database-internals-chapter-4/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 4 - Implementing B-Trees
  order: 4
---

## Database Internals - Ch. 4 - Implementing B-Trees

<p class="subtitle">7 minute read • February 10, 2026</p>

This post contains my notes on Chapter 4 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. The chapter discusses real-world B-Tree implementation specifics such as page organization, tree traversal, maintenance, and optimization techniques. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Pager Header

As discussed in previous chapters, page headers contain info about the page used for navigation, maintenance, and optimization. They describe the page's layout, the number of cells on the page, and other such metadata.

Postgres stores the page size and layout version here. MySQL InnoDB's page headers hold the number of heap records, the level, etc. SQLite's hold the number of cells as well as the rightmost pointer.

#### Magic Numbers

Magic numbers are multi-byte blocks held in the header which contain a constant value that can be used for validation and sanity checks.

#### Sibling Links

Sibling links are optional. They help locate neighboring nodes without having to ascend back up the tree. These help with range queries but add complexity to merges.

#### Rightmost Pointers

With <a href="https://noahtigner.com/articles/database-internals-chapter-2/#separator-keys" target="_blank" rel="noopener">separator keys</a> there are always 1 more pointer to children than there are keys. The rightmost child is therefore not paired with a key. If the rightmost child is split and a new cell is appended to the parent, the rightmost child point has to be reassigned.

> [!NOTE]
> Some of the specifics in this section are currently going over my head. I should revisit this topic in the future.

#### Node High Keys

An alternative approach is to store the rightmost pointer in the cell along with the "node high key"; the highest possible key that can be present in the node's subtree. Postgres uses this approach, called <a href="https://github.com/postgres/postgres/blob/master/src/backend/access/nbtree/README" target="_blank" rel="noopener">B<sup>link</sup>-Trees</a>. With this approach, each cell has a corresponding pointer, which can reduce the number of edge cases to consider for certain operations.

#### Overflow Pages

B-Tree nodes have an edge case where the node is not full yet but there is no more free space on the page that holds the node. To implement variable-sized nodes without copying data to a new contiguous region, we can build nodes from multiple linked pages. The original page is called the "primary page" and the new one is called the "overflow page". Nodes can therefore grow in page-sized increments.

Most B-Tree implementations allow storing up to a fixed number of payload bytes in a node directly and spilling the rest to an overflow page. This limit is calculated by dividing the node size by <a href="https://noahtigner.com/articles/database-internals-chapter-2/#tree-balancing" target="_blank" rel="noopener">fanout</a>. This guarantees that pages will always have enough free space.

When a new overflow page is created, its page ID is stored in the header of the primary page if it is the first overflow page, else it is stored in the previous overflow page.

---

### Binary Search

Binary search on a B-Tree returns an integer. If this number is positive, it gives us the position of the searched key in the input. If it is negative, the key was not found, and the number gives us the insertion point. The insertion point is the index of the first element that is greater than the searched key.

Most searches on higher levels will be misses, with each miss narrowing the direction in which the search continues.

#### Binary Search with Indirection Pointers

Cells in B-Tree pages are stored in insertion order, only the cell offset preserves the logical order. To binary search through page cells, we pick the middle cell offset, follow its pointer to its cell, and then compare its key against the searched key to decide if we should continue left or right. We then continue recursively until the searched element is found or the insertion point is found.

---

### Propagation Splits and Merges

B-Tree nodes may contain parent pointers. Just like sibling pointers, these must be updated when the parent changes - during parent splits, merges, and rebalancing. Parent pointers are sometimes used instead of sibling pointers.

#### Breadcrumbs

Breadcrumbs offer an alternative to maintaining parent pointers. When locating the target node for splits or merges, we store references to all nodes visited in the chain down to the target, usually in an in-memory stack. The stack can then be used when changes need to be propagated back up the tree.

---

### Rebalancing

Some B-Tree implementations postpone splits and merges by rebalancing elements within the level or by redistributing nodes before splits and merges. The upsides of this approach are that node occupancy is improved, the height of the tree is minimized, and searches require fewer page reads (due to the minimized height). The downside is an increased maintenance overhead.

Balancing can be performed during insertions and deletions. Instead of splitting the node on overflow, we transfer some of its elements to siblings. For deletion, instead of merging sibling nodes, we move some of the elements from the neighboring nodes to ensure the node does not underflow (ensuring it stays at least 1/2 full).

---

### Right-Only Appends

Many DBMSs use auto-incrementing primary key (PK) indexes, which provide an opportunity for optimization since all insertions are happening at the end of the index (rightmost leaf). This causes most of the splits to occur on the rightmost node of each level. Also, since the keys are monotonically increasing, non-leaf page fragmentation is lower than if the keys were random.

Postgres calls this a "fastpath". SQLite has a similar concept called "quickbalance".

#### Bulk Loading

If we have presorted data and want to bulk load it, or if we need to rebuild the tree for some other reason like defragmentation, we can apply the idea of right-only appends. This avoids splits and merges altogether and builds the tree from the bottom up. This also requires less of the tree to be kept in memory during construction.

---

### Compression

Data can be compressed to save space, but there is a tradeoff. Larger compression ratios improve data size and allow more data to be fetched in a single access, but at the cost of more CPU cycles and RAM during compression and decompression.

It is impractical to compress entire files. Data can be compressed page-wise, allowing compression to be coupled with page loading and flushing. Another approach is to compress only the data itself, either row-wise or column-wise. This decouples page management and compression.

---

### Vacuum and Maintenance

Many operations happen "under the hood", to maintain storage integrity, reclaim space, reduce overhead, and keep pages in order.

#### Fragmentation Caused by Updates and Deletes

Deletes can cause fragmentation. Updates have less of an impact but can result in multiple duplicate versions of the same cell, with only one being addressable.

#### Page Defragmentation

The process that handles space reclamation and page rewrites is called "compaction", "vacuum", or just "maintenance". It is often performed asynchronously. The IDs of newly available pages get added to the freelist. This info has to be persisted to survive crashes and restarts.

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
