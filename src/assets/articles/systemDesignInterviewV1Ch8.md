---
title: System Design Interview Vol. 1 Ch. 8 - Design a URL Shortener
description: Notes on Chapter 8 of System Design Interview by Alex Xu. Designing a URL shortener like bit.ly or TinyURL.
published: April 29, 2026
updated: April 29, 2026
minutesToRead: 8
path: /articles/system-design-interview-volume-1-chapter-8/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 8 - Design a URL Shortener
  shortDescription: Designing a URL shortener like bit.ly or TinyURL.
  order: 8
---

<p class="subtitle">8 minute read • April 29, 2026</p>

This post contains my notes on Chapter 8 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

Although this started as my notes on the _System Design Interview_ chapter, I ended up preferring <a target="_blank" rel="noopener" href="https://www.hellointerview.com/learn/system-design/problem-breakdowns/bitly">Hello Interview's breakdown</a> for its breadth and depth.

---

## Introduction

This chapter explores the surprising complexity behind URL shorteners like TinyURL and bit.ly.
As an example, bit.ly is able to take a long URL like <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-7/">https://noahtigner.com/articles/system-design-interview-volume-1-chapter-7/</a> and produce a short URL like <a target="_blank" rel="noopener" href="https://bit.ly/42CQE2O">bit.ly/42CQE2O</a>.

---

## Step 1 - Understand the Problem and Establish Design Scope

### Functional Requirements

- Given a long URL, the system should produce a short URL
- Given a short URL, the system should redirect the client to the long URL
- Users should be able to modify entries that they have created
  - Users should be able to delete entries that they created
  - Users should be able to modify the long URLs of entries that they have created\
    (for example, enabling them to add new marketing/analytics query params)

### Non-Functional Requirements

- The system should be able to generate 10 million URLs per day
- The system should support long URLs with as many as 100 characters
- The shortened URL should be as short as possible
- The shortened URL should consist of alphanumeric characters (0-9, a-z, A-Z)
- The system should be highly available and have low latency. Redirects should take less than 100ms
- The system should expect a read:write ratio of about 1,000:1
- Data should be retained for at least 10 years

### Back-of-the-Envelope Estimations

Based on our non-functional requirements, we can make the following estimations:

- Writes per day = 10 million
- Writes per second = writes per day / seconds per day = 10 million / 24 / 3600 = 10,000,000 / ~100,000 = ~100
- Reads per second = writes per second \* read:write ratio = 100 \* 1,000 = 100,000
- New records per year = writes per day \* 365 = 3.65 billion
- Storage requirements = new records per year \* retention period \* avg record size = 3.65 billion \* 10 \* 100 bytes = 3.65 TB

---

## Step 2 - Propose a High-Level Design and Get Buy-In

Our core entities for this system are:

- The original long URL
- The short URL
- The user object

### API Endpoints

- `POST /api/v1/short` -> short URL
  - request fields: long URL, user
- `GET /api/v1/short/<shortURL>` -> redirect to long URL
  - this could be aliased by `GET /`
- `PUT /api/v1/short/<shortURL>`
- `DELETE /api/v1/short/<shortURL>`

### URL Redirecting

We need to decide which HTTP response status code to use.
`301 Moved Permanently` instructs browsers to permanently cache the redirect, leading to fewer repeat requests and less server load.
`302 Found` is treated as temporary, making it better for analytics.
Since we need to support updates to the long URLs mapped to our short URLs, we will opt for 302s.

<img
  src="/images/system-design-interview/sdi-v1-ch8-3.png"
  alt="URL Redirection Flow"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">URL Redirection Flow</p>

### High-Level Design

<img
  src="/images/system-design-interview/sdi-v1-ch8-2.png"
  alt="Our High Level Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our High Level Design</p>

---

## Step 3 - Design Deep Dive

### Data Model

| Column     | Type                     | Notes                           |
| ---------- | ------------------------ | ------------------------------- |
| id         | uuid                     | Unique row identifier           |
| long_url   | text                     | Original destination URL        |
| short_url  | varchar(255)             | Shortened URL or slug           |
| user_id    | uuid                     | The user who created the record |
| created_at | timestamp with time zone | When the URL was created        |

<p class="subtitle" style="text-align: center">Schema for the URL table</p>

### Hash Function

We'll need some method of converting long URLs to short strings.

#### Hash Value Length

Our hash value consists of 10 digits, 26 lower-case characters, and 26 upper-case characters, for a total of 62 possible characters.
Our back-of-the-envelope math told us that our system needs to support around 36.5 billion URLs.
To find the minimum length of our short URLs (a.k.a. our hash value) we need to find the smallest number <em>n</em> such that <em>62<sup>n</sup> >= 36.5 billion</em>.

| n   | Number of URLs Supported           |
| --- | ---------------------------------- |
| 1   | 62<sup>1</sup> = 62                |
| 2   | 62<sup>2</sup> = 3,844             |
| 3   | 62<sup>3</sup> = 238,328           |
| 4   | 62<sup>4</sup> = 14,776,336        |
| 5   | 62<sup>5</sup> = 916,132,832       |
| 6   | 62<sup>6</sup> = 56,800,235,584    |
| 7   | 62<sup>7</sup> = 3,521,614,606,208 |

This tells us that we can satisfy our requirements with a 6-character long hash value.

#### Hash + Collision Resolution

The naive approach is to use a hash function like MD5 or SHA-1 and then truncate everything after the sixth character.
This exposes us to the very high likelihood of hash collisions.
To work around this issue, we could follow these steps:

1. Take the long string, hash it, and truncate it
2. If this hashed value already exists in the database, append some predefined string and go to step 1
3. Save the hashed value to the database

Note that steps 1 and 2 may occur several times for a single URL, and each iteration includes at least one database query at step 2.
This can be optimized with <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-7/#bloom-filters">Bloom Filters</a>.

#### Counter + Base62 Encoding

Another approach is to maintain a counter and then convert the new ID from base10 to base62.
Many real-world systems implement the <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-7/#ticket-server">Ticket Server</a> model of unique ID generation with one or more Redis nodes.

The algorithm follows these steps:

1. Take the base10 number, divide it by 62, and save the remainder
2. Take the quotient from step 1 and use it to repeat step 1 until the quotient is 0
3. Concatenate the remainders from each iteration in reverse order

#### Comparison of the Two Approaches

| Hash + Collision Resolution | Unique Counter + Base62 Encoding                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| Short URL length is fixed   | Short URL length grows over time (and is therefore smaller for most of the life of the system) |
| No coordination required    | Requires unique ID generation, via the Ticket Server approach, Snowflake IDs, etc.             |
| Collisions must be resolved | Collisions are not possible                                                                    |
|                             | The next URL can be guessed (security concern)                                                 |

We will move forward with the latter approach.

### URL Shortening Deep Dive

At a high level, our URL shortening process will follow these steps:

1. Take the long URL as input
2. Query for the long URL in the database, fetching the corresponding short URL if found
3. Return the short URL if the long URL was found in the database
4. Generate a new unique ID
5. Convert this ID to a short URL via Base62 encoding
6. Save the record (ID, short URL, long URL, user, etc.) to the database and return the short URL

### URL Redirecting Deep Dive

At a high level, our URL redirection process will follow these steps:

1. The user clicks a short URL link
2. The ALB / API gateway forwards the request to one of the "read" servers
3. If the short URL is already in the cache, respond with a 302 redirect to the associated long URL
4. Otherwise, fetch the record from the database and respond with a 302 redirect to the associated long URL

### Final High Level Design

<img
  src="/images/system-design-interview/sdi-v1-ch8-1.png"
  alt="URL Shortener Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">URL Shortener Design</p>

#### How are Availability and Scalability Ensured?

- If need be, the global counter service can be horizontally scaled with a Redis Cluster, or we can use consistent hashing and generate Snowflake IDs
- If need be, the cache can be horizontally scaled with a Redis Cluster
- If need be, the database can be sharded using consistent hashing
- Read and write concerns are isolated by creating separate read and write services. These can be scaled independently, and we'll likely want more read services due to the read:write ratio

---

## Step 4 - Wrap Up

We've successfully designed a system that shortens URLs and responds with redirects.
Concerns are separated and services are independently scalable, ensuring high availability and low latency.

If time allows, discuss things like:

- <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-4/">Rate limiting</a>
- Failure scenarios
- Analytics, monitoring, alerting, etc.
- Further optimizations like database indexes

---

## Other Resources

<a target="_blank" rel="noopener" href="https://math.tools/calculator/base/10-62">Base10 to Base62 Calculator</a>

ByteByteGo and Hello Interview both have YouTube videos covering this topic.

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/HHUi8F_qAXM?si=CLPFV_G6nJiIS7UD"
        title="Video - How Does a URL Shortener Work?"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/iUU4O1sWtJA?si=KFi_ySgL66EocT_B"
        title="Video - Beginner System Design Interview: Design Bitly w/ a Ex-Meta Staff Engineer"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
