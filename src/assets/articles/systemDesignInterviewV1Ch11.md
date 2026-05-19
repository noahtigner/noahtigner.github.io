---
title: System Design Interview Vol. 1 Ch. 11 - Design a News Feed
description: Notes on Chapter 11 of System Design Interview by Alex Xu. Designing a news feed system like the Facebook or Twitter timeline.
published: May 18, 2026
updated: May 18, 2026
minutesToRead: 6
path: /articles/system-design-interview-volume-1-chapter-11/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 11 - Design a News Feed
  shortDescription: Designing a news feed system like the Facebook or Twitter timeline.
  order: 11
---

<p class="subtitle">6 minute read • May 18, 2026</p>

This post contains my notes on Chapter 11 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

In addition to the chapter in _System Design Interview_, I also referenced Hello Interview's <a href="https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-news-feed" target="_blank" rel="noopener">_FB News Feed_</a> walkthrough.

---

## Introduction

This chapter covers news feeds, a popular topic in system design interviews.
These news feeds could take the shape of a Facebook or LinkedIn feed, Twitter timeline, etc.

---

## Understanding the Problem and Establishing Design Scope

### Functional Requirements

- Users should be able to create posts
- Users should be able to follow other users (uni-directional)
- Users should be able to view a feed of posts ordered in reverse chronological order, with the latest shown first
- As users scroll down through their feed, additional posts should be fetched and displayed (infinite scrolling)
- Posts can contain both text and media (images and short videos)

### Non-Functional Requirements

- Each user can follow up to 500 other users
- Posting should take less than 500ms
- Viewing the feed should take less than 500ms (excluding frontend render time)
- The system should be able to handle up to 10 million daily active users (DAU)

---

## Proposing a High-Level Design and Getting Buy-In

### API Endpoints

- `POST /api/v1/posts` -> post ID
  - request fields: content
- `GET /api/v1/feed?timestamp={timestamp}` -> list of feed items
- `PUT /api/v1/users/{userId}/follow`

Not covered in this design:

- unfollowing users
- updating posts
- deleting posts

### Feed Publishing Flow

<img
  src="/images/system-design-interview/sdi-v1-ch11-1.png"
  alt="Initial Design for Feed Publishing"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Initial Design for Feed Publishing</p>

The Posts Service persists posts in the database.
The Fanout Service pushes content to the feed caches for each of the user's followers.
Follower relationships are stored in the database and retrieved during fanout.
Post IDs and user IDs are stored in the news feed cache for each user.

### Feed Retrieval Flow

<img
  src="/images/system-design-interview/sdi-v1-ch11-2.png"
  alt="Initial Design for Feed Retrieval"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Initial Design for Feed Retrieval</p>

During retrieval, the Feed Service pulls Post IDs and user IDs from the precomputed news feed caches.
Post contents and user info (username, profile picture, etc. for the post's author) are then fetched from the database for each post.

If the user is requesting older posts not help by the news feed cache, we'll need to do the following:

1. fetch followed accounts from the Followers Service
2. fetch posts from followed accounts from the Post Service

---

## Design Deep Dive

### Feed Publishing Deep Dive

We'll need to decide on a fanout model for delivering posts to all followers.

#### Fanout on Read/Write?

Fanout on Write, also known as the "push" approach, involves adding new posts to each follower's cache once the post is published.

Pros:

- Low latency when viewing feeds since they are precomputed

Cons:

- Celebrity Problem - posts by users with many followers can create massive write amplification

Fanout on Read, also known as the "pull" approach, involves generating news feeds on-demand at read time.

Pros:

- Resources aren't wasted precomputing feeds for inactive users
- Avoids write amplification caused by the celebrity problem

Cons:

- High feed read latency
- Feed generation becomes more computationally expensive at read time

#### Hybrid Approach

We can leverage the benefits of both fanout models by using a hybrid approach.
The push model can be used for most "normal" users, while the pull model can be used for users with many followers (according to some pre-defined threshold or heuristic).
When constructing a user's news feed, the system collects the list of who they follow that qualifies for the "celebrity" status.
Posts from those users are fetched dynamically and merged with the precomputed list of posts from "normal" users.

> [!TIP]
> We don't want to waste fanout work updating the feed caches for inactive users. During push-based fanout, we can simply skip followers who have not recently logged in, deferring work until they eventually log back in.

With our hybrid approach, feeds are partially materialized in the news feed caches, with some work done eagerly and some done lazily.

<img
  src="/images/system-design-interview/sdi-v1-ch11-3.png"
  alt="High Level Fanout Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">High Level Fanout Design</p>

### Feed Retrieval Deep Dive

<img
  src="/images/system-design-interview/sdi-v1-ch11-4.png"
  alt="High Level Feed Retrieval Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">High Level Feed Retrieval Design</p>

Process:

1. The user's followers are fetched from the Followers Service
2. Post IDs (and associated user IDs) are fetched from the news feed cache
3. Posts belonging to "celebrities" that the user follows are queried from the Post Service, as well as post content for posts listed in the news feed cache
4. User names, profile picture URLs, etc. are fetched for each post
5. All collected posts are merged into a list and returned to the user

Media assets (and profile pictures) are lazily loaded from object storage as the client begins rendering the feed items.

> [!NOTE]
> Real-world systems have much more sophisticated mechanisms for prioritizing and ordering feed items than simply sorting by timestamp. Recommendation systems (machine learning algorithms) are often employed to generate candidates and re-rank them.

### Followers

Follower relationships are uni-directional and form a directed graph.
Although these relationships form a graph conceptually, we never need to do deep traversals or complex graph queries.
The book recommends using a graph database like <a href="https://neo4j.com/" target="_blank" rel="noopener">Neo4j</a>, that may be overkill for our requirements.

I opt for a traditional RDBMS like Postres, with a `followers` table with `followerId` and `followee_id`, a composite primary key of both fields, and a secondary index on followees.
This gives us efficient queries for both followers of a given user, and users who they follow.

Another approach would be to use a NoSQL key-value store like <a href="https://aws.amazon.com/dynamodb/" target="_blank" rel="noopener">DynamoDB</a> along with a <a href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html" target="_blank" rel="noopener">Global Secondary Index (GSI)</a>.
That is the approach taken in the Hello Interview walkthrough.

### Final High-Level Design

<img
  src="/images/system-design-interview/sdi-v1-ch11-5.png"
  alt="Our Final News Feed Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our Final News Feed Design</p>

---

## Other Questions to Consider

- What if we want to send users notifications when certain people they follow post new content?\
  <span class="subtitle">↳ A notifications service could handle fanout during the post creation flow</span>\
  <span class="subtitle">↳ We would want a `preferences` table so that users can subscribe for individual followers or opt out entirely</span>\
  <span class="subtitle">↳ See <a href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-10/" target="_blank" rel="noopener">my notes on designing notification systems</a></span>
- How could we prevent users from spamming too many new posts within a short time window?\
  <span class="subtitle">↳ See <a href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-4/" target="_blank" rel="noopener">my notes on rate limiting</a></span>

---

## Other Resources

There are several great YouTube videos on this topic with unique approaches and insights.

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/Qj4-GruzyDU?si=inK82RBRBrusoWOt"
        title="Video - Design FB News Feed System Design Interview w/ ex: Meta Senior Manager"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/qogwP78LzAk?si=52t6_Dxzvl5_vNy5"
        title="Video - Design the Facebook/Twitter News Feed | Systems Design Questions 3.0 With Ex-Google SWE"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
