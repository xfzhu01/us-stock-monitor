package com.usmonitor.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class CurrentUserService {

    private static final String USER_ID_HEADER = "X-User-Id";
    private static final String DEFAULT_USER_KEY = "default";
    private static final int MAX_USER_KEY_LENGTH = 100;

    public String getCurrentUserKey() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (!(attributes instanceof ServletRequestAttributes servletAttributes)) {
            return DEFAULT_USER_KEY;
        }
        HttpServletRequest request = servletAttributes.getRequest();
        String userId = request.getHeader(USER_ID_HEADER);
        if (!StringUtils.hasText(userId)) {
            return DEFAULT_USER_KEY;
        }
        String normalized = userId.trim();
        if (normalized.length() > MAX_USER_KEY_LENGTH) {
            normalized = normalized.substring(0, MAX_USER_KEY_LENGTH);
        }
        return normalized;
    }
}
