---
name: database-design
description: Design, review, and optimize database schemas, relational models, indexing strategies, foreign keys, migrations, and query performance for relational and document databases. Trigger when creating new tables, planning data models, optimizing slow queries, or structuring relational schemas.
---

# Database Schema Design & Optimization

Architect resilient, high-performance database schemas and migrations that scale gracefully without downtime or performance degradation.

## Core Principles

1. **Model Reality, Normalize First, Denormalize with Intent**: Begin with 3rd Normal Form (3NF). Only denormalize (e.g., caching a `total_amount` or `members_count`) when measured query benchmarks justify it.
2. **Indexes Are Never an Afterthought**: Every foreign key, unique constraint, and frequently filtered/sorted column must have a purpose-built index.
3. **Data Integrity Lives in the Database**: Use foreign key constraints, check constraints, enum types, and NOT NULL defaults in SQL, not just in application validation.

---

## 5 Design Pillars

### 1. Primary Keys & Identifiers
* **BigInteger Auto-increment**: Fast, memory-efficient, sequential (great for B-Tree indexing). Ideal for internal primary keys.
* **UUID / ULID**: Use for public-facing identifiers (`uuid` or `ulid` column) to prevent enumeration attacks and sequential ID sniffing in URLs, while keeping `id BIGINT` as the clustered primary key.

### 2. Foreign Keys & Cascading Rules
* Always explicitly define foreign key constraints.
* Choose cascading behavior with care:
  * `onDelete('cascade')`: For tightly coupled child records (e.g., `order_items` when an `order` is deleted).
  * `onDelete('restrict')` or `no action`: For financial, audit, or historical records (e.g., cannot delete a `plan` if active `subscriptions` exist).
  * `onDelete('set null')`: For optional references (e.g., `referred_by_user_id`).

### 3. Indexing Strategies
* **Foreign Keys**: Always index foreign key columns (`user_id`, `plan_id`).
* **Composite Indexes & Column Order**:
  * Put high-cardinality equality columns first (`status`, `tenant_id`, `created_at`).
  * Follow the Left-Most Prefix rule: An index on `(tenant_id, status, created_at)` can serve queries on `(tenant_id)` and `(tenant_id, status)`, but NOT `(status, created_at)` alone.
* **Avoid Over-Indexing**: Every index slows down `INSERT`, `UPDATE`, and `DELETE`. Index what you query, not every field.

### 4. Precision Data Types
* **Currency & Financials**: Never use `FLOAT` or `DOUBLE`. Always use `DECIMAL(10, 2)` or integer cents (`BIGINT`).
* **Timestamps**: Always store UTC in the database. Store dates as `DATE` and date-times as `TIMESTAMP` or `DATETIME`.
* **Booleans & Enums**: Use native boolean or tinyint(1). For states (`status`), use database ENUMs or short VARCHARs with application validation.

### 5. Zero-Downtime Migration Patterns
* **Adding Columns**: Make new columns `nullable` or provide a default value.
* **Renaming Columns**: Never rename directly in production. Follow expand-and-contract:
  1. Add new column.
  2. Write to both.
  3. Backfill old data.
  4. Switch reads to new column.
  5. Drop old column.
* **Adding Indexes to Large Tables**: Use concurrent indexing (`algorithm('concurrent')` in PostgreSQL or online DDL in MySQL) to avoid locking production tables.

---

## Review Checklist for Every Migration

- [ ] Does every foreign key have an index?
- [ ] Are nullability rules (`->nullable()` vs `->default()`) strictly defined?
- [ ] Are money/financial columns defined with exact precision (`DECIMAL`)?
- [ ] Are unique constraints defined for unique business values (e.g., email, slug, code)?
- [ ] Is the `down()` rollback method implemented and tested?
