# Spring Music — Claude Code Guide

## Project Overview

Spring Music is a Cloud Foundry sample application demonstrating Spring Boot's ability to connect to multiple persistence backends using Spring profiles and Spring Data. It exposes a simple Album CRUD REST API with an AngularJS frontend.

## Tech Stack

- **Java 8+**, **Spring Boot 2.4.0**
- **Spring Data** — JPA, MongoDB, Redis
- **Java CFEnv 2.1.2** — Cloud Foundry service detection
- **Frontend** — AngularJS 1.2.16, Bootstrap 3.1.1, jQuery 2.1.0 (all via WebJars)
- **Build** — Gradle 6.7 (via wrapper)

## Build & Run Commands

```bash
# Build the JAR
./gradlew clean assemble            # outputs build/libs/spring-music-1.0.jar

# Run tests
./gradlew test

# Run locally (defaults to H2 in-memory)
java -jar build/libs/spring-music-1.0.jar

# Run with a specific profile
java -jar build/libs/spring-music-1.0.jar --spring.profiles.active=mysql
```

**On Windows, use `gradlew.bat` instead of `./gradlew`.**

## Persistence Profiles

Exactly **one** profile may be active at a time. Activating multiple throws `IllegalStateException`.

| Profile | Backend | Notes |
|---------|---------|-------|
| *(none)* | H2 (in-memory) | Default; data lost on restart |
| `mysql` | MySQL | JDBC URL: `jdbc:mysql://localhost/music` |
| `postgres` | PostgreSQL | JDBC URL: `jdbc:postgresql://localhost/music` |
| `oracle` | Oracle DB | Requires manual driver placement |
| `sqlserver` | SQL Server | |
| `mongodb` | MongoDB | |
| `redis` | Redis | |

On Cloud Foundry, `SpringApplicationContextInitializer` auto-detects bound services and activates the matching profile.

## Key Source Layout

```
src/main/java/org/cloudfoundry/samples/music/
├── Application.java                         # Spring Boot entry point
├── config/
│   ├── SpringApplicationContextInitializer.java  # Profile validation & CF detection
│   └── data/RedisConfig.java               # Redis template bean
├── domain/
│   ├── Album.java                           # Core domain model
│   ├── ApplicationInfo.java                 # App info DTO
│   └── RandomIdGenerator.java              # UUID-based Hibernate generator
├── repositories/
│   ├── AlbumRepositoryPopulator.java        # Seeds data from albums.json on startup
│   ├── jpa/JpaAlbumRepository.java
│   ├── mongodb/MongoAlbumRepository.java
│   └── redis/RedisAlbumRepository.java
└── web/
    ├── AlbumController.java                 # CRUD REST endpoints
    ├── ErrorController.java                 # Intentional error endpoints (testing)
    └── InfoController.java                  # /appinfo and /service endpoints
```

Static frontend lives in `src/main/resources/static/`.
Seed data (29 albums) is in `src/main/resources/albums.json`.

## Architecture Notes

- All repository implementations (`Jpa`, `Mongo`, `Redis`) expose the same `CrudRepository` interface — `AlbumController` depends only on `CrudRepository<Album, String>`.
- Profile-based exclusion of unused auto-configurations happens in `SpringApplicationContextInitializer`.
- `AlbumRepositoryPopulator` seeds the store once on first startup (skips if not empty).
- All Spring Boot Actuator endpoints are exposed over HTTP; health details are always shown.

## Cloud Foundry Deployment

```bash
cf push    # uses manifest.yml — allocates 1 GB, assigns random route
```

Auto-reconfiguration is disabled (`JBP_CONFIG_SPRING_AUTO_RECONFIGURATION: '{enabled: false}'`); the app handles its own service binding via Java CFEnv.

## Testing

Tests live in `src/test/java/org/cloudfoundry/samples/music/`. Currently only a basic context-load test exists. Run with:

```bash
./gradlew test
```

## Intentional Error Endpoints

`ErrorController` exposes these for resilience testing — do not remove them:
- `GET /errors/kill` — kills the process
- `GET /errors/fill-heap` — fills the heap
- `GET /errors/throw` — throws a runtime exception
