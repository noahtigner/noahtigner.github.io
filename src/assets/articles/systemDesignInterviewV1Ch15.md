---
title: System Design Interview Vol. 1 Ch. 15 - Design Google Drive
description: Notes on Chapter 15 of System Design Interview by Alex Xu. Designing a file storage service like Google Drive or Dropbox.
published: June 11, 2026
updated: June 11, 2026
minutesToRead: 6
path: /articles/system-design-interview-volume-1-chapter-15/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 15 - Design Google Drive
  shortDescription: Designing a file storage service like Google Drive or Dropbox.
  order: 15
---

<p class="subtitle">6 minute read • June 11, 2026</p>

This post contains my notes on Chapter 15 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it.
These notes are intended as a reference and are not meant as a substitute for the original text.
I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.
I tweak the requirements and offer my own suggestions to ensure that I am internalizing the material instead of just restating it.

---

## Requirements & Scope

This chapter's task is to design a file storage and synchronization service like Google Drive or Dropbox.
These files can be accessed on any device and shared between users.

### Functional Requirements

Core requirements:

- Users should be able to upload files from any of their devices
- Users should be able to download their files to any of their devices
- Files should automatically be synced between the user's devices

Out of scope:

- File sharing between users
- File organization
- Real-time collaborative editing (i.e., Google Docs)
- Notifications (covered in the book)

### Non-Functional Requirements

Core requirements:

- Prioritize availability over consistency for synchronization operations
- Low latency uploads and downloads
- Large files (<= 50 GB) must be supported
- Uploads should be resumable
- The system should be reliable and preserve data integrity

---

## Initial High-Level Design

We begin with a simple single-server setup.

### The API

- `POST /files` -> upload files
- `GET /files` -> list files
- `GET /files/{fileID}` -> download file
- `GET /files/revisions?since={timestamp}` -> list the changes to all files since some timestamp

### Moving Away From a Single-Server Setup

As discussed in <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-14/#initial-high-level-design">_Design a Video Sharing Platform_</a>, we'll want to upload videos to blob storage directly using presigned URLs.
Instead of `POST /files` being responsible for uploading the file to our server, it will instead provide presigned URLs which the client will use to upload to blob storage.
When files are uploaded, metadata such as the file name, type, size, owner, and blob storage key are inserted into a database.
Pre-signed URLs can then be generated on demand for uploads and downloads.
`GET /files/{fileID}` can therefore provide the presigned URL for the given file, enabling clients to download the file directly from blob storage.

We can scale out the API server by ensuring it is stateless.
We place a load balancer in front of these servers to route and distribute traffic.

### Syncing

We'll need to keep files synced between devices.
When a user updates a file, the file gets uploaded to blob storage and its metadata (`updated_at`, etc.) gets updated in the database.
Other devices can then poll for changes.
`GET /files/revisions?since={timestamp}` provides a list of files that have been updated, telling clients which files need to be re-downloaded.
Fetching the updated contents can be done eagerly or lazily, depending on the system's need.

As the number of clients grows, continuous polling can become expensive and introduce unnecessary latency.
We can instead use <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-12/#communication">long polling, Server-Sent Events (SSE), WebSockets</a>, or push notifications to notify clients when file revisions occur.

### Conflicts

Conflicts can arise when two clients (or users) attempt to update the same file concurrently.
There are several conflict resolution strategies that we could use, including:

- First write wins
- Last write wins
- Creating copies/variants when conflicts arise
- Automatic merging with <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/database-internals-chapter-11/#strong-eventual-consistency-and-crdts">CRDTs</a>

For the purposes of this system we will want to choose options 3 or 4, since we have strict requirements for data integrity and want to avoid data loss due to overwrites.

### Initial High-Level Design

<img
  src="/images/system-design-interview/sdi-v1-ch15-1.png"
  alt="Our Inital High-Level Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our Initial High-Level Design</p>

---

## Design Deep Dive

### Block Servers

What if only a single line in a file was changed?

Without chunking, the client would need to upload or download the entire file even though most of its contents were unchanged.
This can be optimized by splitting the file into small blocks (chunks).

Each block is hashed so that clients and servers can quickly determine which blocks have changed.
We can then use a process called delta sync to transfer only the modified blocks rather than the entire file.
Files are represented as ordered lists of block hashes, allowing the system to determine which blocks have changed, which blocks already exist, and how to reconstruct the file.
The metadata database maintains the mapping between files and their constituent blocks, while the blocks themselves are stored in blob storage.

Block Servers are responsible for:

- Chunking files into small blocks
- Managing block hash metadata
- Identifying changed blocks during synchronization
- Maintaining metadata that maps files to their constituent blocks
- Deduplication, encryption, compression, etc.

Rather than receiving a single presigned URL for an entire file, clients now receive metadata describing the file's blocks along with pre-signed URLs for each required block. The client then downloads the blocks directly from blob storage and reassembles the file locally.

Clients can compute block hashes locally before upload.
If a block already exists in storage, it can be skipped entirely.
Otherwise, only the new or modified blocks need to be uploaded.

### Metadata Database

File contents are stored in blob storage, while metadata is stored in a relational database like Postgres.
Metadata may include:

- File name
- File ID
- File size
- Owner
- Path / location
- `created_at` timestamp, `updated_at` timestamp, etc.
- Version number
- Block hashes (or references to constituent blocks)

This allows us to list files and identify block deltas without querying blob storage.

### Large File Uploads

Files are uploaded in chunks.
If an upload is interrupted, the client only needs to retry the missing chunks rather than restarting the entire transfer.
This is the same process discussed in <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-14/#video-upload-optimizations">_Design a Video Sharing Platform_</a>.

### Reliability & Data Integrity

To prevent data loss:

- File blocks should be replicated in blob storage across multiple availability zones or data centers
- The metadata database should be replicated and backed up routinely
- Hashes/checksums can be used to detect corrupted blocks
- Previous file versions may be retained to support recovery from accidental deletions, corruption, and synchronization conflicts

### Cost Savings

There are several optimizations we can make to our system to save costs:

- Routinely deduplicate blocks
- Set limits on total storage per user
- Set appropriate "cold storage" classes for infrequently accessed file contents (see <a target="_blank" rel="noopener" href="https://aws.amazon.com/s3/storage-classes/glacier/">S3 Glacier storage classes</a>)
- Expire and delete old file versions

### Final High-Level Design

<img
  src="/images/system-design-interview/sdi-v1-ch15-2.png"
  alt="Our Final High-Level Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our Final High-Level Design</p>

In this design, I refer to the former ‘API Servers’ as the Metadata Service, and the former ‘Block Servers’ as the Storage Service, to better reflect their responsibilities.

---

## Other Resources

 <iframe
    src="https://www.youtube.com/embed/_UZ1ngy-kOI?si=Q1uslCHm5u8OhvbC"
    title="Video - Design Dropbox or Google Drive w/ a Ex-Meta Staff Engineer System Design Interview"
    allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrer-policy="strict-origin-when-cross-origin"
    allow-full-screen="true"
    loading="lazy"
></iframe>

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
