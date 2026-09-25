package dev.okanaltun.pickup.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RateLimitFilterTest {

    private final RateLimitFilter filter = new RateLimitFilter("secret");

    private MockHttpServletResponse call(RateLimitFilter filter, MockHttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }

    private MockHttpServletResponse call(String address, String uri) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", uri);
        request.setRemoteAddr(address);
        return call(filter, request);
    }

    private MockHttpServletRequest forwarded(String forwardedFor) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/series");
        request.setRemoteAddr("10.0.0.1");
        request.addHeader("X-Forwarded-For", forwardedFor);
        return request;
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

    @Test
    void ignores_a_made_up_address_in_front_of_the_real_one() throws Exception {
        for (int i = 0; i < 120; i++) {
            call(filter, forwarded("9.9.9." + i + ", 6.6.6.6"));
        }

        assertThat(call(filter, forwarded("8.8.8.8, 6.6.6.6")).getStatus()).isEqualTo(429);
    }

    @Test
    void lets_the_middleware_through_with_the_right_key() throws Exception {
        for (int i = 0; i < 200; i++) {
            MockHttpServletRequest request = forwarded("7.7.7.7");
            request.addHeader(RateLimitFilter.KEY_HEADER, "secret");
            assertThat(call(filter, request).getStatus()).isEqualTo(200);
        }
    }

    @Test
    void counts_a_wrong_key_like_any_other_caller() throws Exception {
        for (int i = 0; i < 120; i++) {
            MockHttpServletRequest request = forwarded("7.7.7.8");
            request.addHeader(RateLimitFilter.KEY_HEADER, "guess");
            call(filter, request);
        }

        MockHttpServletRequest request = forwarded("7.7.7.8");
        request.addHeader(RateLimitFilter.KEY_HEADER, "guess");
        assertThat(call(filter, request).getStatus()).isEqualTo(429);
    }

    @Test
    void lets_nobody_skip_the_limit_when_no_key_is_set() throws Exception {
        RateLimitFilter keyless = new RateLimitFilter("");
        for (int i = 0; i < 120; i++) {
            call(keyless, forwarded("7.7.7.9"));
        }

        MockHttpServletRequest request = forwarded("7.7.7.9");
        request.addHeader(RateLimitFilter.KEY_HEADER, "");
        assertThat(call(keyless, request).getStatus()).isEqualTo(429);
    }

    @Test
    void stays_bounded_when_flooded_with_fresh_addresses() throws Exception {
        RateLimitFilter small = new RateLimitFilter("", 100);
        for (int i = 0; i < 1_000; i++) {
            call(small, forwarded("10.1." + (i / 250) + "." + (i % 250)));
        }

        assertThat(small.trackedCallers()).isLessThanOrEqualTo(101);
        assertThat(call(small, forwarded("7.7.7.10")).getStatus()).isEqualTo(200);
    }
}
