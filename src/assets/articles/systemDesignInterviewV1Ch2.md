---
title: System Design Interview Vol. 1 Ch. 2 - Back-of-the-Envelope Estimation
description: Notes on Chapter 2 of System Design Interview by Alex Xu. Statistics, conversions, and estimation strategies every software engineer should know
published: April 10, 2026
updated: April 10, 2026
minutesToRead: 10
path: /articles/system-design-interview-volume-1-chapter-2/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 2 - Back-of-the-Envelope Estimation
  shortDescription: Statistics, conversions, and estimation strategies every software engineer should know.
  order: 2
---

## System Design Interview - Vol. 1. Ch. 2 - Back-of-the-Envelope Estimation

<p class="subtitle">10 minute read • April 10, 2026</p>

This post contains my notes on Chapter 2 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Introduction

A critical part of the system design interview is "back-of-the-envelope" estimation.
It is important to be familiar with several statistics, conversions, and formulae in order to make ballpark assumptions and estimations when designing and evaluating our systems.
In several places I have used updated measurements or supplemented the book's content with additional resources.

---

### Power of Two

Binary powers show up everywhere in systems work: memory addressing, page sizes, cache lines, Bloom filters, sharding, and quick storage estimates.
It is also worth keeping the naming straight: hardware, operating systems, and low-level programming often use binary units such as KiB, MiB, and GiB, while storage vendors and network throughput numbers are often quoted in decimal KB, MB, and GB.

| Power | Approx. Value | Unit Name | Abbrev. |
| ----- | ------------- | --------- | ------- |
| 0     | 1             | Byte      | B       |
| 10    | 1 Thousand    | Kilobyte  | KB      |
| 20    | 1 Million     | Megabyte  | MB      |
| 30    | 1 Billion     | Gigabyte  | GB      |
| 40    | 1 Trillion    | Terabyte  | TB      |
| 50    | 1 Quadrillion | Petabyte  | PB      |
| 60    | 1 Quintillion | Exabyte   | EB      |

<p class="subtitle">Powers of Two Table</p>

---

### Latency Numbers Every Programmer Should Know

Jeff Dean's classic <a target="_blank" rel="noopener" class="ital" href="https://brenocon.com/dean_perf.html">Latency Numbers Every Programmer Should Know</a> list is still the best baseline for building intuition about orders of magnitude.
The key lesson is that modern systems are usually not bottlenecked by CPU arithmetic, but by cache misses, context switches, storage, and network hops.

| Operation                                          | Approximate Latency | Why It Matters                                                         |
| -------------------------------------------------- | ------------------- | ---------------------------------------------------------------------- |
| L1 cache reference                                 | 0.5 ns              | CPU-local data is effectively free compared to almost everything else. |
| Branch mispredict                                  | 5 ns                | Control-flow mistakes already cost about 10x an L1 hit.                |
| L2 cache reference                                 | 7 ns                | Falling out of L1 is still cheap, but no longer negligible.            |
| Mutex lock/unlock                                  | 100 ns              | Coordination overhead can rival a main-memory read.                    |
| Main memory reference                              | 100 ns              | A RAM access is about 200x slower than an L1 hit.                      |
| Compress 1 KB with Zippy                           | 10 us               | Light CPU work can cost about the same as small network transfers.     |
| Send 1 KB over a 1 Gbps network                    | 10 us               | Even small network hops quickly dominate local compute.                |
| Read 1 MB sequentially from memory                 | 0.25 ms             | Bulk memory scans are fast, but not free.                              |
| Round trip within the same datacenter              | 0.5 ms              | A single remote call can cost thousands of CPU operations.             |
| Disk seek                                          | 10 ms               | Random disk access is catastrophic compared to RAM or SSD.             |
| Read 1 MB sequentially from network                | 10 ms               | Transfer time matters once payloads get larger.                        |
| Read 1 MB sequentially from disk                   | 30 ms               | Spinning disks are orders of magnitude slower than memory.             |
| Packet from California to the Netherlands and back | 150 ms              | Geography alone can consume an entire interaction budget.              |

<p class="subtitle">Selected latency numbers from Jeff Dean's classic reference sheet</p>

In 2024 the Vercel team published <a target="_blank" rel="noopener" class="ital" href="https://vercel.com/blog/latency-numbers-every-web-developer-should-know">Latency numbers every frontend developer should know</a>.
The <a target="_blank" rel="noopener" class="ital" href="https://github.com/sirupsen/napkin-math">Napkin Math</a> repository is another great resource for estimations.

| Budget / Operation            | Rule of Thumb                           | Design Implication                                                                   |
| ----------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------ |
| CPU cache hit                 | 0.5-7 ns                                | Locality matters; cache-friendly code can be orders of magnitude faster.             |
| RAM access                    | 100 ns                                  | Pointer chasing and cache misses are expensive.                                      |
| System call                   | 300 ns                                  | Tiny abstractions around many syscalls can still add up.                             |
| Same-host SSD read            | 1 us                                    | Local NVMe is fast enough to beat many networked designs.                            |
| Same-zone network hop         | 100 us                                  | One RPC is fine; deep RPC trees are not.                                             |
| Remote cache / DB query       | 500 us                                  | Treat each query as a meaningful latency budget item.                                |
| Same-datacenter round trip    | 0.5 ms                                  | Fan-out and chatty protocols become visible very quickly.                            |
| 60 fps frame budget           | 16 ms total, about 5-10 ms for app code | Interaction work must stay small and predictable.                                    |
| Continental round trip        | about 33 ms                             | Region placement changes user experience.                                            |
| Parse 1 MB of CSS / HTML / JS | about 100-150 ms                        | Frontend payload size is often a product problem, not just an implementation detail. |
| Disk seek / random HDD access | about 10 ms                             | Avoid random spinning-disk reads in latency-sensitive paths.                         |
| Intercontinental round trip   | about 150-300 ms                        | Global apps need CDNs, caching, and fewer sequential round trips.                    |

<p class="subtitle">Consolidated latency budgets from Jeff Dean, Vercel, and Napkin Math</p>

---

### Availability Numbers

Availability is usually expressed in "nines": the percentage of time a system is expected to remain available over some period.
The higher the target, the more expensive the engineering tradeoffs become, because each additional nine removes a large chunk of allowable downtime.

| 9s  | Availability % | Downtime per day | Downtime per week | Downtime per month | Downtime per year |
| --- | -------------- | ---------------- | ----------------- | ------------------ | ----------------- |
| 2   | 99%            | 14.4 minutes     | 1.68 hours        | 7.2 hours          | 3.65 days         |
| 3   | 99.9%          | 1.44 minutes     | 10.08 minutes     | 43.2 minutes       | 8.76 hours        |
| 4   | 99.99%         | 8.64 seconds     | 1.01 minutes      | 4.32 minutes       | 52.56 minutes     |
| 5   | 99.999%        | 864 ms           | 6.05 seconds      | 25.92 seconds      | 5.26 minutes      |
| 6   | 99.9999%       | 86.4 ms          | 604.8 ms          | 2.59 seconds       | 31.54 seconds     |

<p class="subtitle">Downtime budgets for 2-6 nines, assuming a 30-day month and 365-day year</p>

#### SLAs and Latency Metrics

Organizations often operate under service-level agreements (SLAs), which prescribe the maximum amount of time a system may be down.
The SLA may also dictate latency and performance standards for API requests.
These often take the shape of p90, p95, p99, etc.
These describe the percentage of requests which must fall under some latency number, typically measured in milliseconds.
For example, a p99 of 100 ms means that 99% of requests should respond in less than 100 ms.
These measurements are useful for describing latency distributions and extreme outliers.

---

### Example: Video Streaming Platform QPS & Storage Requirements

The book gives an example for a system like Twitter.
I have gone through a similar exercise for a video streaming platform like YouTube.

**Assumptions:**

- 250 million monthly active users
- 60% of users watch content daily
- Each daily active user watches an average of 2 videos per day
- Average video length: 50 minutes
- Average video file size (compressed, single resolution): 3 GB
- Average delivered streaming bitrate across active sessions: 5 Mbps
- 0.1% of daily active users upload a new video each day
- Each uploaded video is stored in 4 different resolution formats
- Data is stored indefinitely; estimate for 3 years of new uploads

**Estimations:**

- Query per second (QPS) estimate:
  - Daily active users (DAU) = 250 million \* 60% = 150 million
  - Video-start requests per day = 150 million \* 2 videos = 300 million
  - Mean Streaming QPS = 300 million / 24 hours / 3,600 seconds = 300,000,000 / ~100,000 = ~3,000
  - Peak Streaming QPS = 2 \* Mean QPS = ~6,000
- Storage estimate:
  - Uploaders per day = 150 million DAU \* 0.1% = 150,000
  - Storage per uploaded video = 3 GB \* 4 resolutions = 12 GB
  - New storage per day = 150,000 \* 12 GB = 1,800,000 GB = ~1.8 PB
  - 3-year total upload storage = 1.8 PB \* 365 \* 3 = 1.8 PB \* ~1,000 = ~2 EB
- Bandwidth estimate:
  - Mean daily watch time = 2 \* 50 = 100 minutes
  - Mean concurrent streams = DAU \* (mean daily watch time / active hours _ 60 minutes) = 150 million \* (100 / 16 \* 60) = 150 million _ ~0.1 = ~15 million
  - Mean outbound bandwidth = mean concurrent streams \* bitrate = 15 million \* 5 Mbps = 75 million Mbps = 75 Tbps
  - Peak outbound bandwidth = mean outbound bandwidth \* 2 = 30 million \* 5 Mbps = ~150 Tbps

> [!TIP]
> When calculating QPS and working with DAU, it is easiest to multiply by 100,000
> since 24 hours _ 60 minutes _ 60 seconds = 86,400

> [!NOTE]
> **QPS vs. Concurrent Streams:**
>
> The QPS figure measures the rate of requests to _start_ a video - momentary events distributed across the day.
> A user watching two videos sequentially still generates only one play-start request at any given instant, so there is no double-counting.
> Spread 300 million such events over 86,400 seconds and you get ~3,000 requests per second hitting the API service.
>
> Concurrent streams is a separate and equally important metric, answering a different design question. To estimate it:
>
> - Each DAU watches ~100 minutes of content per day (2 videos \* 50 minutes)
> - Spread across ~16 active hours: 150 million \* (100 min / 960 min) ≈ ~15–16 million concurrent streams on average
> - At peak (evening hours, roughly 2–3x): ~30–45 million concurrent streams
>
> QPS drives API server and playback-initiation service scaling. Concurrent stream count drives CDN capacity, bandwidth provisioning, and infrastructure cost.

---

### Interview Checklist

When doing back-of-the-envelope estimation in an interview, I find it useful to follow the same sequence every time:

- State your assumptions and units up front
- Convert daily or monthly numbers into per-second and peak-load numbers
- Estimate read traffic, write traffic, storage growth, and bandwidth separately
- Use concurrency estimates for long-lived sessions, not just request-rate estimates
- Sanity-check the result against latency budgets, availability targets, and obvious cost constraints

---

### General Tips

> [!TIP]
> Prefer order-of-magnitude accuracy over fake precision (and round your numbers)

> [!TIP]
> Write your assumptions down and label your units

> [!TIP]
> Multiply by the number of round trips, not just the latency of a single call

> [!TIP]
> For frontend work, budget both network time and main-thread parse/execute time.
>
> For backend design, assume storage and network dominate compute unless proven otherwise

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
