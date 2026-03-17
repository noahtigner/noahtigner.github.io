---
title: Database Internals Ch. 11 - Replication and Consistency
description: Notes on Chapter 11 of Database Internals by Alex Petrov. Replication and consistency in distributed systems, CAP, and CDRTs.
published: March 17, 2026
updated: March 17, 2026
minutesToRead: 5
path: /articles/database-internals-chapter-11/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 11 - Replication and Consistency
  shortDescription: Replication and consistency in distributed systems, CAP, and CDRTs.
  order: 11
---

## Database Internals - Ch. 11 - Replication and Consistency

<p class="subtitle">5 minute read • March 17, 2026</p>

This post contains my notes on Chapter 11 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Introduction

---

### Achieving Availability

---

### Infamous CAP

#### Use CAP Carefully

#### Harvest and Yield

---

### Shared Memory

---

### Ordering

---

### Consistency Models

#### Strict Consistency

#### Linearizablity

#### Sequential Consistency

#### Causal Consistency

---

### Session Models

---

### Eventual Consistency

#### Tunable Consistency

#### Witness Replicas

---

### Strong Eventual Consistency and CDRTs

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
