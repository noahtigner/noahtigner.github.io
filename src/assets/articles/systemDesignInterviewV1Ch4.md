---
title: System Design Interview Vol. 1 Ch. 4 - Design a Rate Limiter
description: Notes on Chapter 4 of System Design Interview by Alex Xu. High-level design breakdown and tradeoffs for distributed rate limiters.
published: April 17, 2026
updated: April 20, 2026
minutesToRead: 11
path: /articles/system-design-interview-volume-1-chapter-4/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 4 - Design a Rate Limiter
  shortDescription: High-level design breakdown and tradeoffs for distributed rate limiters.
  order: 4
---

<p class="subtitle">11 minute read • April 17, 2026</p>

This post contains my notes on Chapter 4 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

Although this started as my notes on the _System Design Interview_ chapter, I ended up preferring <a target="_blank" rel="noopener" href="https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter">Hello Interview's breakdown</a> for its breadth and depth.

---

## Introduction

Rate limiters control how many requests each client can make within a given timeframe.
Rate limits are essential to reducing costs and keeping server load manageable.
They can also help mitigate DDoS attacks.
Many systems use them to provide different levels of access to different types of users.
For example, a trial user may get an allotment of 10 requests per day while a paying user gets 100.
Rate limits can apply to the whole system or an individual endpoint or resource.

When a request exceeds the allotted number of requests for the given time window, the rate limiter responds with a <a target="_blank" rel="noopener" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429" class="ital">429 Too Many Requests</a> error.
Headers such as `Retry-After`, `X-RateLimit-Remaining`, `X-RateLimit-Limit`, and `X-RateLimit-Reset` are often attached to responses to provide additional context.
Clients can reference these headers to avoid getting throttled or needlessly retrying requests.

> [!NOTE]
> The book and associated course mention the `X-RateLimit-Retry-After` custom header, but you should use the standard `Retry-After` header.

> [!NOTE]
> A <a target="_blank" rel="noopener" href="https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers#name-ratelimit-policy-field">draft of an RFC</a> documents a new compact `RateLimit-Policy` header, but most systems still use some combination of the `X-RateLimit-*` headers.

---

## Step 1 - Understand the Problem and Establish Design Scope

We should start by asking several questions and discussing alternatives and tradeoffs.

### Where Should the Rate Limiter Go?

The book starts by discussing client-vs-server-side rate limiting.
In practice, the interview will almost always cover server-side rate limiting.
Client-side rate limiting is a good practice to reduce server load, but it can be easily bypassed and abused.
Client-side rate limiting often just involves well-thought-out client-side caching, responsible polling intervals, and gradual backoff for request retries.
In practice, interviews usually cover server-side rate limiting; either handled within the API servers themselves or as "middleware" within the API gateway or load balancer.

### How Should Clients be Identified?

One of the most important things to consider is how the rate limiter should identify clients.
We could use IP addresses, which is the most flexible option, especially if the API is public.
If an API key is required, we could use that instead.
If the endpoint or resource is only available to authenticated users within our own system, we could use their user ID or organization ID.
Many systems support a mixture of keys, using the user ID or API key if available and falling back to the IP address otherwise.

### Other Questions to Consider

- Should the system work in a distributed environment?\
  <span class="subtitle">↳ Let's assume that it should.</span>
- Should this be its own service or live in application code?\
  <span class="subtitle">↳ If there is only a single instance of the API server, it may make sense to handle rate limiting within it for the sake of simplicity.</span>\
  <span class="subtitle">↳ When working in distributed systems it is common to handle rate limiting within the API gateway.</span>
- How many requests per second (RPS) should the rate limiter support?\
  <span class="subtitle">↳ Let's use the big round number of 1 million.</span>
- Does the system need to support dynamic rule changes without full restarts?\
  <span class="subtitle">↳ Let's assume that it should.</span>
- Should the system "fail open" or "fail closed"?\
  <span class="subtitle">↳ If high availability and fault tolerance are our highest priorities, we should fail open, letting requests get processed even if parts of the rate limiter are not responding.</span>\
  <span class="subtitle">↳ If we absolutely cannot allow request quotas to be exceeded, the system should fail closed.</span>

---

## Step 2 - Propose a High-Level Design and Get Buy-In

Let's assume that the interviewer expects this to be a distributed system with multiple API servers.
That pushes us towards handling rate limiting within the API gateway (or other middleware like a load balancer).
While microservices <em>can</em> each handle rate limiting individually by accessing some shared state, it requires increased coordination and can detract from their primary purposes.
API gateways are well-suited for this task.

Let's also assume that our rate limiting protects expensive resources/processes such as AI chat responses.
Customers are billed based on a fixed quota, and allowing them to exceed that quota could be an expensive mistake.

Sticking with our AI API example, let's assume that our system is only open to authenticated (paying) users, and that we need to support several rules such as:

- The user gets at most X requests per 5-hour window
- The user gets at most Y requests per week
- The user's organization gets at most Z requests per month

Our system should support dynamic rule changes.
For example, we may want to offer more generous quotas during a new AI model's launch week.

### Rate Limiting Algorithms

The <a target="_blank" rel="noopener" href="https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter#fixed-window-counter">Fixed Window Counter</a> algorithm counts requests within the given fixed window, resetting the count to 0 at the start of each new window.
This is the simplest and most memory-efficient algorithm and can be implemented with just a hash table.
One issue is that bursts of traffic at the edges of the window can cause the quota to be exceeded.
For example, if the limit for one hour is 100 requests, then 100 could come in at the last minute of the hour and another 100 could come in at the first minute of the next hour, leading to 200 requests within just 2 minutes.

The <a target="_blank" rel="noopener" href="https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter#sliding-window-log">Sliding Window Log</a> algorithm tracks individual request timestamps for each user.
It is simple and accurate but very memory-intensive.

The <a target="_blank" rel="noopener" href="https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter#sliding-window-counter">Sliding Window Counter</a> algorithm is a hybrid between the first two approaches, producing a rough approximation instead of a fully accurate decision.
For each user, we maintain one counter for the previous window and another counter for the current window.
Estimations are made by weighing the counters based on how far into the current time window we are.
This approach is memory efficient but only provides approximations, and the math can be tricky to implement correctly.

The <a target="_blank" rel="noopener" href="https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter#token-bucket">Token Bucket</a> algorithm is a popular choice and is used by companies like Stripe and Amazon.
A bucket with a predefined capacity is created for each user.
The bucket is refilled with tokens at a constant rate.
Once the bucket is full, extra tokens simply overflow and are discarded.
Each request consumes one token.
If there are none left, the request is denied.
The algorithm is tunable by two parameters: bucket size and refill rate, but it can be tricky to tune them properly.
This algorithm usually strikes the best balance between simplicity, memory efficiency, and support for real-world traffic patterns.

The <a target="_blank" rel="noopener" href="https://medium.com/@avocadi/rate-limiter-leaky-bucket-be68c6476385">Leaky Bucket</a> algorithm is another popular choice, used by companies like Shopify.
It is similar to the Token Bucket algorithm, except that it is implemented with a queue, where requests are enqueued (if it is not full) and dequeued and processed at a fixed rate.
Many event-driven systems that rely on queues for async event processing already behave like this algorithm.
The bucket size and outflow rate are both tunable, but outflow rate can depend on the amount of workers and their throughput.
This algorithm is great for consistent traffic patterns.
It also has a "smoothing" effect on bursts of traffic, which can be beneficial for downstream systems, but can increase latency if the queue is nearly full.

### High-Level Architecture

In-memory caches such as Redis are often used for rate limiting since they are much faster than databases.

<img
  src="/images/system-design-interview/sdi-v1-ch4-1.png"
  alt="Simple High-Level Design"
  loading="lazy"
  width="705"
  height="506"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Simple High-Level Design</p>

---

## Step 3 - Design Deep Dive

Our high-level design is a good start, but several questions are still unanswered.

### How Can We Reduce Request Latency?

<a target="_blank" rel="noopener" href="https://devblogs.microsoft.com/premier-developer/the-art-of-http-connection-pooling-how-to-optimize-your-connections-for-peak-performance/">Connection pooling</a> maintains a pool of persistent connections instead of needing to establish a new TCP connection for each request.
This is done by default for most Redis clients but may need to be tuned.

Deploying the infrastructure geographically close to the user can reduce latency significantly, but it comes with additional consistency and complexity challenges.

### How Can We Handle Hot Keys?

We can handle legitimate high-volume traffic with client-side rate limiting and caching, request batching, and dedicated infrastructure for certain users or organizations.
For example, if we have a massive contract with a Fortune 500 company, it may make sense to have a dedicated API gateway, Redis cluster, etc. for them.

### How Can We Handle Abusive Traffic?

We can handle abusive traffic patterns with automated blocking and DDoS protection from a cloud provider such as Cloudflare or AWS.

### How Are Rate Limit Rules Created, Stored, and Retrieved?

One approach is to store rule configuration in a database, cache, or dedicated service.
The rate limiting service can then poll periodically for rule changes and adjust accordingly.
This approach is straightforward, but systems can take as long as an entire polling interval to react to changes.

An alternative to the pull-based approach is a push-based approach using a service like <a target="_blank" rel="noopener" href="https://redis.io/docs/latest/develop/pubsub/">Redis Pub/Sub</a> or <a target="_blank" rel="noopener" href="https://cwiki.apache.org/confluence/display/ZOOKEEPER/ProjectDescription">ZooKeeper</a>.
When new rules are published, the service notifies all connected clients (rate limiters) of the changes immediately.
This approach provides much faster rule updates at the cost of added complexity.

We will assume that it is acceptable for rule changes to take up to 30 seconds to take effect, and will opt for a pull-based approach due to its simplicity.
We can tune the polling interval to find a good balance between polling overhead and immediacy.

### How Can We Scale the System?

Our goal is to handle 1 million RPS.
A typical Redis instance can handle 100,000 - 200,000 <em>operations</em> per second.
Each rate limit check requires multiple operations, so we'll assume a pessimistic 50,000 rate limit requests per second per node.
To hit our RPS goal, we'll need at least 20 Redis <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-1/#database-scaling">shards</a>, with each shard holding some subset of the data.
Our shard keys will need to match our rate limiting keys (i.e., user ID or API key) to ensure that a user's data is not scattered across shards.
We'll need to use consistent hashing so that every request a user sends gets routed to the same shard; otherwise, they could exceed their quota.
In practice, many systems use <a target="_blank" rel="noopener" href="https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/">Redis Cluster</a> to scale horizontally.

### Fail Open or Fail Closed?

We need to consider what happens when a Redis shard (or the whole rate limiting system) becomes unavailable.
Since allowing users to exceed their AI usage quota could cost us greatly, it is imperative that our system "fails closed", with all requests being dropped if our rate limiter is unresponsive.
This obviously hurts our availability and fault tolerance, but the tradeoff is acceptable in this case.
If we were designing for something like a blog or news feed, it would make more sense to fail open.

### Detailed Design

<img
  src="/images/system-design-interview/sdi-v1-ch4-2.png"
  alt="Detailed High-Level Design"
  loading="lazy"
  width="705"
  height="506"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Detailed High-Level Design</p>

---

## Step 4 - Wrap Up

First, we started by understanding the problem and clarifying our assumptions.
Next, we discussed the various rate limiting algorithms and their tradeoffs.
We then discussed sharding strategies, push-vs-poll methods for dynamic rules, fail-open-vs-fail-closed, etc.
While wrapping up the interview, we should discuss failure scenarios, limitations, and other things worth considering.

> [!TIP]
> We discussed several tunable parameters across our algorithm, sharding strategy, dynamic rule change strategy, etc.
> It is worth noting that by monitoring our system, we can not only spot issues, but make better-informed decisions when tuning these parameters.

---

## Other Resources

<a target="_blank" rel="noopener" href="https://blog.cloudflare.com/counting-things-a-lot-of-different-things/">Cloudflare's original blog post</a> about rate limiting from 2017 remains a great high-level resource.

ByteByteGo, TechPrep, and Hello Interview all have YouTube videos covering this topic.
Like with their write-up, Hello Interview's video is by far the most in-depth.

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/YXkOdWBwqaA?si=PAGW2G_yBmDb3ByN"
        title="Video - Rate Limiter System Design: Token Bucket, Leaky Bucket, Scaling"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/MIJFyUPG4Z4?si=Z88x_ti-HKm0EJaj"
        title="Video - Design a Distributed Rate Limiter w/ a Ex-Meta Staff Engineer: System Design Breakdown"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/dpEOhfEEoyw?si=Ret-cna-mdBRkf9y"
        title="Video - Rate Limiter: System Design Interview (Stripe & Amazon Offers)"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
