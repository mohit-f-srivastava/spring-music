package org.cloudfoundry.samples.music.web;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Characterization tests for InfoController — pins current behaviour of /appinfo and /service.
 *
 * Both endpoints rely on CfEnv. Without a CF_SERVICES environment variable the library returns
 * empty collections; the tests below lock in that baseline.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class InfoControllerCharacterizationTest {

    @Autowired private MockMvc mockMvc;

    // ── GET /appinfo ──────────────────────────────────────────────────────────────────

    @Test
    public void appInfoReturns200() throws Exception {
        mockMvc.perform(get("/appinfo"))
                .andExpect(status().isOk());
    }

    @Test
    public void appInfoContentTypeIsJson() throws Exception {
        mockMvc.perform(get("/appinfo"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    public void appInfoBodyHasProfilesField() throws Exception {
        mockMvc.perform(get("/appinfo"))
                .andExpect(jsonPath("$.profiles").exists());
    }

    @Test
    public void appInfoBodyHasServicesField() throws Exception {
        mockMvc.perform(get("/appinfo"))
                .andExpect(jsonPath("$.services").exists());
    }

    @Test
    public void appInfoProfilesIsAnArray() throws Exception {
        mockMvc.perform(get("/appinfo"))
                .andExpect(jsonPath("$.profiles").isArray());
    }

    @Test
    public void appInfoServicesIsAnArray() throws Exception {
        mockMvc.perform(get("/appinfo"))
                .andExpect(jsonPath("$.services").isArray());
    }

    @Test
    public void appInfoProfilesIsEmptyUnderDefaultH2Profile() throws Exception {
        // No explicit Spring profile is activated for H2; getActiveProfiles() returns [].
        // If this starts failing a named profile was added to the test environment.
        mockMvc.perform(get("/appinfo"))
                .andExpect(jsonPath("$.profiles").isEmpty());
    }

    @Test
    public void appInfoServicesIsEmptyWithoutCfServicesEnvVar() throws Exception {
        // CfEnv finds no bound services when CF_SERVICES is absent (local dev / unit test run)
        mockMvc.perform(get("/appinfo"))
                .andExpect(jsonPath("$.services").isEmpty());
    }

    // ── GET /service ──────────────────────────────────────────────────────────────────

    @Test
    public void serviceEndpointReturns200() throws Exception {
        mockMvc.perform(get("/service"))
                .andExpect(status().isOk());
    }

    @Test
    public void serviceEndpointContentTypeIsJson() throws Exception {
        mockMvc.perform(get("/service"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    public void serviceEndpointReturnsAnArray() throws Exception {
        mockMvc.perform(get("/service"))
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void serviceEndpointReturnsEmptyArrayWithoutCfServicesEnvVar() throws Exception {
        mockMvc.perform(get("/service"))
                .andExpect(jsonPath("$").isEmpty());
    }
}
