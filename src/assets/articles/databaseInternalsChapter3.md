---
title: Database Internals Notes - Chapter 3 - File Formats
description: Notes on Chapter 3 of Database Internals by Alex Petrov. File formats for on-disk storage structures.
published: February 4, 2026
updated: February 4, 2026
minutesToRead: 7
path: /articles/database-internals-chapter-3/
image: /images/database-internals.jpg
tags:
  - 'reading notes'
  - 'databases'
  - 'distributed systems'
---

## Database Internals - Ch. 3 - File Formats

<p class="subtitle">7 minute read • February 4, 2026</p>

This post contains my notes on Chapter 3 of <a href="https://www.oreilly.com/library/view/database-internals/9781492040330/" target="_blank" rel="noopener">_Database Internals_</a> by Alex Petrov. The chapter discusses file formats for on-disk storage structures, binary encoding, memory layouts, pages, versioning, checksumming, etc. These notes are intended as a reference and are not meant as a substitute for the original text. I found <a href="https://timilearning.com/posts/ddia/notes/" target="_blank" rel="noopener">Timilehin Adeniran's notes</a> on <a href="https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/" target="_blank" rel="noopener">_Designing Data-Intensive Applications_</a> extremely helpful while reading that book, so I thought I'd try to do the same here.

---

### Binary Encoding

In order to efficiently store data on-disk, we need to encode it using a format that is easy to serialize and deserialize.

#### Primitive Types

When working with multi-byte numeric values, care must be taken to be consistent with endianness. Endianness, or the byte order, determines the sequential order of bytes. <a href="https://en.wikipedia.org/wiki/Endianness" target="_blank" rel="noopener">Byte order can be big-endian or little-endian</a>.

Records consist of primitives such as integers, floats, booleans, etc. When transferring or storing this data on-disk, we serialize it into bytes. The bytes are then deserialized during read operations.

#### Strings and Variable-Sized Data

The numbers 30 and 31 take up the same amount of bytes, but the strings "thirty" and "thirty-one" do not. When serialized, strings and other variable-sized data types are often prefixed with a length field representing their size in bytes. This lets the system know exactly how many bytes to read until the string has been fully processed. An alternative is to null-terminate each string, where the system keeps reading bytes until a null value is reached. Variable-sized data types present additional challenges when it comes to making efficient use of page space.

#### Bit-Packed Data: Booleans, Enums, and Flags

Types like booleans, enums, and flags don't take up an entire byte. We can take advantage of this fact to pack multiple into a single byte to save space. Bitwise operations and techniques such as bit-masking and bit-shifting can be employed to bit-pack data efficiently. Sean Anderson published an extremely useful list of bitwise techniques titled _<a href="https://graphics.stanford.edu/~seander/bithacks.html" target="_blank" rel="noopener">Bit Twiddling Hacks</a>_.

---

### General Principles

When designing file formats, we start by deciding how memory addressing will work. Files usually start with a fixed-size header and sometimes a fixed-size trailer as well. These hold auxiliary information about the layout and structure of the data being stored on the file. The rest of the data is split into pages. Many data stores have a fixed schema which saves data since position can be used for context instead of each field needing to be stored alongside its field name and type. Database files often consist of multiple parts, with a lookup table used for navigation.

---

### Page Structure

Data and index files are partitioned into fixed-size pages, typically 4-16kb. <a href="https://noahtigner.com/articles/database-internals-chapter-2/" target="_blank" rel="noopener">In B-Trees</a>, each node occupies one page or sometimes multiple pages linked together.

---

### Slotted Pages

In order to manage space efficiently when working with variable-sized records, we need a page format that allows us to:

- store variable-sized records with minimal overhead
- reclaim space occupied by removed records
- reference records in the page without having to know their exact location

PostgreSQL and other databases use slotted pages, which organize the page into a collection of slots (cells) and separate pointers and cells into independent memory regions on opposite sides of the page. They have fixed-size headers that hold metadata about the page and cells. These address the above three problems:

- [x] minimal overhead: the only overhead is the pointer array holding the offsets to where the records are stored
- [x] space reclamation: space can be reclaimed by defragmenting and rewriting the page
- [x] dynamic layout: from outside the page, slots are referenced only by their IDs

---

### Cell Layout

On a cell-level, we distinguish key cells from key-value cells. Key cells hold a separator key and a pointer to the page **between** the two neighboring pointers. Key-value cells hold keys and the records associated with them. All cells within a page are "uniform"; they hold either only key cells or only key-value cells, and all cells hold either only fixed-size data or variable-sized data. This allows us to store metadata descriptors once at the page level instead of repeating it in every cell.

For both key and key-value cells, we need to know:

- the cell type, which can be inferred from the page metadata
- the key's size
- the key's bytes

For key cells, we also need to know:

- the ID of the child page the cell is pointing to

For key-value cells, we also need to know:

- the value's size
- the value's bytes

---

### Combining Cells into Slotted Pages

Cells are appended to the right side of the page while cell pointers (offsets) are kept on the left side. Keys can be inserted out of order; their logical sorted order is maintained by storing the cell pointers in sorted order. This allows cells to be appended to the page with minimal effort.

---

### Managing Variable-Sized Data

When removing an item from a page, we don't have to remove or shift the actual cell. Instead, the cell is marked as deleted and its pointer is added to the in-memory availability list. When inserting new cells, we first check this list to see if there's a segment where the data would fit.

SQLite calls unoccupied segments "freeblocks". The page header contains a pointer to the first freeblock as well as the total sum of available bytes within the page. During inserts, this allows us to quickly determine if a new element will fit into the page (after defragmentation, in some cases). If there is enough cumulative space but not enough consecutive space, we defragment the page before inserting. If there is not enough cumulative space at all, we create an overflow page—a separate page to store data that doesn't fit in the original page.

---

### Versioning

Binary file formats can change over time as developers add new features. To support this, files and their formats must be versioned. There are several techniques for this:

- Apache Cassandra prefixes file names with the version number
- Postgres stores the version in the _PG_VERSION_ file
- Some systems store the versions directly in the index file headers. The encoding format for these headers therefore cannot change

---

### Checksumming

Files on disk can get corrupted due to hardware and software failures. To identify corrupt data, we can use a variety of techniques such as:

- Checksums, which usually compute XOR with parity checks or summation. This is the weakest form of guarantee; it is unable to detect corruption across multiple bits
- Cyclic Redundancy Checks (CRCs), which use lookup tables and polynomial division. This technique can detect burst errors, where multiple consecutive bits are corrupted

Both of these techniques reduce large chunks of data to small numbers, which can be used to validate data integrity quickly. Before writing data to disk, we compute its checksum and store it alongside the data (usually in the page header). When reading the data, we compute its checksum again and compare the new checksum against the stored one. If there's a mismatch, we know the data was corrupted.

---

Ken Wagatsuma has an excellent blog post about <a href="https://kenwagatsuma.com/blog/postgresql-slotted-pages" target="_blank" rel="noopener">how PostgreSQL implements slotted pages</a>.

Ben Dicken of PlanetScale recently released a video discussing cell layout in the context of database pages and B-Trees.

<iframe
    src="https://www.youtube.com/embed/gs7IL_Pd4tQ?si=KVwUSIBdjG2IUAbc"
    title="Video - The BEST way to organize data (in a database)"
    allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrer-policy="strict-origin-when-cross-origin"
    allow-full-screen="true"
    loading="lazy"
></iframe>

---

<p class="subtitle"><i>Database Internals</i> by Alex Petrov (O'Reilly). Copyright 2019 Oleksander Petrov, 978-1-492-04034-7</p>
