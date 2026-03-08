---
title: Database Internals Ch. 8 - Distributed Systems Intro & Overview
description: Notes on Chapter 8 of Database Internals by Alex Petrov. Concurrency, fallacies of distributed computing, and failure models.
published: March 8, 2026
updated: March 8, 2026
minutesToRead: 11
path: /articles/database-internals-chapter-8/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
collection:
  slug: database-internals
  title: Database Internals
  shortTitle: Ch. 8 - Distributed Systems Intro & Overview
  shortDescription: Concurrency, fallacies of distributed computing, and failure models.
  order: 8
---

## Database Internals - Ch. 8 - Distributed Systems Intro & Overview

<p class="subtitle">11 minute read • March 8, 2026</p>

This post contains my notes on Chapter 8 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Preface: Distributed Algorithms

Part 2 of this book discusses distributed systems, so we'll need to start with a few definitions. Distributed algorithms serve many purposes, such as:

- Coordination - a process that supervises the actions and behaviors of several workers
- Cooperation - multiple participants relying on one another for finishing their task
- Dissemination - process cooperating in spreading the information to all interested parties
- Consensus - achieving agreement among multiple processes

---

### Concurrent Execution

Every concurrency problem has some properties of a distributed system. Threads access the shared state, perform some operations locally, and propagate the results back to the shared variables. To define execution histories precisely and reduce the number of possible outcomes, we need "consistency models". These describe concurrent executions and establish an order in which operations can be executed and made visible to the participants. In concurrent systems, we can have shared memory, which processes can use to exchange information. In a distributed system, each process has local state and participants communicate by passing messages.

#### Shared State in a Distributed System

We can try to introduce some notion of shared memory to a distributed system, such as a database. Even if we solve the problems with concurrent access to it, we still cannot guarantee that all processes are in sync. To access this db, process can send messages over the communication medium. We'll therefore have to describe the system in terms of "synchrony" - whether the system is async, or if we can make some assumptions about timing. These assumptions give us options like timeouts and retries.

We don't always know the "nature" of an issue - if we haven't received a response because of a network issue, because the resource is overloaded, or because of a system crash. "Failure models" describe the ways in which failures can occur and how we decide to handle them. "Fault tolerance" describes the degree to which our system keeps operating correctly even when failures occur.

---

### Fallacies of Distributed Computing

It is usually reasonable to assume that the network is at least semi-reliable. We should, however, make as few assumptions as possible about latency. We should also not assume bandwidth is unlimited.

#### Processing

We cannot assume that processing is instantaneous. There's also no guarantee that processing starts as soon as the message is delivered. We cannot expect different nodes (with potentially different hardware, different geographic distances, etc.) to process the same type of message at the same speed.

Process-local queues can be used to achieve the following goals:

- Decoupling - receipt and processing are separated in time and happen independently
- Pipelining - requests in different stages are handled by different parts of the system. The subsystem responsible for receiving messages doesn't have to block until the previous message is fully processed
- Absorbing short-time bursts - system load tends to vary, but request inter-arrival times are hidden from the components responsible for request processing

#### Clocks and Time

We cannot assume that clocks on different machines run in sync.

#### State Consistency

Distributed algorithms don't always guarantee strict consistency. Some have looser constraints and allow state divergence between replicas, and rely on resolution and real-time data repair.

#### Local and Remote Execution

Hiding complexity behind an API can sometimes be dangerous in concurrent systems if we don't understand the logic of what's happening behind the scenes. We must also keep in mind that local and remote execution are not the same, and often experience much different latency.

#### Need to Handle Failures

Processes can fail, and we should be prepared for these failures and how to handle them. Some distributed algorithms use heartbeat protocols and failure detectors to determine which processes are alive.

#### Network Partitions and Partial Failures

A "network partition" is when two or more servers cannot communicate with each other. Independently partitioned groups can cause consistency problems when things like network errors are experienced asymmetrically. We therefore have to consider partial failures. When working with distributed systems, we have to take fault-tolerance, resilience, possible failure scenarios, and edge cases very seriously.

#### Cascading Failures

We cannot always isolate failures. Cascading failures can propagate from one part of the system to another, increasing the scope of the problem. "Circuit breakers" can be used to protect a system from propagating failures and can help treat failure scenarios gracefully. Backoff can be used to increase time periods between client retries. "Jitter" can help by adding small random time variations to the backoff, distributing the load of multiple retrying clients. <a href="https://noahtigner.com/articles/database-internals-chapter-3/#checksumming" target="_blank" rel="noopener">Checksumming</a> and other validation techniques can be used to ensure data integrity.

---

### Distributed Systems Abstractions

#### Links

Links connect two processes together. Processes can send messages to each other, but all communication mediums are imperfect, and messages can get lost or delayed.

"Fair loss links" are links where the sender has no way of knowing if the message gets delivered. The properties for this type of link are:

- Fair loss - if both sender and receiver work correctly and the sender keeps resending, the message will eventually be delivered
- Finite duplication - sent messages won't get delivered infinitely many times
- No creation - the link won't deliver messages that were never sent

Receivers can acknowledge the receipt of the message, notifying the sender. This requires the link to support bidirectional communication. We also need to use sequence numbers or some other means of distinguishing between messages.

Until an "ack" is received by the sender, it has no way of knowing if the message was processed. Retrying the message could result in duplication. It is therefore only safe to proceed if the process is idempotent, meaning that executing it multiple times won't change the outcome or result in side-effects. We can't always guarantee idempotency in our operations, but we can provide equivalent guarantees with deduplication.

Messages can arrive out of order and can be duplicated. Unique IDs like sequence numbers can be used by the recipient to ensure FIFO processing and deduplication.

A "perfect link" provides the following guarantees:

- Reliable delivery - every message sent once is eventually delivered
- No duplication
- No creation

There is some debate over whether or not perfect links are possible. Most real-world systems use "at-least once" delivery, where senders retry until they receive acks. Another option is "at-most once", where messages are sent once and the sender doesn't expect any confirmation. It's not possible to ensure that a message is sent only once, but it's possible to ensure that it is processed exactly once.

---

### Two Generals Problem

The Two Generals problem is a thought experiment that shows that it is impossible to achieve an agreement between two parties if communication is asynchronous and links fail. Imagine two allied armies led by two generals, preparing to attack the same city, arrayed on either side of it. Their siege will only succeed if they attack at the same time. They can communicate by sending messages, but they have to agree to both attack simultaneously. The messenger carrying the message might get captured, causing the message to not get delivered. The same could happen with the acknowledgement. No matter how many further confirmations are sent, the generals will always be one ack away from knowing if the attack can succeed.

---

### FLP Impossibility

FLP Impossibility is a problem where the authors discuss a form of consensus in which processes start with an initial value and agree on another. This new value has to be the same for all non-faulty processes. For a consensus protocol to be correct, it has to have these three properties:

- Agreement - the decision has to be unanimous
- Validity - the agreed upon value has to be proposed by one of the participants, not just some predefined default (akin to "no creation")
- Termination - an agreement is final if and only if there are no processes that did not reach the decision state

The problem assumes that processing is asynchronous, meaning that there's no way for participants to know if one participant has crashed. FLP Impossibility does not mean that reaching consensus is impossible, just that it can't always be reached in a purely asynchronous system in bounded time.

---

### System Synchrony

As discussed above, we can't guarantee message delivery order or delivery in bounded time at all in an async system. However, by introducing the notion of timing, we can loosen our assumptions and reason about the system synchronously. Designing systems with the synchronous model allows us to use timeouts, on top of which we can build more complex abstractions like leader election, consensus, failure detection, etc. This makes systems easier to reason about, and makes the best-case scenarios more robust. It also means that failures can occur when our assumptions about timing don't hold up. We can also think about systems as partially synchronous.

---

### Failure Models

Failure models describe how exactly processes can crash in a distributed system. These assumptions are used when developing the distributed algorithms used by our systems.

#### Crash Faults

The simplest way for a process to crash is by stopping execution and not notifying other processes. The "crash-stop" abstraction prescribes that once a process has crashed, it remains in that state. It does not assume that it is impossible for the process to recover, only that the algorithm does not rely on its recovery for correctness.

"Crash-recovery" is a different process abstraction under which the process stops but recovers later on and tries to participate in further steps. The possibility of recovery requires introducing recovery protocols and durable state into the system.

#### Omission Faults

"Omission Faults" is a failure model that assumes that the process skips some of the algorithm steps, or it can't communicate with other participants. It can be caused by overloaded networks, full queues, etc.

#### Arbitrary Faults

Arbitrary (a.k.a. "Byzantine") faults are where a process continues executing algorithm steps, but in a way that contradicts the algorithm. These can be caused by software bugs, different participants running different versions of the algorithm, etc.

#### Handling Failures

We can "mask" failures by forming process groups and introducing redundancy, but this can impact performance. Many of the algorithms discussed in later chapters assume the crash-failure model and work around failures by introducing redundancy.

---

### Other Resources

Tom Scott has a great video covering the Two General's Problem, a real-world example, and how idempotency can help.

<iframe
    src="https://www.youtube.com/embed/IP-rGJKSZ3s?si=wi7R8hj2OMb2reFv"
    title="Video - The Two Generals’ Problem"
    allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrer-policy="strict-origin-when-cross-origin"
    allow-full-screen="true"
    loading="lazy"
    style="width:100% !important"
></iframe>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
