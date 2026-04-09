package com.usmonitor.service;

import com.usmonitor.config.AiProperties;
import com.usmonitor.domain.UserAiConfig;
import com.usmonitor.dto.request.AiConfigUpdateRequest;
import com.usmonitor.dto.response.AiConfigVO;
import com.usmonitor.exception.BusinessException;
import com.usmonitor.repository.UserAiConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserAiConfigService {

    private static final Set<String> SUPPORTED_PROVIDERS = Set.of("claude", "openai", "openrouter", "gemini");

    private final UserAiConfigRepository userAiConfigRepository;
    private final AiProperties aiProperties;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public AiConfigVO getConfig() {
        UserAiConfig existing = findCurrentUserConfig();
        if (existing != null) {
            UserAiConfig config = existing;
            return AiConfigVO.builder()
                    .provider(config.getProvider())
                    .model(config.getModel())
                    .hasApiKey(StringUtils.hasText(config.getApiKey()))
                    .apiKeyMasked(maskApiKey(config.getApiKey()))
                    .updatedAt(config.getUpdatedAt())
                    .build();
        }

        ResolvedAiConfig fallback = getDefaultConfig();
        return AiConfigVO.builder()
                .provider(fallback.provider())
                .model(fallback.model())
                .hasApiKey(StringUtils.hasText(fallback.apiKey()))
                .apiKeyMasked(maskApiKey(fallback.apiKey()))
                .updatedAt(null)
                .build();
    }

    @Transactional
    public AiConfigVO saveConfig(AiConfigUpdateRequest request) {
        String provider = normalizeProvider(request.getProvider());
        String model = normalizeModel(request.getModel());

        UserAiConfig entity = findCurrentUserConfig();
        if (entity == null) {
            entity = new UserAiConfig();
        }
        String existingProvider = normalizeProvider(entity.getProvider(), false);

        String apiKey = normalizeApiKey(request.getApiKey());
        if (!StringUtils.hasText(apiKey)) {
            if (StringUtils.hasText(existingProvider) && existingProvider.equals(provider) && StringUtils.hasText(entity.getApiKey())) {
                apiKey = entity.getApiKey();
            } else {
                apiKey = getDefaultApiKey(provider);
            }
        }
        if (!StringUtils.hasText(apiKey)) {
            throw new BusinessException(400, "请填写 API Key");
        }

        entity.setConfigKey(currentUserService.getCurrentUserKey());
        entity.setProvider(provider);
        entity.setModel(model);
        entity.setApiKey(apiKey);

        UserAiConfig saved = userAiConfigRepository.save(entity);
        return AiConfigVO.builder()
                .provider(saved.getProvider())
                .model(saved.getModel())
                .hasApiKey(true)
                .apiKeyMasked(maskApiKey(saved.getApiKey()))
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public ResolvedAiConfig getResolvedConfig() {
        UserAiConfig current = findCurrentUserConfig();
        if (current == null) {
            return getDefaultConfig();
        }
        return new ResolvedAiConfig(
                normalizeProvider(current.getProvider()),
                normalizeModel(current.getModel()),
                normalizeApiKey(current.getApiKey()));
    }

    private UserAiConfig findCurrentUserConfig() {
        return userAiConfigRepository.findByConfigKey(currentUserService.getCurrentUserKey()).orElse(null);
    }

    private ResolvedAiConfig getDefaultConfig() {
        String provider = normalizeProvider(aiProperties.getProvider());
        return new ResolvedAiConfig(
                provider,
                getDefaultModel(provider),
                getDefaultApiKey(provider));
    }

    private String getDefaultModel(String provider) {
        return switch (provider) {
            case "openai" -> normalizeModel(aiProperties.getOpenai().getModel());
            case "openrouter" -> normalizeModel(aiProperties.getOpenrouter().getModel());
            case "gemini" -> normalizeModel(aiProperties.getGemini().getModel());
            default -> normalizeModel(aiProperties.getClaude().getModel());
        };
    }

    private String getDefaultApiKey(String provider) {
        return switch (provider) {
            case "openai" -> normalizeApiKey(aiProperties.getOpenai().getApiKey());
            case "openrouter" -> normalizeApiKey(aiProperties.getOpenrouter().getApiKey());
            case "gemini" -> normalizeApiKey(aiProperties.getGemini().getApiKey());
            default -> normalizeApiKey(aiProperties.getClaude().getApiKey());
        };
    }

    private String normalizeProvider(String provider) {
        return normalizeProvider(provider, true);
    }

    private String normalizeProvider(String provider, boolean required) {
        if (!StringUtils.hasText(provider)) {
            if (required) {
                throw new BusinessException(400, "provider 不能为空");
            }
            return "";
        }
        String normalized = provider.trim().toLowerCase(Locale.ROOT);
        if ("chatgpt".equals(normalized)) {
            normalized = "openai";
        }
        if ("google".equals(normalized)) {
            normalized = "gemini";
        }
        if (!SUPPORTED_PROVIDERS.contains(normalized)) {
            throw new BusinessException(400, "不支持的 provider: " + provider);
        }
        return normalized;
    }

    private String normalizeModel(String model) {
        if (!StringUtils.hasText(model)) {
            throw new BusinessException(400, "model 不能为空");
        }
        return model.trim();
    }

    private String normalizeApiKey(String apiKey) {
        return StringUtils.hasText(apiKey) ? apiKey.trim() : "";
    }

    private String maskApiKey(String apiKey) {
        if (!StringUtils.hasText(apiKey)) {
            return "";
        }
        String trimmed = apiKey.trim();
        if (trimmed.length() <= 8) {
            return "****";
        }
        return trimmed.substring(0, 4) + "****" + trimmed.substring(trimmed.length() - 4);
    }

    public record ResolvedAiConfig(String provider, String model, String apiKey) {
    }
}
