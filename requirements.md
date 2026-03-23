# Spring Music — Business Requirements

## 1. Overview

Spring Music is a sample web application demonstrating Cloud Foundry service binding and Spring Boot multi-persistence capabilities. It manages a catalog of music albums and allows users to perform full CRUD operations through a browser-based UI. The application is designed to run both locally and on Cloud Foundry, switching between persistence backends without code changes.

---

## 2. Functional Requirements

### 2.1 Album Catalog Management

- The system shall maintain a catalog of music albums.
- Each album record shall contain the following attributes:
  - **ID** — unique identifier (system-generated, 40-character string)
  - **Title** — album title (required)
  - **Artist** — performing artist or band (required)
  - **Release Year** — four-digit year in the range 1000–2999 (required)
  - **Genre** — music genre (required)
  - **Track Count** — number of tracks on the album (integer)
  - **Album ID** — optional external reference identifier

### 2.2 CRUD Operations

| Operation | Description |
|-----------|-------------|
| **List**   | Retrieve and display all albums in the catalog |
| **Add**    | Create a new album record via a modal form |
| **Update** | Edit an existing album via a modal form or inline field editing |
| **Delete** | Remove an album from the catalog by ID |

- All create and update operations shall validate input fields before saving.
- Release year shall be validated against the pattern `[1-2]\d{3}` (e.g., 1991, 2024).
- Empty field values shall not be accepted during inline editing.

### 2.3 Data Seeding

- On first startup, if the album repository is empty, the system shall automatically populate the catalog from a bundled seed file (`albums.json`).
- The seed data contains 29 pre-defined albums spanning genres including Rock and Blues.

### 2.4 User Interface

- The UI shall present albums in a **grid view** by default, with an option to switch to a **list view**.
- Albums shall be sortable by field (default sort: name, ascending).
- Users shall be able to edit individual album fields **inline** (in-place editing) without opening a form modal.
- The UI shall display success and error status messages after save and delete operations.

### 2.5 Application Information Display

- The application shall expose a `/appinfo` endpoint returning:
  - Active Spring profiles
  - Names of currently bound Cloud Foundry services
- The application shall expose a `/service` endpoint listing all bound CF services and their details.

---

## 3. Persistence Requirements

### 3.1 Supported Database Backends

The application shall support the following persistence backends, selectable via Spring profiles:

| Profile      | Database           | Type           |
|--------------|--------------------|----------------|
| *(default)*  | H2 (in-memory)     | Relational     |
| `mysql`      | MySQL              | Relational     |
| `postgres`   | PostgreSQL         | Relational     |
| `oracle`     | Oracle DB          | Relational     |
| `sqlserver`  | Microsoft SQL Server | Relational   |
| `mongodb`    | MongoDB            | Document store |
| `redis`      | Redis              | Key-value store|

### 3.2 Profile Activation Rules

- Exactly **one** database profile may be active at a time.
- If more than one database profile is active simultaneously, the application shall throw an `IllegalStateException` and refuse to start.
- If no profile is specified, the application shall default to an in-memory H2 relational database.

### 3.3 Schema Management

- For JPA-backed profiles, DDL shall be auto-generated (`spring.jpa.generate-ddl: true`).
- For Redis, albums shall be serialized and stored as JSON using Jackson.

---

## 4. Cloud Foundry Integration Requirements

### 4.1 Automatic Service Detection

- When deployed on Cloud Foundry, the application shall automatically detect bound services by inspecting service tags in the CF environment.
- The detected service type shall determine which Spring profile is activated — no manual profile configuration shall be required.
- Supported service tags for auto-detection: `mongodb`, `postgres`, `mysql`, `redis`, `oracle`, `sqlserver`.

### 4.2 Service Binding Constraints

- Only **one** service of a supported database type may be bound to the application at a time.
- If more than one supported service is bound, the application shall throw an `IllegalStateException` and refuse to start.
- If no supported service is bound, the application shall fall back to the in-memory H2 database.

### 4.3 User-Provided Services

- The application shall support user-provided Cloud Foundry services using a `uri` credential field in the format:
  ```
  <dbtype>://<username>:<password>@<hostname>:<port>/<databasename>
  ```
- Supported URI schemes: `mysql`, `oracle`, and other supported types.

### 4.4 Spring Auto-Reconfiguration

- Spring Boot auto-reconfiguration by the Java Buildpack shall be **disabled** (`JBP_CONFIG_SPRING_AUTO_RECONFIGURATION: '{enabled: false}'`) to preserve explicit application configuration.

---

## 5. REST API Requirements

The application shall expose a RESTful JSON API under the `/albums` base path:

| Method   | Endpoint       | Description                        |
|----------|----------------|------------------------------------|
| `GET`    | `/albums`      | Return all albums                  |
| `GET`    | `/albums/{id}` | Return a single album by ID        |
| `PUT`    | `/albums`      | Create a new album                 |
| `POST`   | `/albums`      | Update an existing album           |
| `DELETE` | `/albums/{id}` | Delete an album by ID              |

- All request/response bodies shall use JSON.
- Input payloads shall be validated (`@Valid`).
- All mutating operations shall be logged at INFO level.

---

## 6. Operational Requirements

### 6.1 Health & Monitoring

- The application shall expose all Spring Boot Actuator endpoints over HTTP.
- The `/actuator/health` endpoint shall display full health details (`show-details: always`).

### 6.2 Build & Deployment

- The application shall be buildable into a single executable JAR using `./gradlew clean assemble`.
- The JAR shall be deployable to Cloud Foundry with `cf push` using the provided `manifest.yml`.
- The application requires **Java 8 or later** to compile and run.
- On CF, the application shall be allocated **1 GB of memory** and assigned a random route by default.

### 6.3 Error Handling

- The application shall provide a dedicated error controller to handle and display application errors gracefully in the UI.

---

## 7. Technology Stack

| Layer             | Technology                                      |
|-------------------|-------------------------------------------------|
| Framework         | Spring Boot 2.4.0                               |
| Persistence       | Spring Data JPA, Spring Data MongoDB, Spring Data Redis |
| CF Integration    | Java CFEnv 2.1.2                                |
| Build Tool        | Gradle 6.7                                      |
| Frontend          | AngularJS 1.2, Bootstrap 3, jQuery 2.1          |
| Default Database  | H2 (in-memory)                                  |
| Runtime           | Java 8+                                         |
