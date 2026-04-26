---
title: System Design Interview Vol. 1 Ch. 7 - Design A Unique ID Generator
description: Notes on Chapter 7 of System Design Interview by Alex Xu. Various approaches to distributed ID generation, including UUID, Ticket Server, Snowflake IDs, etc.
published: April 26, 2026
updated: April 26, 2026
minutesToRead: 6
path: /articles/system-design-interview-volume-1-chapter-7/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 7 - Design A Unique ID Generator
  shortDescription: Various approaches to distributed ID generation, including UUID, Ticket Server, Snowflake IDs, etc.
  order: 7
---

<p class="subtitle">6 minute read • April 26, 2026</p>

This post contains my notes on Chapter 7 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

## Introduction

Single-server setups often rely on their database's `auto_increment` feature for unique ID generation.
This works well for small systems but breaks down as soon as the database needs to be horizontally scaled.

---

## Step 1 - Understand the Problem and Establish Design Scope

Here's an example of what the requirements gathering phase of the interview might look like:

- What are the characteristics of our IDs?\
  <span class="subtitle">↳ They should be unique and sortable</span>
- How should these IDs be represented?\
  <span class="subtitle">↳ They should be encoded as 64-bit numbers</span>
- Should each new ID be incremented by 1?\
  <span class="subtitle">↳ IDs should increase over time (they should be sortable) but they need not increase by exactly 1</span>
- What is the expected scale that this system should support?\
  <span class="subtitle">↳ The system should be able to generate 10,000 IDs per second</span>

---

## Step 2 - Propose a High-Level Design and Get Buy-In

There are several possible approaches we should consider.

### Multi-Master Replication

This approach leverages the `auto_increment` feature across several database servers.
Instead of incrementing each new ID by one, individual servers are tasked with incrementing by <em>N</em>, where <em>N</em> is the number of participants (database servers).
This approach does not scale well when servers are added or removed, and there is no guarantee that IDs increase over time.

<img
  src="/images/system-design-interview/sdi-v1-ch7-1.png"
  alt="Multi-Master Replication for Unique ID Generation"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Multi-Master Replication for Unique ID Generation</p>

### UUID

UUIDs are 128-bit identifiers with a low (but nonzero) chance of collision (duplication).
The probability of collision is so low that each web server can be trusted to generate its own UUIDs without any coordination between servers.
This makes UUIDs simple and scalable.
Unfortunately, UUIDs don't satisfy our requirements for several reasons:

- UUIDs are 128 bits instead of 64. Truncating them to 64 increases the chance of collisions
- UUIDs do not increase over time and are not sortable

#### Alternatives to UUID

When discussing UUIDs, we typically mean UUID v4.
There are several alternatives within the same "family" worth considering:

| Name    | Size     | Time-Sortable | Standard | Best For                                          |
| ------- | -------- | ------------- | -------- | ------------------------------------------------- |
| UUID v4 | 128 bits |               | ✓        | General Purpose, Compatibility                    |
| UUID v7 | 128 bits | ✓             | ✓        | Database PKs, Event Ordering, Distributed Systems |
| ULID    | 128 bits | ✓             |          | Human-Readable, URL-Safe IDs                      |
| KSUID   | 160 bits | ✓             |          | Logs, Extremely Large Scale Distributed Systems   |

<p class="subtitle">A comparison of several unique identifiers</p>

### Ticket Server

Despite the problem statement at the start, we actually <em>can</em> rely on a single database server's `auto_increment` feature.
The "Ticket Server" approach uses one centralized service whose sole concern is creating monotonically increasing IDs.
This can be achieved with a traditional database's `auto_increment` or with Redis' atomic `INCR` operation.

<img
  src="/images/system-design-interview/sdi-v1-ch7-2.png"
  alt="Ticket Server Approach to Unique ID Generation"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Ticket Server Approach to Unique ID Generation</p>

Pros:

- Simple and easy to implement
- Globally unique
- Produces monotonically increasing numbers

Cons:

- This centralized ticket server becomes a single point of failure (SPoF)
- This server can become a scalability bottleneck at massive scales

### Snowflake IDs

Despite the name, "Snowflake" IDs have nothing to do with the cloud data provider.
Developed at Twitter, Snowflake IDs are represented as 64 bits divided into several sections.
One example of a bit layout is:

| Name            | Bits | Purpose                                                                                      | Resolution                                                 |
| --------------- | ---- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Sign Bit        | 1    | held for future-proofing purposes, usually always 0                                          |                                                            |
| Timestamp       | 41   | ms since some epoch                                                                          | 2<sup>41</sup> = ~69 years                                 |
| Data Center ID  | 5    | identifies the DC in multi-DC systems                                                        | 2<sup>5</sup> = up to 32 DCs                               |
| Machine ID      | 5    | identifies the machine within the given DC                                                   | 2<sup>5</sup> = up to 32 machines per DC                   |
| Sequence Number | 12   | a monotonically increasing number maintained by the machine or process; resets to 0 every ms | 2<sup>12</sup> = up to 4096 IDs per machine/process per ms |

<p class="subtitle">An example bit layout of a Snowflake ID</p>

<img
  src="/images/system-design-interview/sdi-v1-ch7-3.png"
  alt="Distributed Snowflake ID Generation"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Distributed Snowflake ID Generation</p>

Pros:

- Decentralized, no SPoF, no coordination required
- Globally unique
- IDs increase over time and are sortable

Cons:

- Relying on timestamps introduces the possibility of out-of-order IDs caused by clock skew

> [!TIP]
> These bit layouts are customizable.
>
> If you know you will only ever use a max of 4 DCs, you could reduce the number of bits for DCs from 5 to 2, and allocate the remaining 3 bits to machine IDs or sequence numbers.
>
> You should also consider adding bits for process IDs if each machine runs multiple ID generation processes at a time.

This is the approach we will propose.

---

## Step 3 - Design Deep Dive

Let's assume that geographic distribution, high availability, and low latency are our highest priorities.
Our system will run on servers distributed across somewhere between 2 and 8 data centers.
Let's also assume that our system might run on as many as 512 worker instances per DC.

Tuning our Snowflake ID bit layout to satisfy these requirements, we arrive at something like:

| Name            | Bits | Resolution                                    |
| --------------- | ---- | --------------------------------------------- |
| Sign Bit        | 1    |                                               |
| Timestamp       | 41   | 2<sup>41</sup> = ~69 years                    |
| Data Center ID  | 3    | 2<sup>3</sup> = up to 8 DCs                   |
| Worker ID       | 9    | 2<sup>9</sup> = up to 512 workers / DC        |
| Sequence Number | 10   | 2<sup>10</sup> = up to 1024 IDs / worker / ms |

<p class="subtitle">An example bit layout for our custom Snowflake ID proposal</p>

This gives us a throughput of `8 DCs * 512 Workers * 1024 IDs` = ~4 million IDs per ms = ~4 billion IDs per second, which greatly exceeds the original requirement of 10,000 IDs per second.

---

## Step 4 - Wrap Up

Of the approaches we discussed, the Snowflake approach scales the best while satisfying all of our requirements.

Time permitting, it may be worth discussing:

- Clock skew and clock synchronization with NTP
- Section length (bit layout) tuning for Snowflake IDs
- Alternatives to UUID v4, such as ULID and KSUID

---

## Other Resources

I reference <a target="_blank" rel="noopener" href="https://www.guidsgenerator.com/wiki/uuid-vs-others">GUID Generator's</a> comparison of various unique IDs when describing UUID, ULID, KSUID, etc.

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
