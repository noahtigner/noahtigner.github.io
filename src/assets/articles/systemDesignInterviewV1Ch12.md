---
title: System Design Interview Vol. 1 Ch. 12 - Design a Chat System
description: Notes on Chapter 12 of System Design Interview by Alex Xu. Designing a chat system like Slack or WhatsApp.
published: May 22, 2026
updated: May 22, 2026
minutesToRead: 11
path: /articles/system-design-interview-volume-1-chapter-12/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 12 - Design a Chat System
  shortDescription: Designing a chat system like Slack or WhatsApp.
  order: 12
---

<p class="subtitle">11 minute read • May 22, 2026</p>

This post contains my notes on Chapter 12 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

In addition to the chapter in _System Design Interview_, I also reference Hello Interview's <a href="https://www.hellointerview.com/learn/system-design/problem-breakdowns/whatsapp" target="_blank" rel="noopener">_WhatsApp_</a> walkthrough.

---

## Introduction

This chapter covers chat apps, a popular topic in system design interviews.
The system could operate like a simplified version of WhatsApp, Discord, Slack, etc.

---

## Requirements & Scope

### Functional Requirements

- The system should support 1:1 messaging
- The system should support group chats with up to 100 members
- Users can send and receive unlimited messages, and belong to an unlimited number of groups
- Messages sent to users that are currently offline should be delivered once they sign back in
- Push Notifications should be delivered to the recipient's mobile device if they are offline
- Online/offline status indicators should be displayed in the mobile or web application

### Non-Functional Requirements

- Low latency for message delivery
- Guaranteed message delivery
- The system should be resilient and fault tolerant

---

## Proposing a High-Level Design and Getting Buy-In

We start with a simple single-server setup.

<img
  src="/images/system-design-interview/sdi-v1-ch12-1.png"
  alt="Initial Single-Server Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our Initial Single-Server Design</p>

### Communication

Communication in our system will still follow the client/server relationship (rather than peer-to-peer).
Each client will be both a sender and a receiver of messages.
Sending messages is simple, and can often be accomplished with simple HTTP requests.
Receiving messages, on the other hand, is usually more complex.
There are several approaches we should explore.

| Approach                 | How it works                                                                   | Pros                                | Cons                           |
| ------------------------ | ------------------------------------------------------------------------------ | ----------------------------------- | ------------------------------ |
| Polling                  | Clients check for updates every N seconds                                      | Simple                              | High Overhead<br/>High Latency |
| Long Polling             | Connections are held open until new data is received or the connection expires | More efficient than (short) polling | More overhead than WS          |
| Server-Send Events (SSE) | Persistent one-way connection (server -> client)                               | Low latency<br/>Simpler than WS     | Stateful<br/>Uni-directional   |
| WebSockets (WS)          | Persistent bi-directional connection                                           | Low Latency<br/>Bi-directional      | Stateful                       |

We will use WebSockets for sending and receiving messages.

Conceptually, we can divide our system into stateful and stateless components.
Messaging via WS is stateful, while authentication, user info retrieval, etc. can be handled by stateless components through HTTP requests.

### Storage

Before selecting a database, we need to understand our access patterns and the shape of our data.
User profile info, preferences, device metadata, and group membership all fit with traditional RDBMSs for several reasons:

- Highly relational data models (i.e., users and groups, users and devices, etc.)
- Stronger consistency requirements (i.e., uniqueness constraints, cascading deletes, transactions, etc.)
- Moderate throughput requirements

Even at large scales, RDBMSs can handle messages surprisingly well.
At extreme scale, however, it might make sense to move messages to a distributed <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-6/">key-value (KV)</a> or wide-column store like DynamoDB or Cassandra, since messages:

- Have extremely high write throughput
- Are append-heavy and typically queried chronologically by conversation
- Need to be horizontally partitioned efficiently

This is where log-structured or LSM-tree-based storage engines shine (see <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-summary/#b-trees-and-lsm-trees">my notes comparing B-Trees and LSM trees</a>).

These factors make a hybrid approach appealing, where:

- A relational database is used for strongly relational/core data
- A distributed KV store for messages

That said, it is likely operationally simpler to just use a KV or wide-column store for everything.
I opt for a hybrid approach, but both the ByteByteGo and Hello Interview authors chose the unified approach.

---

## Design Deep Dive

As the userbase grows, we'll need to horizontally scale out the chat service.
The fact that connections made to these chat services are stateful instead of stateless (due to our use of WS) provides interesting challenges and opportunities.
It isn't feasible to assign users to servers based on groupchat membership partitions, since the directed graph that represents users and chat memberships could span the entire userbase.
This means that no matter what, we'll need inter-service communication.

By horizontally scaling our chat service(s), we create two problems that we need to solve:

1. Connection routing - how do we assign users to chat servers?
2. Inter-service communication - how do we ensure that messages are received, even when the sender and recipient(s) are connected to different chat servers?

### Connection Routing - Service Discovery & Layer 4 Load Balancing

We don’t necessarily need consistent hashing in the traditional (stateless) sense.
Why?
We’ve already established that we need to support inter-service communication, so it shouldn’t matter which service the client connects to.
Even though the WS connections are stateful, that doesn’t mean that a client needs to reconnect to the same server after disconnecting (which may not be possible anyway, if the node crashed or is now at capacity).
Every service in the pool should be equally capable of handling the connection and propagating messages.

The main consideration then becomes latency, which can be impacted by a number of factors:

- The server’s capacity, relative to other servers
- The amount of existing connections that the server has
- Locality of the server in relation to the user

We’ll need our load balancer (LB) to be aware of which chat server instances are healthy and available.
This is usually handled through service discovery.
While the book opts for service discovery via Apache ZooKeeper, this may be unnecessarily complex.
A more common approach today is to rely on orchestration platforms like Kubernetes or the cloud provider’s autoscaling infrastructure, where healthy service instances are automatically registered and exposed through built-in DNS-based service discovery.
The load balancer can then dynamically route new WS connections to available chat servers without needing explicit coordination infrastructure like ZooKeeper.

For a chat system using long-lived WebSocket connections, a Layer 4 (transport/TCP-level) LB is often preferable to a Layer 7 (application/HTTP-level) LB.
Layer 7 LBs understand HTTP semantics and can make routing decisions based on headers, cookies, or paths, but this comes at the cost of additional overhead.
In contrast, Layer 4 LBs operate at the TCP level and simply distribute and forward persistent socket connections, making them significantly more lightweight and scalable for handling massive numbers of concurrent WS connections.
Since our chat workloads are typically connection-heavy rather than request-processing-heavy, Layer 4 load balancing is likely a better fit for our system.

<img
  src="/images/system-design-interview/sdi-v1-ch12-2.png"
  alt="Layer 4 Load Balancing with Service Discovery"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Layer 4 Load Balancing with Service Discovery</p>

### Inter-Service Communication

We’ll need our messages to reach each recipient, regardless of which chat servers they are connected to.
The naive approach would be to have chat servers forward messages to every other chat server in the pool.
This is obviously a terrible idea.
A slight improvement would be to only forward messages to the servers on which the recipients are connected, but that requires more coordination, since we would need to track which users are connected to which servers, and this mapping changes frequently.

When sending messages, we need to solve for two things:

1. Realtime Delivery / Fanout
2. Durability / Offline Recovery

To satisfy our requirements, we’ll opt for a hybrid approach composed of the following:

1. Our KV store for data persistence/durability
2. Kafka or Redis Pub/Sub for realtime delivery (often with a topic or shard per hashed conversation ID)
3. Incrementing message IDs / cursors

When a message is sent, the chat service connected to the sender first writes the message to durable storage, ensuring persistence for offline recovery and failure scenarios.
Next, an event is published via Redis Pub/Sub or Kafka, typically containing the message ID and metadata.
Chat servers consume these events from shared topics or partitions (rather than per-user subscriptions) and determine whether any of their locally connected clients are recipients of the message.
These servers then read the message contents from the messages cache and/or durable KV store before forwarding it to their corresponding clients via WS.

> [!NOTE]
> In some systems, the Redis Pub/Sub or Kafka events contain the whole message, reducing the amount of database or cache reads required during fanout.
> This results in fewer cache/db lookups, at the cost of larger event payloads.
> These tradeoffs may or may not be worth it, depending on the size of the message and the number of recipients.

Each message is assigned an incrementing ID or cursor.
Each client tracks its own `last_seen_message_id` per conversation.
When a previously offline client reconnects, it requests all messages with IDs greater than its stored cursor, enabling offline recovery and multi-device synchronization.
This also allows support for multiple devices per user (with the addition of a devices table in durable storage).

<img
  src="/images/system-design-interview/sdi-v1-ch12-3.png"
  alt="Inter-Service Communication with Redis Pub/Sub"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Inter-Service Communication with Redis Pub/Sub</p>

### Connection Status Indicators

Many chat applications render small indicators or badges to show if a given user is online or away.

The naive approach is to have clients send heartbeats over WS, and then have the chat servers write these heartbeats to a database.
This results in massive write amplification and would not scale very well.

A better approach would be to use an in-memory cache like Redis.
Each heartbeat could simply result in the user’s `presence` value getting updated in Redis, with a TTL set so that we don’t have to worry about deleting the data manually.
When clients request the status of the user, servers only need to do simple cache lookups to get the info they need.
We can improve this further by deriving presence from WS connections instead of periodic heartbeats, since a user could be considered online if any of their devices are actively connected to one of the chat servers via WS.
This is slightly less accurate, but it should be sufficient for our requirements.

We can then use the same inter-service communication approach described above to broadcast these status changes. This is likely better than a pull-based approach, which would require polling, resulting in massive read amplification.

### Push Notifications

If a recipient is offline (and has not opted out), we want to send push notifications (PNs) to their mobile devices when messages come through.

We can leverage the distributed presence system described above to determine which recipients are currently online.
A dedicated Notifications service consumes the same message publishing events used for realtime chat fanout.
Unlike the chat services, this service then evaluates which recipients should receive PNs based on online presence, notification preferences, and device metadata.
For qualifying recipients, notification jobs are enqueued into a notifications message queue. Worker processes then consume these jobs and integrate with third-party providers such as APNS or FCM to deliver notifications to end-user devices.

For a more detailed discussion on this topic, see <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-10/">my notes on designing a notification system</a>.

### Final High-Level Design

<img
  src="/images/system-design-interview/sdi-v1-ch12-4.png"
  alt="Our Final High-Level Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our Final High-Level Design</p>

---

## Other Questions to Consider

- What if we want to retain messages for as short a time as possible (i.e., like Snapchat rather than Slack)?\
  <span class="subtitle">↳ Fanout becomes more important, while long-term durability and replay become less important</span>\
  <span class="subtitle">↳ We may rely on short-lived broker retention and/or delivery ACKs</span>\
  <span class="subtitle">↳ Depending on the exact requirements, we could either apply TTLs to the message data or delete the messages once all ACKs have been received</span>\
  <span class="subtitle">↳ This weakens offline recovery guarantees and limits cursor-based replay windows</span>
- What if we want to support media (images, GIFs, videos) in our messages?\
  <span class="subtitle">↳ Use blob/object storage like S3, along with pre-signed URLs for uploads</span>

---

## Other Resources

Articles:

- <a target="_blank" rel="noopener" href="https://www.timeplus.com/post/websocket-vs-sse">WebSocket vs. Server-sent Events: A Performance Comparison</a>

Videos:

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/okrR1KXNLtA?si=ST5RrECbFoAFHKrc"
        title="Video - FAANG System Design Interview: Design A Chat System (WhatsApp, Facebook Messenger, Discord, Slack)"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/cr6p0n0N-VA?si=KTvWhVRGPpYs3imy"
        title="Video - Design Whatsapp: System Design Interview w/ a Ex-Meta Senior Manager"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/aKMLgFVxZYk?si=UWq66_8yaZPSs4CB"
        title="Video - Load balancing in Layer 4 vs Layer 7 with HAPROXY Examples"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
