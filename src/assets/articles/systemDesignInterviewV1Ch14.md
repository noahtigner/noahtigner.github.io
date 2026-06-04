---
title: System Design Interview Vol. 1 Ch. 14 - Design a Video Sharing Platform
description: Notes on Chapter 14 of System Design Interview by Alex Xu. Designing a video sharing platform like YouTube.
published: June 3, 2026
updated: June 3, 2026
minutesToRead: 8
path: /articles/system-design-interview-volume-1-chapter-14/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 14 - Design a Video Sharing Platform
  shortDescription: Designing a video sharing platform like YouTube.
  order: 14
---

<p class="subtitle">8 minute read • June 3, 2026</p>

This post contains my notes on Chapter 14 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it.
These notes are intended as a reference and are not meant as a substitute for the original text.
I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.
In addition to the chapter in _System Design Interview_, I also reference Hello Interview's <a href="https://www.hellointerview.com/learn/system-design/problem-breakdowns/youtube" target="_blank" rel="noopener">_YouTube_</a> walkthrough.
I tweak the requirements and offer my own suggestions to ensure that I am internalizing the material instead of just restating it.

---

## Introduction

This chapter focuses on design considerations for video streaming platforms like YouTube.
Interesting variations of this design task could include:

- Design a live-streaming platform like Twitch
- Design a streaming platform like Netflix (no user uploads)
- Design a short-form video sharing platform like TikTok

---

## Requirements & Scope

### Functional Requirements

Core requirements:

- Users should be able to watch videos
- Users should be able to upload videos

Out of scope:

- Live-stream capabilities
- Recommendations
- Playlists, likes & dislikes, user profiles, subscriptions, etc.
- Content moderation

### Non-Functional Requirements

Core requirements:

- The platform should support high resolution (4k) videos with large file sizes (tens of GBs)
- The system should support international users
- The system should allow for low-latency streaming, even for users with low bandwidth
- The system should support resumable uploads
- The system should be highly available and scalable, supporting 10s of millions of daily active users (DAUs)

### Back-of-the-Envelope Estimations

- Assume 20 million daily watchers
- Assume 200,000 daily uploads
- Assume the average uploaded video is ~15 minutes long and in 1440p, with a size of ~2GB
- Total daily storage requirements = 200,000 \* 2GB = 400 TB

---

## Initial High-Level Design

The storage for this system can be split into two main parts:

1. Blob storage (S3) for media
2. A database such as Postgres for video metadata, users, etc.

### Video Upload Flow

Our videos can be tens of GBs, which makes it impractical to upload them via our application servers.
Instead, our system should provide clients with <a target="_blank" rel="noopener" href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html">presigned URLs</a>, which can be used to upload the videos directly to blob storage.

<img
  src="/images/system-design-interview/sdi-v1-ch14-1.png"
  alt="Initial design for video uploads"
  loading="lazy"
  width="705"
  class="centered-img"
/>

### Video Streaming Flow

It is not feasible to download the entire video before playback can begin.
Instead, the video can be streamed to the client in small chunks.
Several streaming protocols exist to standardize this process, such as <a target="_blank" rel="noopener" href="https://developer.apple.com/streaming">HLS</a> and <a target="_blank" rel="noopener" href="https://www.cloudflare.com/learning/video/what-is-mpeg-dash/">MPEG-DASH</a>.
Leveraging one of these protocols to stream videos in chunks has several benefits.
Playback can start much quicker since only a few small chunks need to be downloaded at first.
Additionally, less bandwidth is wasted on delivering videos that users may not finish.

If we <a target="_blank" rel="noopener" href="https://aws.amazon.com/what-is/video-transcoding/">transcode</a> and store multiple resolutions and formats of each video, we can support <a target="_blank" rel="noopener" href="https://www.cloudflare.com/learning/video/what-is-adaptive-bitrate-streaming/">adaptive bitrate streaming</a>.
As the client's bandwidth fluctuates during playback, the resolution of the chunks being fetched can adapt accordingly.
For example, a client may begin streaming in 4k, but a temporary degradation of their wifi connection could cause some segments of the video to be rendered in 1080p.
This ensures smooth playback even when network conditions vary.
Transcoding into several resolutions also allows us to ensure low-latency streaming to users with permanently low bandwidth.

<img
  src="/images/system-design-interview/sdi-v1-ch14-2.png"
  alt="Initial design for video streaming"
  loading="lazy"
  width="705"
  class="centered-img"
/>

---

## Design Deep Dive

### Video Processing

For each uploaded video, we want a pipeline that produces:

- Video segments encoded in different formats / resolutions
- Manifest files, which state the resolutions and codecs available
- Transcriptions (captions) translated into each supported language
- Thumbnails
- Video metadata such as duration

These operations can be modeled as a directed acyclic graph (DAG).
Some steps, like metadata and thumbnail generation, only need to happen once.
Video and audio encoding need to happen once for each chunk in each resolution.
Similarly, the transcription needs to be translated into each supported language.

<img
  src="/images/system-design-interview/sdi-v1-ch14-3.png"
  alt="Sample of a video processing DAG"
  loading="lazy"
  width="705"
  class="centered-img"
/>

Intermediate steps can be stored in blob storage (audio, video) or in a db (metadata).
This prevents all work from being lost if one step in the DAG fails.
We can also introduce retry logic into our DAG to handle transient errors gracefully.

### Video Upload Optimizations

Videos can be uploaded to blob storage in fingerprinted chunks.
This allows for resumable uploads and reduces the likelihood of catastrophic upload failures caused by temporary network issues.
This also allows for multiple chunks to be uploaded in parallel, speeding up the upload process.

We can also improve upload speed by geographically distributing our blob storage and routing clients to the nearest region.

### Scaling Video Streaming with CDNs

It would be prohibitively expensive to use CDNs for every video.
Instead, we can employ CDNs when delivering popular videos.
When streaming begins, clients can first check to see if the segments exist in the CDN, falling back to the streaming services if not.
CDNs can be used automatically when based on factors like view thresholds, uploader subscriber counts, ML model predictions, etc.

### Final High-Level Design

<img
  src="/images/system-design-interview/sdi-v1-ch14-4.png"
  alt="Our Final High-Level Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our Final High-Level Design</p>

---

## Other Resources

Articles:

- The Hello Interview team has a great article walking through <a target="_blank" rel="noopener" href="https://www.cloudflare.com/learning/video/what-is-adaptive-bitrate-streaming/">handling large files</a>

Videos:

<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/jWRW2xGMqSw?si=2wrtatOG08N_fxT8"
        title="Video - System Design: Design YouTube"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
    <iframe
        src="https://www.youtube.com/embed/IUrQ5_g3XKs?si=57tOLz-vnq8wc11M"
        title="Video - System Design Interview: Design YouTube w/ an Ex-Meta Staff Engineer"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrer-policy="strict-origin-when-cross-origin"
        allow-full-screen="true"
        loading="lazy"
    ></iframe>
</div>

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
