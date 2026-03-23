package org.cloudfoundry.samples.music.web;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Characterization tests for ErrorController — pins current behaviour of the safe error endpoint.
 *
 * /errors/kill  — NOT tested: calls System.exit(1); would terminate the JVM.
 * /errors/fill-heap — NOT tested: infinite loop allocating int[]; would cause OOM in the test JVM.
 * /errors/throw — tested: throws NullPointerException; Spring's default error handling returns 500.
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class ErrorControllerCharacterizationTest {

    @Autowired private MockMvc mockMvc;

    @Test
    public void throwEndpointReturns500() throws Exception {
        // ErrorController.throwException() throws new NullPointerException("Forcing an exception…")
        // Spring Boot's default error handling translates unhandled exceptions to 500.
        mockMvc.perform(get("/errors/throw"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    public void throwEndpointIsReachableViaGetMethod() throws Exception {
        // @RequestMapping with no method constraint accepts all HTTP methods — GET works
        mockMvc.perform(get("/errors/throw"))
                .andExpect(status().isInternalServerError()); // 500, not 405
    }
}
