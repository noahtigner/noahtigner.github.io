---
title: Database Internals Notes - Introduction & Motivation
description: An overview of my collection of notes on Database Internals by Alex Petrov.
published: February 4, 2026
updated: February 10, 2026
minutesToRead: 3
path: /articles/database-internals/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Introduction & Motivation
  shortDescription: Overview and motivation for this collection of reading notes.
  order: 0
---

## Database Internals Reading Notes - Introduction & Motivation

<p class="subtitle">3 minute read • February 4, 2026</p>

This is a collection of my notes on <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. The book provides a deep dive into how database management systems work under the hood, covering storage engines, distributed systems, and the algorithms that power modern databases.

---

### Chapter Notes

#### Part I - Storage Engines

- [x] <a href="https://noahtigner.com/articles/database-internals-chapter-1/" target="_blank" rel="noopener">Chapter 1 - Introduction & Overview</a>
- [x] <a href="https://noahtigner.com/articles/database-internals-chapter-2/" target="_blank" rel="noopener">Chapter 2 - B-Tree Basics</a>
- [x] <a href="https://noahtigner.com/articles/database-internals-chapter-3/" target="_blank" rel="noopener">Chapter 3 - File Formats</a>
- [x] <a href="https://noahtigner.com/articles/database-internals-chapter-4/" target="_blank" rel="noopener">Chapter 4 - Implementing B-Trees</a>
- [x] <a href="https://noahtigner.com/articles/database-internals-chapter-5/" target="_blank" rel="noopener">Chapter 5 - Transaction Processing and Recovery</a>
- [x] <a href="https://noahtigner.com/articles/database-internals-chapter-6/" target="_blank" rel="noopener">Chapter 6 - B-Tree Variants</a>
- [x] <a href="https://noahtigner.com/articles/database-internals-chapter-7/" target="_blank" rel="noopener">Chapter 7 - Log-Structured Storage</a>

#### Part II - Distributed Systems

- [ ] Chapter 8 - Introduction & Overview
- [ ] Chapter 9 - Failure Detection
- [ ] Chapter 10 - Leader Election
- [ ] Chapter 11 - Replication & Consistency
- [ ] Chapter 12 - Anti-Entropy & Dissemination
- [ ] Chapter 13 - Distributed Transactions
- [ ] Chapter 14 - Consensus

---

### Motivation

These notes are intended as a reference and are not meant as a substitute for the original text. I've been enjoying the book so far, and I highly recommend that anyone interested in the topic read it themselves. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

When learning about complex topics, I take notes twice - <a href="https://www.scientificamerican.com/article/why-writing-by-hand-is-better-for-memory-and-learning/" target="_blank" rel="noopener">once with pen and paper</a> and once more by keyboard a few days later for the sake of <a href="https://www.bcu.ac.uk/exams-and-revision/best-ways-to-revise/spaced-repetition" target="_blank" rel="noopener">spaced repetition</a>. These posts represent my second pass at note-taking and benefit from the ability to link to external documents, embed diagrams and videos, etc. Plus, nobody has to try to read my handwriting.

Database systems are fundamental to modern software infrastructure, yet their inner workings often remain opaque to application developers. Understanding how databases store, index, and retrieve data can help engineers make better architectural decisions, optimize query performance, and debug production issues.

---

### AI Usage

I do not use AI of any form while writing these notes. I do however use GitHub Copilot to review my notes and check for typos, grammatical issues, etc. The agent I use for reviewing these articles is defined <a href="https://github.com/noahtigner/noahtigner.github.io/blob/main/.github/agents/article-reviewer.md" target="_blank" rel="noopener">here</a>.

---

### Additional Resources

- <a href="https://www.youtube.com/playlist?list=PLSE8ODhjZXjYMAgsGH-GtY5rJYZ6zjsd5" target="_blank" rel="noopener">CMU's Intro to Database Systems Lectures</a>
- <a href="https://www.youtube.com/@benjdicken" target="_blank" rel="noopener">Ben Dicken's YouTube Channel</a> - Great videos on database internals
- <a href="https://www.youtube.com/c/PlanetScale" target="_blank" rel="noopener">PlanetScale's YouTube Channel</a> - More videos on database internals, mostly by Ben Dicken
- <a href="https://planetscale.com/blog" target="_blank" rel="noopener">PlanetScale's Blog</a> - Articles about database systems; usually centered around MySQL and PostgreSQL

---

### Attribution

_Database Internals_ by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7
