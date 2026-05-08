---
title: System Design Interview Vol. 1 Ch. 9 - Design a Web Crawler
description: Notes on Chapter 9 of System Design Interview by Alex Xu. Designing a Web Crawler for text extraction and LLM training data.
published: May 7, 2026
updated: May 7, 2026
minutesToRead: 8
path: /articles/system-design-interview-volume-1-chapter-9/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 9 - Design a Web Crawler
  shortDescription: Designing a Web Crawler for text extraction and LLM training data.
  order: 9
---

<p class="subtitle">8 minute read • May 7, 2026</p>

This post contains my notes on Chapter 9 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

Although this started as my notes on the _System Design Interview_ chapter, I ended up preferring <a target="_blank" rel="noopener" href="https://www.hellointerview.com/learn/system-design/problem-breakdowns/web-crawler">Hello Interview's breakdown</a> for its breadth and depth.

---

## Introduction

Web crawlers are complex software systems that download and process some subset of the web.
The internet is treated as a directed graph, where each page is a node and each link is an edge.
Huge amounts of info can be extracted by traversing this graph and processing its pages.
This info can then be used to inform search engines, train LLMs, etc.

---

## Step 1 - Understand the Problem and Establish Design Scope

I will deviate slightly from the book, settling on LLM training data generation as the primary purpose for this theoretical system.

### Functional Requirements

- Starting from a set of "seed" URLs, begin crawling the web
- Continue until we have hit ~1 billion pages per month or run out of pages to process
- Download and save the text content of these pages
- Stored content should be retained for 5 years
- Duplicate URLs should not be pre-processed
- Pages with duplicate content should not be pre-processed

### Non-Functional Requirements

- Scalability - the system should be able to process up to 1 billion pages per month
- Fault Tolerance + Robustness - failure to parse one page should not bring down the whole system
- Politeness - respect <em>robots.txt</em> and do not overwhelm servers with requests
- Extensibility - the system should be evolvable and easy to extend in the future (i.e., adding image downloading and processing)

### Back-of-the-Envelope Estimations

- Need to process 1B pages / month
- Average page size = 2 MB
- QPS = 1B / 30 / 24 / 3600 = 33.3M / 24 / 3600 = 33.3M / ~100,000 = ~333
- Peak QPS = QPS _ 2 = 333 _ 2 = 666
- Storage per month = 1B \* 2 MB = 2 PB
- Total storage requirements = 2PB _ 12 _ 5 = 120 PB

---

## Step 2 - Propose a High-Level Design and Get Buy-In

### Components

The roles of several components and mechanisms are obvious from their names, but a few are worth discussing in more detail.

Crawling begins with a set of seed URLs, which act as the system's input.
They can be selected in a variety of ways.
For example, we could pick seed URLs that cover a large geographic distribution by targeting diverse TLDs such as .gov, .co.uk, .jp, etc.

Most web crawlers split the crawl state into URLs that have been downloaded and ones that have not yet been downloaded.
These yet-to-be downloaded URLs are stored in a data structure called the URL Frontier (a.k.a., the "Frontier Queue").
This component helps ensure politeness, URL prioritization, and freshness, acting as a scheduler for which URLs get processed next.
It is often implemented with several FIFO queues.

DNS translates domain names into IP addresses.
DNS is usually offloaded to trusted third-party providers, but caching these results can help with efficiency.

The Content Seen component checks web pages for duplicate content by comparing hashes of the content to hashes of already processed pages.
This ensures we do not (further) process content that has been duplicated across several URLs.
This is often done by hashing processed page content and storing it in an in-memory set, and then checking the hash of each newly downloaded page against the set before proceeding further.
If the content has already been seen, we mark the URL as seen and move on to the next.

The URL Filter excludes certain content types, blacklists certain websites, etc.

The URL Seen component deduplicates work by tracking which URLs have already been processed or are currently queued in the URL Frontier.
Often implemented with a hash table or set, and sometimes Bloom filters.

### High-Level Design

<img
  src="/images/system-design-interview/sdi-v1-ch9-1.png"
  alt="Our High Level Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our High Level Design</p>

The design put forward by the Hello Interview team takes a slightly different approach.
They place a parsing queue between downloader/crawler workers and parsing workers.
The "Content Seen" component is simply one responsibility of the parsing workers in this model, as is link extraction.
The exact topology is different but the key pieces of the designs are relatively similar.

---

## Step 3 - Design Deep Dive

### The URL Frontier

#### DFS vs. BFS

Breadth-First Search (BFS) is usually picked over Depth-First Search (DFS) for graph traversal since the depth of the web is massive.
A single FIFO queue and BFS does not account for page ranking and priority.
This can be achieved with a Priority Queue (PQ), or by maintaining many distinct queues (more info below).

#### Politeness

"Politeness" means not spamming the same server with too many requests within a short period of time.
Impoliteness can trigger DDoS protection, result in IP bans, or overwhelm unprotected servers.
In general, it is best to send no more than one request at a time to any given server, with at least a second of delay between subsequent requests.

This can be implemented in a variety of ways:

- Many (100s+) queues, with each domain being assigned to a queue, and a delay enforcing when the queue can be used next. This requires an in-memory table or some other method of mapping domains to queues.
- A shared queue, with politeness enforced <em>after</em> the item is dequeued by checking domain locks and timeouts. These domain locks are usually kept in a shared storage system like Redis.

In both approaches, <em>robots.txt</em> is referenced.
These files communicate crawl permissions and may include crawl-delay hints.

#### Priority

Different pages may have different levels of importance.
As an example, a page on OpenAI's website detailing a new product announcement likely bears more weight than an AI-generated blog post regurgitating the information on some unknown site.
Priority could even be different between pages on the same domain, i.e., in the case of LinkedIn profile pages for the CEO of Microsoft vs. an intern.

The Prioritizer component scores URLs and then assigns them to queues based on these priorities.
In this model, input URLs are prioritized, then mapped to "front queues" based on priority.
Next, items are pulled off of these queues, their URLs are checked against the URL mapping tables, and they are added to the corresponding "back queue".
Finally, items are pulled off of the back queues and processed by workers.
This model maintains two sets of queues: one based on priority, and one based on domain (for politeness).

<img
  src="/images/system-design-interview/sdi-v1-ch9-2.png"
  alt="Politeness and Priority in our URL Frontier"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Politeness and Priority in our URL Frontier</p>

In the shared queue model, workers may pull URLs from the priority queue(s) first, but before downloading the page they must still check:

- <em>robots.txt</em> rules and crawl delay (possibly including jitter)
- host locks (ensuring politeness)
- rate limiting

### Freshness

We may need to periodically recrawl pages to capture updates.
If so, we can prioritize recrawling by first checking the URL Seen component to see when the URL was last crawled, then using this as a factor when setting the URLs priority.
If we want pages to be periodically recrawled in our system, we would need to relax the initial checks on the URL Seen component, discarding URLs only if they have been seen within some time bound, not if they have been seen at all.

### Robustness

- Use <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-5/">consistent hashing</a> when scaling downloaders
- Save crawl state and data in case of worker interruptions
- Validate data before passing it further through the system

### Extensibility

Our system is flexible and evolvable.
Components such as image downloaders, LLM summarizers, etc. could be added to the system without negatively impacting complexity.

### Efficiency & Scalability

- Cache DNS results
- Use many DNS providers and cycle between them
- Locality - distribute crawl servers and possibly queues based on geography
- Set timeouts on crawling and parsing processes to avoid waiting too long for slow servers to respond
- URL deduplication via the URL Seen component/mechanism
- Content deduplication via hashing and the Content Seen component/mechanism
- Independent horizontal scaling for different parts of the system
- Database replication and sharding

---

## Step 4 - Wrap Up

We've successfully designed a system that crawls the web and processes page content.
Concerns are separated and services are independently scalable, ensuring high availability and low latency.

If time allows, discuss things like:

- Many modern single-page applications (SPAs) rely on dynamic content, client-side rendering, and hydration.\
  In order to properly parse these pages, we need the ability to execute JavaScript.\
  This can be done by accessing and rendering the page in a headless web browser before parsing and saving its contents.
- Analytics and monitoring
- How to avoid "Spider Traps" and infinite link loops
- Recrawling and continuous updates

---

## Other Resources

ByteByteGo and Hello Interview both have YouTube videos covering this topic.

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/krsuaUp__pM?si=H2pGPgIZGGZCf3vn"
        title="Video - Design a Web Crawler System Design Interview w/ a Ex-Meta Staff Engineer"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/6u25GckPhLU?si=281UMltHZ-XEps50"
        title="Video - Design a Web Crawler: FAANG Interview Question"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
