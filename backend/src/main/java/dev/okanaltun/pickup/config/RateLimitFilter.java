package dev.okanaltun.pickup.config;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // Hovering the home page prefetches a series per card, so bursts are normal
    private static final int LIMIT = 120;
    private static final long WINDOW_MS = 60_000;

    // Addresses can be made up, so the map is swept before it grows unbounded
    private static final int MAX_CALLERS = 20_000;

    private record Window(long startedAt, AtomicInteger count) {
    }

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        long now = System.currentTimeMillis();

        if (windows.size() > MAX_CALLERS) {
            windows.values().removeIf(w -> now - w.startedAt() > WINDOW_MS);
        }

        Window window = windows.compute(request.getRemoteAddr(),
                (address, current) -> current == null || now - current.startedAt() > WINDOW_MS
                        ? new Window(now, new AtomicInteger())
                        : current);

        if (window.count().incrementAndGet() > LIMIT) {
            long secondsLeft = (WINDOW_MS - (now - window.startedAt())) / 1000 + 1;
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(secondsLeft));
            return;
        }

        chain.doFilter(request, response);
    }
}
