---
title: System Design Interview Vol. 1 Ch. 13 - Design a Search Autocomplete System
description: Notes on Chapter 13 of System Design Interview by Alex Xu. Designing a search autocomplete system like the Google search bar.
published: May 30, 2026
updated: June 5, 2026
minutesToRead: 8
path: /articles/system-design-interview-volume-1-chapter-13/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 13 - Design a Search Autocomplete System
  shortDescription: Designing a search autocomplete system like the Google search bar.
  order: 13
---

<p class="subtitle">8 minute read • May 30, 2026</p>

This post contains my notes on Chapter 13 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here. I tweak the requirements and offer my own suggestions to ensure that I am internalizing the material instead of just restating it.

---

## Introduction

This chapter focuses on designing a "typeahead" autocomplete / incremental search feature like the Google search bar.
This is one variant of the popular "top-k" problems.

<img
  src="/images/system-design-interview/sdi-v1-ch13-3.png"
  alt="Autocomplete example"
  loading="lazy"
  width="705"
  class="centered-img"
/>

---

## Requirements & Scope

### Functional Requirements

- The system should return 5 suggested completions for each given partial query
- Suggestions should be ordered by historical query frequency
- The system needs to support lowercase alphabetic characters, numbers, and spaces for now
- The top suggestions should be updated hourly based on complete queries

### Non-Functional Requirements

- The system should support 10 million daily active users (DAUs)
- Suggestions should be returned with low latency (< 100ms)
- The system should be highly scalable
- The system should be highly available and fault tolerant

### Back-of-the-Envelope Estimations

- Assume an average of 20 queries per user per day
- Assume queries have an average of 4 words and 5 characters per word
- 1 character = 1 byte (ASCII encoding)\
  ↳ 20 bytes per query
- In the worst case (with no client-side throttling), the system could receive 1 request per character typed. i.e., for "telemetry":\
  ↳ suggestions?q=t\
  ↳ suggestions?q=te\
  ↳ suggestions?q=tel\
  ↳ ...\
  ↳ suggestions?q=telemetry
- Queries per Second (QPS) = 10M DAU \* 20 queries per day \* 20 characters per search term / 24 hours / 3600 seconds = 10M \* 200 / 100,000 = 2,000,000 / 100,000 = 20,000
- Peak QPS = QPS \* 2 = 40,000
- Assuming 20% of queries are new, then 10M \* 10 \* 20 bytes \* 20% = 400M bytes = 0.4GB of new storage added per day

---

## Initial High-Level Design

At a high level, the system can be broken down into two main parts: a data pipeline that ingests raw query logs and generates suggestions for query prefixes, and an Autocomplete Suggestion service that returns these precomputed suggestions for each prefix that it receives.

### Trie Data Structure

The <a target="_blank" rel="noopener" href="https://en.wikipedia.org/wiki/Trie">Trie</a> (pronounced "try") or Prefix Tree is a data structure for efficiently storing sets of strings and searching through them.
Tries allow us to efficiently search for the inclusion of a word or phrase, find complete strings that start with a given prefix, etc.

<img
  src="/images/system-design-interview/sdi-v1-ch13-2.png"
  alt="A Minimal Example of a Trie with Frequency Info"
  loading="lazy"
  width="300"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">A Minimal Example of a Trie with Frequency Info</p>

To support sorting by frequency, we need to store frequency info in each node.
Any node where this frequency is positive is a previously search term.

To get the top-k most searched queries, the basic algorithm is:

1. Search through the Trie to find the node where the prefix (current partial search term) ends
2. Traverse the node's subtree to find all valid children (full search terms; nodes where the frequency is positive)
3. Sort the children by frequency and return the top-k items

Initially, we can start with a single server, which holds a single materialized Trie in memory and uses it to find and serve suggestions.
Every time a full search is submitted, we can update the Trie in real time.

The first problem with this approach is that it is not feasible to update the Trie (and each prefix's suggestions) in real time.
The other issue is that the data that makes up the Trie (all historic searches and their frequencies) may be too large for a single server's memory.

---

## Design Deep Dive

Our initial design was not practical for several reasons.
We can start to improve the system by taking an asynchronous "offline" approach to the data ingestion and processing pipeline.
Data aggregation and top-k suggestion generation can be done in bulk on an hourly cadence.
Instead of materializing all of the data in a single Trie, we can partition the data and have nodes only materialize a subtree of the entire Trie.
For example, we could have one node build a Trie for all queries started with "a", another for all queries starting with "b", etc.
These partial Tries are only kept around temporarily to help precompute suggestions.
Once suggestions have been computed for each prefix, the Tries are discarded, and the suggestions are saved to the data store.

### Frequency Aggregation

When search queries are received, records of the events are asynchronously logged and uploaded to blob storage.
Each of these log records contain the search term as well as important metadata like the current time stamp.

Every hour, an aggregation process such as <a target="_blank" rel="noopener" href="https://hadoop.apache.org/">MapReduce</a> or <a target="_blank" rel="noopener" href="https://spark.apache.org/">Spark</a> computes query frequencies for autocomplete ranking.
It reads raw search logs from blob storage, aggregates counts per query, and writes the resulting frequency table back to blob storage in a columnar format such as <a target="_blank" rel="noopener" href="https://parquet.apache.org/">Parquet</a>.
Rather than incrementally updating state, the aggregation is recomputed from scratch over a fixed time window (for example, the last 24 hours or 7 days).
This makes it easier to recover from failures and ensures that the ranking data reflects recent user behavior.
To control cost and improve responsiveness to recent trends, the system may apply a retention policy or sliding time window over the underlying logs.
This effectively biases rankings toward more recent queries while still preserving enough historical signal to avoid overreacting to short-lived spikes.

### Top-k Generation

Our Index Builder services take aggregated query frequency data from blob storage and generate mappings between prefixes and their top-k suggestions.
Each worker loads a partition of the aggregated data and uses it to construct a temporary in-memory Trie.
During construction, frequency data is propagated up the Trie to generate the top-k suggestions for each prefix.
Once computed, these mappings are written in bulk to the data store and the Trie is discarded.

### Storage and Caching

Prefixes and their corresponding top-k suggestions are encoded as key-value pairs, where each prefix is a key and its value is a list of suggestions, i.e.,

```json
{
  "app": ["apple iphone", "app store", "apple"],
  "apple": ["apple iphone", "apple pie", "apple records"]
}
```

This seems like a good fit for a distributed KV store like <a target="_blank" rel="noopener" href="https://cassandra.apache.org/">Cassandra</a>, which provides low-latency point lookups when the data model is a direct key-value mapping.

Our key-value lookups may be so fast that we don't end up needing caching at all.
On the other hand, we could lean entirely on something like <a target="_blank" rel="noopener" href="https://redis.io/">Redis</a> Cluster and not employ a persistent data store at all, depending on our durability requirements.
A good middle ground would be to cache "hot" prefixes only, reducing database load while letting the database serve "cold" queries directly.

The Index Builder services can prepopulate this hot-prefix cache during each hourly rebuild, avoiding a read-through caching pattern and instead performing proactive cache warming for frequently accessed prefixes.

The last step of the Index Builder's workflow is to write the new snapshot of mappings to the database and cache, ideally in bulk.
Since Cassandra is built on top of <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-7/">LSM Trees</a>, we can use <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-7/#sorted-string-tables">SSTable</a> bulk loading (via sstableloader) for efficient ingestion.
For the hot-prefix cache, we can simply do a full cache rebuild, constructing a new cache instance from a snapshot of our data and then swapping to it in production.

Each hourly build produces a new versioned snapshot, which is atomically swapped into both Cassandra and the cache layer, ensuring consistency across the serving system.

### Serving Top-k Completion Suggestions

With our prefix and top-k suggestion mappings stored in Cassandra (with hot prefixes cached), the Autocomplete Suggestion service is fully decoupled from the offline data processing pipeline.

The service first normalizes the input prefix (e.g., lowercasing and trimming) and performs a lookup in the hot-prefix cache.
If the prefix is found, the cached top-k suggestions are returned immediately, enabling very low-latency responses.
On a cache miss, the service falls back to Cassandra, performing a direct key lookup for the prefix.
Because top-k suggestions are precomputed during the indexing phase, the serving layer does not perform any ranking or traversal logic at request time.
The service simply returns the stored ordered list, truncating to k if needed.

These services are stateless, can be horizontally scaled, and ensure low latency prefix lookups.

### Final High-Level Design

<img
  src="/images/system-design-interview/sdi-v1-ch13-1.png"
  alt="Our Final High-Level Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our Final High-Level Design</p>

---

## Other Questions to Consider

- What if we want to consider other factors besides frequency when ranking suggestions?\
  <span class="subtitle">↳ The aggregation pipeline could be extended to provide overall ranking scores based on a variety of factors instead of just frequency. These overall scores would then be consumed by the Index Builders without and additional changes needed to the system architecture</span>
- What client-side techniques should be used to help reduce server load?\
  <span class="subtitle">↳ Some combination of debouncing or throttling, caching, and request cancellation</span>

---

## Other Resources

Relevant LeetCode Problems:

- <a target="_blank" rel="noopener" href="https://leetcode.com/problems/implement-trie-prefix-tree/">208. Implement Trie (Prefix Tree)</a>
- <a target="_blank" rel="noopener" href="https://leetcode.com/problems/implement-trie-ii-prefix-tree/">1804. Implement Trie II (Prefix Tree)</a>
- <a target="_blank" rel="noopener" href="https://leetcode.com/problems/design-add-and-search-words-data-structure/">211. Design Add and Search Words Data Structure</a>
- <a target="_blank" rel="noopener" href="https://leetcode.com/problems/design-search-autocomplete-system/">642. Design Search Autocomplete System</a>

Videos:

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/MCKX3n4-UR4?si=-ZytALBC0Jn09T0i"
        title="Video - 6: Typeahead Suggestion + Google Search Bar | Systems Design Interview Questions With Ex-Google SWE"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/oobqoCJlHA0?si=lWZkUJrT7XlvbS0e"
        title="Video - Implement Trie (Prefix Tree) - Leetcode 208"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
