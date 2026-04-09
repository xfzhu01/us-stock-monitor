package com.usmonitor.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiConfigUpdateRequest {

    @NotBlank(message = "provider 不能为空")
    private String provider;

    @NotBlank(message = "model 不能为空")
    private String model;

    private String apiKey;
}
