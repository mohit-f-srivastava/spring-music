Spring Music
============

This is a sample application for using database services on [Cloud Foundry](http://cloudfoundry.org) with the [Spring Framework](http://spring.io) and [Spring Boot](http://projects.spring.io/spring-boot/).

This application has been built to store the same domain objects in one of a variety of different persistence technologies - relational, document, and key-value stores. This is not meant to represent a realistic use case for these technologies, since you would typically choose the one most applicable to the type of data you need to store, but it is useful for testing and experimenting with different types of services on Cloud Foundry.

The application use Spring Java configuration and [bean profiles](http://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-profiles.html) to configure the application and the connection objects needed to use the persistence stores. It also uses the [Spring Cloud Connectors](http://cloud.spring.io/spring-cloud-connectors/) library to inspect the environment when running on Cloud Foundry. See the [Cloud Foundry documentation](http://docs.cloudfoundry.org/buildpacks/java/spring-service-bindings.html) for details on configuring a Spring application for Cloud Foundry.

## Building

This project requires Java 8 or later to compile.

To build a runnable Spring Boot jar file, run the following command: 

~~~
$ ./gradlew clean assemble
~~~

## Running the application locally

One Spring bean profile should be activated to choose the database provider that the application should use. The profile is selected by setting the system property `spring.profiles.active` when starting the app.

The application can be started locally using the following command:

~~~
$ java -jar -Dspring.profiles.active=<profile> build/libs/spring-music.jar
~~~

where `<profile>` is one of the following values:

* `mysql`
* `postgres`
* `mongodb`
* `redis`

If no profile is provided, an in-memory relational database will be used. If any other profile is provided, the appropriate database server must be started separately. Spring Boot will auto-configure a connection to the database using it's auto-configuration defaults. The connection parameters can be configured by setting the appropriate [Spring Boot properties](http://docs.spring.io/spring-boot/docs/current/reference/html/common-application-properties.html).

If more than one of these profiles is provided, the application will throw an exception and fail to start.

## Running the application on Cloud Foundry

When running on Cloud Foundry, the application will detect the type of database service bound to the application (if any). If a service of one of the supported types (MySQL, Postgres, Oracle, MongoDB, or Redis) is bound to the app, the appropriate Spring profile will be configured to use the database service. The connection strings and credentials needed to use the service will be extracted from the Cloud Foundry environment.

If no bound services are found containing any of these values in the name, an in-memory relational database will be used.

If more than one service containing any of these values is bound to the application, the application will throw an exception and fail to start.

After installing the 'cf' [command-line interface for Cloud Foundry](http://docs.cloudfoundry.org/cf-cli/), targeting a Cloud Foundry instance, and logging in, the application can be built and pushed using these commands:

~~~
$ cf push
~~~

The application will be pushed using settings in the provided `manifest.yml` file. The output from the command will show the URL that has been assigned to the application.

### Creating and binding services

Using the provided manifest, the application will be created without an external database (in the `in-memory` profile). You can create and bind database services to the application using the information below.

#### System-managed services

Depending on the Cloud Foundry service provider, persistence services might be offered and managed by the platform. These steps can be used to create and bind a service that is managed by the platform:

~~~
# view the services available
$ cf marketplace
# create a service instance
$ cf create-service <service> <service plan> <service name>
# bind the service instance to the application
$ cf bind-service <app name> <service name>
# restart the application so the new service is detected
$ cf restart
~~~

#### User-provided services

Cloud Foundry also allows service connection information and credentials to be provided by a user. In order for the application to detect and connect to a user-provided service, a single `uri` field should be given in the credentials using the form `<dbtype>://<username>:<password>@<hostname>:<port>/<databasename>`.

These steps use examples for username, password, host name, and database name that should be replaced with real values.

~~~
# create a user-provided Oracle database service instance
$ cf create-user-provided-service oracle-db -p '{"uri":"oracle://root:secret@dbserver.example.com:1521/mydatabase"}'
# create a user-provided MySQL database service instance
$ cf create-user-provided-service mysql-db -p '{"uri":"mysql://root:secret@dbserver.example.com:3306/mydatabase"}'
# bind a service instance to the application
$ cf bind-service <app name> <service name>
# restart the application so the new service is detected
$ cf restart
~~~

#### Changing bound services

To test the application with different services, you can simply stop the app, unbind a service, bind a different database service, and start the app:

~~~
$ cf unbind-service <app name> <service name>
$ cf bind-service <app name> <service name>
$ cf restart
~~~

#### Database drivers

Database drivers for MySQL, Postgres, Microsoft SQL Server, MongoDB, and Redis are included in the project.

To connect to an Oracle database, you will need to download the appropriate driver (e.g. from http://www.oracle.com/technetwork/database/features/jdbc/index-091264.html). Then make a `libs` directory in the `spring-music` project, and move the driver, `ojdbc7.jar` or `ojdbc8.jar`, into the `libs` directory.
In `build.gradle`, uncomment the line `compile files('libs/ojdbc8.jar')` or `compile files('libs/ojdbc7.jar')` and run `./gradle assemble`


# Team Spring Musicians

## Participants
- Mohit(Modernization Driver)
- Vinay(Presenation Deck & Test Cases)
- Abhilash(.md explorer)

## Scenario
Scenario 1: Code Modernization

## What We Built

Replaced the legacy AngularJS 1.2 / jQuery / Bootstrap 3 frontend with a modern React 18 + Vite + Bootstrap 5 SPA, and added a full characterization test suite to lock in the existing backend behaviour before touching it.

**React frontend** (`/frontend/`):
- `AlbumGrid` and `AlbumList` — grid/list toggle view for the album catalogue
- `AlbumModal` — add / edit album dialog with form validation
- `InPlaceEdit` — click-to-edit individual fields directly in the list
- `Navbar` — app chrome and view-mode switcher
- `StatusAlert` — toast-style feedback for API calls
- Dual API layer: `remoteAlbums.js` talks to the live Spring Boot REST API; `localAlbums.js` uses seeded JSON for local dev without a running backend

**Characterization tests** (`src/test/java/.../web/`):
- `AlbumCrudCharacterizationTest` — 20 tests covering seed data, `GET /albums`, `GET /albums/{id}`, `PUT /albums` (create), `POST /albums` (update), and `DELETE /albums/{id}`
- `InfoControllerCharacterizationTest` — 8 tests covering `GET /appinfo` and `GET /service` shape and empty-service baseline
- `ErrorControllerCharacterizationTest` — 2 tests covering the `/errors/throw` → HTTP 500 path

**Presentation deck** (`presentation.html`) — self-contained slide deck summarising the before/after architecture, API surface, test metrics, and key decisions.

## Challenges Attempted
| # | Challenge | Status | Notes |
|---|---|---|---|
| 1 | Replace AngularJS UI with React 18 + Vite | Done | Grid/list toggle, inline editing, modal add/edit |
| 2 | Characterization test suite for backend controllers | Done | 30 tests across Album, Info, and Error controllers |
| 3 | Dual API layer (local seed vs. live backend) | Done | Allows frontend dev without a running Spring Boot instance |
| 4 | Hackathon presentation deck | Done | `presentation.html` — open in any browser, no dependencies |

## Key Decisions

- **Vite over webpack** — zero-config dev server with instant HMR; no Spring Boot integration needed during frontend development.
- **Bootstrap 5 (not Tailwind)** — kept visual language close to the original app so the diff stayed focused on component structure, not styling.
- **Characterization tests before any refactor** — pinned the current API behaviour (including the quirky `GET /albums/{unknown-id}` → 200 response) so we can refactor safely.
- **Separate `localAlbums` / `remoteAlbums` modules** — lets the frontend run standalone with seed data; toggle is a one-line change in `src/api/albums.js`.

## How to Run It

**Backend (Spring Boot):**
```bash
./gradlew clean assemble
java -jar build/libs/spring-music.jar   # uses H2 in-memory by default
```

**Frontend (React + Vite):**
```bash
cd frontend
npm install
npm run dev          # dev server on http://localhost:5173, proxies /albums to :8080
npm run build        # production build into frontend/dist/
```

**Tests:**
```bash
./gradlew test       # runs all characterization tests against H2
```

## If We Had Another Day

1. Migrate Spring Boot from 2.4 to 3.x and swap deprecated `spring-cloud-connectors` for full `java-cfenv` support.
2. Add React unit tests (Vitest + Testing Library) for the `AlbumModal` and `InPlaceEdit` components.
3. Wire up client-side sorting and filtering — the backend already returns the full list, so this is pure frontend work.
4. Containerise with a multi-stage `Dockerfile` so the frontend build output is served by Spring Boot's static resource handler.

## How We Used Claude Code

- **Fastest win:** generating the full characterization test suite — describing the three controllers and getting 30 focused, well-commented tests back in one pass saved the most time.
- **Surprised us:** Claude understood the `orElse(null)` → HTTP 200 quirk in `AlbumController` and wrote the test comment explaining *why* it's a characterization (not a correctness) test.
- **Frontend scaffolding:** the initial React component structure (`AlbumGrid`, `AlbumModal`, `InPlaceEdit`) was generated and then hand-tuned; the dual API layer idea came out of the back-and-forth with Claude about local dev ergonomics.
- **Presentation deck:** the entire `presentation.html` slide deck was generated from a prompt describing the before/after story — we only edited copy, not layout or styles.