package dev.okanaltun.pickup.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RateLimitFilterTest {

    private final RateLimitFilter filter = new RateLimitFilter();

    private MockHttpServletResponse call(String address, String uri) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", uri);
        request.setRemoteAddr(address);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }

    @Test
    void lets_a_normal_burst_through() throws Exception {
        for (int i = 0; i < 120; i++) {
            assertThat(call("1.1.1.1", "/api/series").getStatus()).isEqualTo(200);
        }
    }

    @Test
    void turns_away_the_caller_that_goes_over() throws Exception {
        for (int i = 0; i < 120; i++) {
            call("2.2.2.2", "/api/series");
        }

        MockHttpServletResponse response = call("2.2.2.2", "/api/series");

        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getHeader("Retry-After")).isNotNull();
    }

    @Test
    void counts_each_caller_on_its_own() throws Exception {
        for (int i = 0; i < 121; i++) {
            call("3.3.3.3", "/api/series");
        }

        assertThat(call("4.4.4.4", "/api/series").getStatus()).isEqualTo(200);
    }

    @Test
    void leaves_everything_outside_the_api_alone() throws Exception {
        for (int i = 0; i < 200; i++) {
            assertThat(call("5.5.5.5", "/actuator/health").getStatus()).isEqualTo(200);
        }
    }
}
