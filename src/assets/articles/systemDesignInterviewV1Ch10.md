---
title: System Design Interview Vol. 1 Ch. 10 - Design a Notification System
description: Notes on Chapter 10 of System Design Interview by Alex Xu. Designing a notification system that supports push notifications, SMS, and email.
published: May 14, 2026
updated: May 14, 2026
minutesToRead: 6
path: /articles/system-design-interview-volume-1-chapter-10/
image: /images/system-design-interview.jpg
tags:
  - 'reading notes'
  - 'distributed systems'
collection:
  slug: system-design-interview
  title: System Design Interview
  shortTitle: Vol. 1 Ch. 10 - Design a Notification System
  shortDescription: Designing a notification system that supports push notifications, SMS, and email.
  order: 10
---

<p class="subtitle">6 minute read • May 14, 2026</p>

This post contains my notes on Chapter 10 of <a target="_blank" rel="noopener" href="https://a.co/d/06Zho5r7">_System Design Interview_</a> by Alex Xu and the ByteByteGo course and videos that accompany it. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

## Introduction

Notifications are a core part of most applications and services.
Examples include appointment reminders, delivery alerts, marketing blasts, etc.
This chapter covers a typical system design interview centered around notification delivery.

---

## Step 1 - Understand the Problem and Establish Design Scope

### Functional Requirements

- The system should support mobile push notifications (both iOS and Android), SMS messages, and emails
- Notifications can be triggered by client applications or scheduled server-side events
- Users should be able to opt out of future notifications

### Non-Functional Requirements

- Scalability - the system should be able to publish several million notifications per day
- Fault Tolerance + Reliability - delivery should be guaranteed, even when an internal or third-party service experiences temporary failures
- Delivery need not be instantaneous, but it should be minimized

---

## Step 2 - Propose a High-Level Design and Get Buy-In

### Notification Types

For all notification types supported by our system, there are three main components needed to send a notification:

- The provider, which builds and sends the notification request to the sending service (usually a third-party service)
- The (third-party) sending service
  - <a target="_blank" rel="noopener" href="https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns">Apple Push Notification Service</a> (APNS) for iOS push notifications
  - <a target="_blank" rel="noopener" href="https://firebase.google.com/docs/cloud-messaging">Firebase Cloud Messaging</a> (FCM) for Android push notifications
  - A service like <a target="_blank" rel="noopener" href="https://www.twilio.com/en-us/messaging/channels/sms">Twilio</a> for SMS messages
  - A service like <a target="_blank" rel="noopener" href="https://resend.com/emails">Resend</a> or SendGrid for emails, or your own <a target="_blank" rel="noopener" href="https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol">SMTP service</a>
- The client device that receives and displays the notification

### Contact Info Gathering Flow

Before we can send our notifications, we'll need to gather mobile device tokens, phone numbers, email addresses, etc.
We will likely want different database tables for users and devices.

| Column       | Type      |
| ------------ | --------- |
| id           | uuid      |
| email        | varchar   |
| phone_number | varchar   |
| created_at   | timestamp |

<p class="subtitle" style="text-align: center">Schema for the 'users' table</p>

| Column       | Type    |
| ------------ | ------- |
| id           | uuid    |
| user_id      | uuid    |
| device_token | varchar |
| device_type  | varchar |

<p class="subtitle" style="text-align: center">Schema for the 'devices' table</p>

### Notification Sending/Receiving Flow

<img
  src="/images/system-design-interview/sdi-v1-ch10-1.png"
  alt="Our Initial Design"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our Initial Design</p>

The "Sender" services represent any system that triggers notification publishing.
These could be CRON jobs, marketing blasts, automated account balance messages from a bank, etc.

The Notification System handles taking in message send requests, querying the database, sending messages to third-party services, etc.
This becomes a single point of failure (SPoF) and potential bottleneck, and can be hard to scale.
We can make several improvements:

- Make the Notification System servers stateless and automatically horizontally scalable
- Introduce caching to reduce database load
- Introduce message queues and workers for each supported notification type, decoupling system components and smoothing traffic bursts

<img
  src="/images/system-design-interview/sdi-v1-ch10-2.png"
  alt="Updated Design with Caching and Queues"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Updated Design with Caching and Queues</p>

---

## Step 3 - Design Deep Dive

### Reliability and Guaranteed Delivery

We must ensure that notifications are delivered and that data is never lost.
We therefore need to persist notification events in a database or log storage.
This allows us to retry delivery when a notification initially fails to send.
We should do our best to deduplicate notifications, but unfortunately we <a target="_blank" rel="noopener" href="https://bravenewgeek.com/you-cannot-have-exactly-once-delivery/">cannot guarantee that messages are delivered just once</a>.

When a third-party service fails to deliver a notification, we can add the notification back onto the corresponding queue.
Depending on our needs, we can allow several retries, with an increasing delay each time.
We do not want to keep re-enqueueing the same notification forever, so failing messages will eventually get pushed to a <a target="_blank" rel="noopener" href="https://aws.amazon.com/what-is/dead-letter-queue/">dead-letter queue</a> (DLQ) for developers to investigate.

### Notification Templates

Instead of constructing the body of each notification from scratch, we can use templates to ensure consistent formatting and to save time.
These templates could be stored in either a traditional database or in blob storage, with caching used for faster subsequent accesses.

### Preferences

We need to give users the option to opt out of all communications, and we often also want to provide fine-grained settings for desired notification types, topics, etc.
For push notifications, the app usually contains a screen for settings and/or preferences.
Emails often have a link near the bottom to a web page where users can opt out or update their preferences.
For SMS messages, many providers support opting out by responding directly.
These preferences can be stored in a 'preferences' table, which our system reads when collecting recipients.

### Rate Limiting

We should use <a target="_blank" rel="noopener" href="https://noahtigner.com/articles/system-design-interview-volume-1-chapter-4/">rate limiting</a> to avoid spamming users with too many notifications.
Our notification servers can check incoming notification requests against rate limits, dropping or delaying messages if they exceed the limits.
For the purpose of this design, rate limiting is simply treated as one responsibility of the notification servers (along with authorization).

### Monitoring

We need to monitor the total number of enqueued messages in each queue, adjusting the number of workers when necessary.

### Analytics

We'll want to track events such as notification clicks, dismissals, unsubscribes, etc.
Third-party analytics services are often used to aggregate these events.

### Final Design

<img
  src="/images/system-design-interview/sdi-v1-ch10-3.png"
  alt="Our Final Design for Push, SMS, and Email Notifications"
  loading="lazy"
  width="705"
  class="centered-img"
/>

<p class="subtitle" style="text-align: center">Our Final Design for Push, SMS, and Email Notifications</p>

---

<p class="subtitle"><i>System Design Interview - An Insider's Guide</i> by Alex Xu. Copyright 2020 Byte Code LLC</p>
