package dev.okanaltun.pickup.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    static final String KEY_HEADER = "X-Pickup-Key";

    private record Window(long startedAt, AtomicInteger count) {
    }

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final byte[] middlewareKey;
    private final int maxCallers;

    @Autowired
    public RateLimitFilter(@Value("${pickup.middleware-key:}") String middlewareKey) {
        this(middlewareKey, 20_000);
    }

    RateLimitFilter(String middlewareKey, int maxCallers) {
        this.middlewareKey = middlewareKey.getBytes(StandardCharsets.UTF_8);
        this.maxCallers = maxCallers;
    }

    int trackedCallers() {
        return windows.size();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // The Vercel middleware renders pages for crawlers from a handful of shared addresses
        if (isMiddleware(request)) {
            chain.doFilter(request, response);
            return;
        }

        long now = System.currentTimeMillis();

        if (windows.size() > maxCallers) {
            windows.values().removeIf(w -> now - w.startedAt() > WINDOW_MS);
            // Still full means a flood of fresh addresses, so start over instead of growing
            if (windows.size() > maxCallers) {
                windows.clear();
            }
        }

        Window window = windows.compute(clientAddress(request),
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

    private boolean isMiddleware(HttpServletRequest request) {
        String key = request.getHeader(KEY_HEADER);
        return middlewareKey.length > 0 && key != null
                && MessageDigest.isEqual(middlewareKey, key.getBytes(StandardCharsets.UTF_8));
    }

    // Railway's proxy appends the address it saw, so only the last entry can't be made up
    private static String clientAddress(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null) {
            String[] hops = forwarded.split(",");
            String last = hops[hops.length - 1].trim();
            if (!last.isEmpty()) {
                return last;
            }
        }
        return request.getRemoteAddr();
    }
}
