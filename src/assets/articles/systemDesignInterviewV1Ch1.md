---
title: System Design Interview Vol. 1 Ch. 1 - Scale From Zero to Millions of Users
description: Notes on Chapter 1 of System Design Interview by Alex Xu. Horizontal scaling, caching, stateless web tiers, CDNs, etc.
published: April 8, 2026
updated: April 8, 2026
minutesToRead: 7
path: /articles/system-design-interview-volume-1-chapter-1/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 1 - Scale From Zero to Millions of Users
  shortDescription: Horizontal scaling, caching, stateless web tiers, CDNs, etc.
  order: 1
---

## System Design Interview - Vol. 1 Ch. 1 - Scale From Zero to Millions of Users

<p class="subtitle">7 minute read • April 8, 2026</p>

This post contains my notes on Chapter 1 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Single Server Setup

We begin with a simple single server setup where everything including the web app, database, cache, etc. run on a single instance.

<img
  src="/images/system-design-interview/sdi-v1-ch1-1.png"
  alt="Single Server Setup"
  loading="lazy"
  width="705"
  height="506"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Single Server Setup</p>

---

### Vertical Scaling vs Horizontal Scaling

When a server begins to struggle with its workload, it can be vertically "scaled up" by increasing the CPU and RAM.
This approach has several limitations, including:

- There are limits (and diminishing returns) to how much CPU and RAM can be added to a single machine
- This process is slow, manual, and inelastic
- There is no failover or redundancy

Instead, systems can be horizontally "scaled up" by introducing additional servers.

---

### Databases

First we must choose between relational database management systems (RDBMS) and non-relational "NoSQL" database systems.
Row-oriented relational databases such as Postgres are a common choice due to their ubiquity and the ease with which they can model objects and relationships between them.
Non-relational databases may be a good choice when working with unstructured data or if extremely low-latency is required.

#### Database Replication

Databases are often replicated using the leader-follower pattern.
All writes are written to the leader, which then copies the changes to the followers, which only respond to read requests.
This works in most systems that have a high read/write ratio.
Performance and availability are improved since parallel reads are supported, and the redundancy provides increased reliability.

For more on this topic, see my <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-11/">notes on database replication and consistency</a>.

<img
  src="/images/system-design-interview/sdi-v1-ch1-2.png"
  alt="Leader-Follower Database Replication"
  loading="lazy"
  width="705"
  height="506"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Leader-Follower Database Replication</p>

#### Database Scaling

Like with app servers, databases can be scaled vertically or horizontally, and many of the previously discussed limitations of vertical scaling apply here too.

<a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-13/#database-partitioning">"Sharding"</a> is the process of horizontally scaling a database by adding additional servers.
Data may be distributed among shards based on the user's location, organization, etc.
Sharding keys must be chosen carefully.
Re-sharding may become necessary when data is distributed unevenly or certain shards become "hotspots".
Joins also become more complex.
A common workaround is to de-normalize the database so that queries can be performed on a single table.

---

### Load Balancers

Load balancers attempt to evenly distribute traffic among servers.
This allows for servers to be dynamically added and removed as needed without changes from the user's perspective.
Redundancy can be ensured and server failure can be handled gracefully.

<img
  src="/images/system-design-interview/sdi-v1-ch1-3.png"
  alt="Load Balancer + Horizontally Scaled Web Tier"
  loading="lazy"
  width="705"
  height="506"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Load Balancer + Horizontally Scaled Web Tier</p>

---

### Caches

Distributed caches provide fast short-term storage.
They store the results of expensive operations and frequently accessed data, deduplicating the work necessary for subsequent accesses.
Cache reads are much faster than database lookups or application server computations.

By introducing a cache tier, caching can be scaled independently while improving performance and reducing database loads.

There are several things we must consider when using a cache:

- Caches are best-suited for data that is read frequently but updated infrequently
- It is a good practice to set an expiry policy
- For the sake of consistency, updates made to cached data must be applied to both the database and the cache
- A <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-5/#cache-eviction">cache eviction policy</a> such as LRU or LFU should be chosen based on the use case
- The cache tier should have multiple distributed servers so that it does not become a single point of failure (SPOF)

<img
  src="/images/system-design-interview/sdi-v1-ch1-4.png"
  alt="Read-Ahead Cache"
  loading="lazy"
  width="705"
  height="506"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Read-Ahead Cache</p>

---

### Content Delivery Network (CDN)

A content delivery network (CDN) is a geographically distributed group of servers that caches content close to end users.
Applications often use them to store and deliver static content such as HTML, CSS, and JS files, images, videos, music, etc.
They improve content availability and redundancy, and improve website load times by ensuring that assets are delivered from a server near the user.
CDNs can be thought of as 3rd-party caches for files and other static assets.

There are several things we must consider when using a CDN:

- Cost (these are 3rd-party services from AWS, Cloudflare, etc.)
- Cache expiry
- CDN fallback strategy
- Cache invalidation

---

### Stateless Web Tier

The web tier can be made "stateless" and horizontally scalable by moving state (i.e., session data) out of it and into shared persistent storage.
A stateful server remembers client data (session) from one request to the next while stateless servers do not.
Stateless architecture allows client requests to be served by any server in the pool; potentially even within the same session.
This makes the system simpler and more robust and scalable.

---

### Data Centers

Supporting multiple data centers (DCs) improves availability across wider geographic areas and provides high-level fault tolerance in case one DC fails.
Multi-DC setups introduce several challenges:

- Traffic must be routed based on geography (geoDNS)
- Data must be synchronized between DCs in case one fails
- Testing and deployment become more complicated

---

### Message Queues

Message queues are durable components that support asynchronous workloads and allow for increased decoupling and horizontal scaling granularity.
These queues work by accepting messages from "producers" (a.k.a. "publishers"), buffering the messages, and providing them to "consumers" (a.k.a. "subscribers" or "workers").
Both producers and consumers can be scaled independently.

<img
  src="/images/system-design-interview/sdi-v1-ch1-5.png"
  alt="Pub-Sub Architecture with a Message Queue"
  loading="lazy"
  width="705"
  height="506"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Pub-Sub Architecture with a Message Queue</p>

---

### Logging, Metrics, Automation

It is important to store and monitor error logs to identify and triage problems in the system.
Collecting metrics allows us to monitor the health of the system and gain useful business insights.
Metrics can include hardware resource utilization, query latency, monthly active users, etc.
As systems grow, it is important to automate certain processes with CI/CD, automated scaling, etc.

---

### Millions of Users and Beyond

In summary, we can scale from a single server to a system that supports millions of users by:

- Splitting tiers into individual services
- Using stateless architecture for the web tier
- Building redundancy in every tier
- Caching as much data as possible
- Hosting static assets in a CDN
- Scaling the data tier with sharding
- Monitoring the system and using automation tools

<img
  src="/images/system-design-interview/sdi-v1-ch1-6.png"
  alt="Our Scalable System"
  loading="lazy"
  width="705"
  height="506"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our Scalable System</p>

---

### Other Resources

Cloudflare provides a good high-level <a target="_blank" rel="noopener" href="https://www.cloudflare.com/en-ca/learning/cdn/what-is-a-cdn/">introduction to CDNs</a>.

The PlanetScale blog has a great post on <a target="_blank" rel="noopener" href="https://planetscale.com/blog/database-sharding">database sharding</a>.

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
