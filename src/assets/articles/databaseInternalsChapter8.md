---
title: Database Internals Ch. 8 - Distributed Systems Intro & Overview
description: Notes on Chapter 8 of Database Internals by Alex Petrov. Concurrency, fallacies of distributed computing, and failure models.
published: March 9, 2026
updated: March 9, 2026
minutesToRead: 11
path: /articles/database-internals-chapter-8/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 8 - Distributed Systems Intro & Overview
  shortDescription: Concurrency, fallacies of distributed computing, and failure models.
  order: 8
---

## Database Internals - Ch. 8 - Distributed Systems Intro & Overview

<p class="subtitle">11 minute read • March 9, 2026</p>

This post contains my notes on Chapter 8 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Preface: Distributed Algorithms

Part 2 of this book discusses distributed systems, so we'll need to start with a few definitions. Distributed algorithms serve many purposes:

- Coordination - a process that supervises the actions and behaviors of several workers
- Cooperation - multiple participants relying on one another for finishing their task
- Dissemination - process cooperating in spreading the information to all interested parties
- Consensus - achieving agreement among multiple processes

---

### Concurrent Execution

#### Shared State in a Distributed System

---

### Fallacies of Distributed Computing

#### Processing

#### Clocks and Time

#### State Consistency

#### Local and Remote Execution

#### Need to Handle Failures

#### Network Partitions and Partial Failures

#### Cascading Failures

---

### Distributed Systems Abstractions

#### Links

---

### Two Generals Problem

---

### FLP Impossibility

---

### System Synchrony

---

### Failure Models

#### Crash Faults

#### Omission Faults

#### Arbitrary Faults

#### Handling Failures

---

### Other Resources

ByteByteGo have great high-level explanations of LSM Trees and Bloom Filters.

Ben Dicken of PlanetScale has a video on Skiplists in the context of LSM Trees, and another on how Priority Queues can be used to efficiently merge data.

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/I6jB0nM9SKU?si=UyvykiZLoIsDIUdh"
        title="Video - The Secret Sauce Behind NoSQL: LSM Tree"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/V3pzxngeLqw?si=qWml7YLKvva7oWJZ"
        title="Video - Bloom Filters | Algorithms You Should Know #2 | Real-world Examples"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/VctNQi7WCkE?si=XAr1o0TL2F5yyKba"
        title="Video - Skip Lists - a perfect structure for LSM databases!"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/zuOEhxJCHho?si=1xPfpxTjXrC1nG5U"
        title="Video - The perfect structure for merging data quickly (the priority queue)"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
