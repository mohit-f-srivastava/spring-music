package org.cloudfoundry.samples.music.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.cloudfoundry.samples.music.domain.Album;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.repository.CrudRepository;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Characterization tests for AlbumController — pins current behaviour, not correctness.
 *
 * Run against the default (H2 in-memory) profile. The populator seeds 29 albums on first
 * startup; mutation tests create their own albums and clean them up via createdIds so the
 * seed pool is left intact.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class AlbumCrudCharacterizationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private CrudRepository<Album, String> albumRepository;
    @Autowired private ObjectMapper objectMapper;

    /** IDs of albums created during a test; deleted in @After so seed data stays intact. */
    private final List<String> createdIds = new ArrayList<>();

    @After
    public void cleanUpCreatedAlbums() {
        createdIds.forEach(id -> albumRepository.deleteById(id));
        createdIds.clear();
    }

    // ── Seed data ─────────────────────────────────────────────────────────────────────

    @Test
    public void seedDataLoads29Albums() {
        // AlbumRepositoryPopulator seeds from albums.json when the store is empty at startup.
        assertThat(albumRepository.count(), is(29L));
    }

    @Test
    public void seedDataIncludesNevermindByNirvana() throws Exception {
        mockMvc.perform(get("/albums"))
                .andExpect(jsonPath("$[?(@.title == 'Nevermind' && @.artist == 'Nirvana')]").isNotEmpty());
    }

    @Test
    public void seedDataIncludesThrilllerByMichaelJackson() throws Exception {
        mockMvc.perform(get("/albums"))
                .andExpect(jsonPath("$[?(@.title == 'Thriller' && @.artist == 'Michael Jackson')]").isNotEmpty());
    }

    @Test
    public void seedDataIncludesAbbeyRoadByTheBeatles() throws Exception {
        mockMvc.perform(get("/albums"))
                .andExpect(jsonPath("$[?(@.title == 'Abbey Road' && @.artist == 'The Beatles')]").isNotEmpty());
    }

    @Test
    public void seedDataOnlyContainsRockBluesAndPopGenres() throws Exception {
        // albums.json contains exactly Rock, Blues, and Pop genres — nothing else
        mockMvc.perform(get("/albums"))
                .andExpect(jsonPath("$[?(@.genre != 'Rock' && @.genre != 'Blues' && @.genre != 'Pop')]").isEmpty());
    }

    @Test
    public void seedAlbumsHaveZeroTrackCount() throws Exception {
        // albums.json omits trackCount; int primitive defaults to 0
        mockMvc.perform(get("/albums"))
                .andExpect(jsonPath("$[*].trackCount", everyItem(is(0))));
    }

    @Test
    public void seedAlbumsHaveNullAlbumId() throws Exception {
        // albums.json omits albumId; serialised as JSON null
        mockMvc.perform(get("/albums"))
                .andExpect(jsonPath("$[*].albumId", everyItem(nullValue())));
    }

    // ── GET /albums ───────────────────────────────────────────────────────────────────

    @Test
    public void getAllAlbumsReturns200() throws Exception {
        mockMvc.perform(get("/albums"))
                .andExpect(status().isOk());
    }

    @Test
    public void getAllAlbumsContentTypeIsJson() throws Exception {
        mockMvc.perform(get("/albums"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    public void getAllAlbumsReturnsJsonArray() throws Exception {
        mockMvc.perform(get("/albums"))
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void getAllAlbumsReturns29Items() throws Exception {
        mockMvc.perform(get("/albums"))
                .andExpect(jsonPath("$.length()").value(29));
    }

    @Test
    public void albumJsonShapeContainsIdTitleArtistReleaseYearGenreTrackCount() throws Exception {
        mockMvc.perform(get("/albums"))
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].title").exists())
                .andExpect(jsonPath("$[0].artist").exists())
                .andExpect(jsonPath("$[0].releaseYear").exists())
                .andExpect(jsonPath("$[0].genre").exists())
                .andExpect(jsonPath("$[0].trackCount").exists());
    }

    @Test
    public void albumIdsAreUuidStrings() throws Exception {
        // RandomIdGenerator calls UUID.randomUUID().toString() — 36-char hyphenated hex
        mockMvc.perform(get("/albums"))
                .andExpect(jsonPath("$[0].id",
                        matchesPattern("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")));
    }

    // ── GET /albums/{id} ──────────────────────────────────────────────────────────────

    @Test
    public void getByIdReturns200AndMatchingAlbum() throws Exception {
        String id = albumRepository.findAll().iterator().next().getId();

        mockMvc.perform(get("/albums/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));
    }

    @Test
    public void getByIdReturnsAllFieldsForKnownAlbum() throws Exception {
        String id = albumRepository.findAll().iterator().next().getId();

        mockMvc.perform(get("/albums/{id}", id))
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.title").isString())
                .andExpect(jsonPath("$.artist").isString())
                .andExpect(jsonPath("$.releaseYear").isString())
                .andExpect(jsonPath("$.genre").isString())
                .andExpect(jsonPath("$.trackCount").isNumber());
    }

    @Test
    public void getByUnknownIdReturns200NotA404() throws Exception {
        // CHARACTERIZATION: AlbumController.getById does repository.findById(id).orElse(null).
        // Spring serialises the null return as HTTP 200 — there is no 404 path in this controller.
        mockMvc.perform(get("/albums/{id}", "does-not-exist"))
                .andExpect(status().isOk());
    }

    // ── PUT /albums (create) ──────────────────────────────────────────────────────────

    @Test
    public void putAlbumReturns200() throws Exception {
        MvcResult result = mockMvc.perform(put("/albums")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Put Test\",\"artist\":\"A\",\"releaseYear\":\"2000\",\"genre\":\"Rock\"}"))
                .andExpect(status().isOk())
                .andReturn();
        createdIds.add(extractId(result));
    }

    @Test
    public void putAlbumAssignsGeneratedUuidId() throws Exception {
        MvcResult result = mockMvc.perform(put("/albums")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Put Test\",\"artist\":\"A\",\"releaseYear\":\"2000\",\"genre\":\"Rock\"}"))
                .andExpect(jsonPath("$.id",
                        matchesPattern("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")))
                .andReturn();
        createdIds.add(extractId(result));
    }

    @Test
    public void putAlbumReturnsAllSentFields() throws Exception {
        MvcResult result = mockMvc.perform(put("/albums")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Roundtrip\",\"artist\":\"B\",\"releaseYear\":\"1999\",\"genre\":\"Blues\",\"trackCount\":11}"))
                .andExpect(jsonPath("$.title").value("Roundtrip"))
                .andExpect(jsonPath("$.artist").value("B"))
                .andExpect(jsonPath("$.releaseYear").value("1999"))
                .andExpect(jsonPath("$.genre").value("Blues"))
                .andExpect(jsonPath("$.trackCount").value(11))
                .andReturn();
        createdIds.add(extractId(result));
    }

    @Test
    public void putAlbumWithoutTrackCountDefaultsToZero() throws Exception {
        MvcResult result = mockMvc.perform(put("/albums")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"No TC\",\"artist\":\"A\",\"releaseYear\":\"2000\",\"genre\":\"Rock\"}"))
                .andExpect(jsonPath("$.trackCount").value(0))
                .andReturn();
        createdIds.add(extractId(result));
    }

    @Test
    public void putAlbumWithoutAlbumIdSerializesNullAlbumId() throws Exception {
        MvcResult result = mockMvc.perform(put("/albums")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"No AID\",\"artist\":\"A\",\"releaseYear\":\"2000\",\"genre\":\"Rock\"}"))
                .andExpect(jsonPath("$.albumId", nullValue()))
                .andReturn();
        createdIds.add(extractId(result));
    }

    @Test
    public void putAlbumWithExplicitIdPreservesId() throws Exception {
        // When the client supplies an id, JPA save() treats it as an upsert and keeps the id
        MvcResult result = mockMvc.perform(put("/albums")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"char-explicit-id\",\"title\":\"Explicit\",\"artist\":\"A\",\"releaseYear\":\"2000\",\"genre\":\"Rock\"}"))
                .andExpect(jsonPath("$.id").value("char-explicit-id"))
                .andReturn();
        createdIds.add(extractId(result));
    }

    @Test
    public void putAlbumIsPersisted() throws Exception {
        MvcResult result = mockMvc.perform(put("/albums")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Persisted\",\"artist\":\"A\",\"releaseYear\":\"2000\",\"genre\":\"Rock\"}"))
                .andReturn();
        String id = extractId(result);
        createdIds.add(id);

        mockMvc.perform(get("/albums/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Persisted"));
    }

    // ── POST /albums (update) ─────────────────────────────────────────────────────────

    @Test
    public void postAlbumReturns200() throws Exception {
        Album album = albumRepository.save(new Album("Post Src", "A", "2000", "Rock"));
        createdIds.add(album.getId());

        mockMvc.perform(post("/albums")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(albumJson(album.getId(), "Post Src", "A", "2000", "Rock")))
                .andExpect(status().isOk());
    }

    @Test
    public void postAlbumUpdatesAllFields() throws Exception {
        Album album = albumRepository.save(new Album("Original", "OldArtist", "2000", "Rock"));
        createdIds.add(album.getId());

        mockMvc.perform(post("/albums")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(albumJson(album.getId(), "Updated", "NewArtist", "2005", "Blues")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(album.getId()))
                .andExpect(jsonPath("$.title").value("Updated"))
                .andExpect(jsonPath("$.artist").value("NewArtist"))
                .andExpect(jsonPath("$.releaseYear").value("2005"))
                .andExpect(jsonPath("$.genre").value("Blues"));
    }

    @Test
    public void postAlbumUpdateIsVisibleInSubsequentGet() throws Exception {
        Album album = albumRepository.save(new Album("Before", "A", "2000", "Rock"));
        createdIds.add(album.getId());

        mockMvc.perform(post("/albums")
                .contentType(MediaType.APPLICATION_JSON)
                .content(albumJson(album.getId(), "After", "A", "2000", "Rock")));

        mockMvc.perform(get("/albums/{id}", album.getId()))
                .andExpect(jsonPath("$.title").value("After"));
    }

    // ── DELETE /albums/{id} ───────────────────────────────────────────────────────────

    @Test
    public void deleteAlbumReturns200() throws Exception {
        Album album = albumRepository.save(new Album("ToDelete", "A", "2000", "Rock"));

        mockMvc.perform(delete("/albums/{id}", album.getId()))
                .andExpect(status().isOk());
    }

    @Test
    public void deleteAlbumRemovesItFromRepository() throws Exception {
        Album album = albumRepository.save(new Album("ToDelete", "A", "2000", "Rock"));
        String id = album.getId();

        mockMvc.perform(delete("/albums/{id}", id));

        assertThat(albumRepository.findById(id).isPresent(), is(false));
    }

    @Test
    public void deleteAlbumNoLongerAppearsInGetAll() throws Exception {
        Album album = albumRepository.save(new Album("ToDelete", "A", "2000", "Rock"));
        String id = album.getId();

        mockMvc.perform(delete("/albums/{id}", id));

        mockMvc.perform(get("/albums"))
                .andExpect(jsonPath("$[?(@.id == '" + id + "')]").isEmpty());
    }

    @Test
    public void deleteReducesAlbumCountByOne() throws Exception {
        Album album = albumRepository.save(new Album("ToDelete", "A", "2000", "Rock"));
        long countBefore = albumRepository.count();

        mockMvc.perform(delete("/albums/{id}", album.getId()));

        assertThat(albumRepository.count(), is(countBefore - 1));
    }

    // ── helpers ───────────────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String extractId(MvcResult result) throws Exception {
        Map<String, Object> body = objectMapper.readValue(
                result.getResponse().getContentAsString(), Map.class);
        return (String) body.get("id");
    }

    private String albumJson(String id, String title, String artist, String year, String genre) {
        return String.format(
                "{\"id\":\"%s\",\"title\":\"%s\",\"artist\":\"%s\",\"releaseYear\":\"%s\",\"genre\":\"%s\"}",
                id, title, artist, year, genre);
    }
}
