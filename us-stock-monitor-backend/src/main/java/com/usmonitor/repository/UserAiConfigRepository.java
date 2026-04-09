package com.usmonitor.repository;

import com.usmonitor.domain.UserAiConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAiConfigRepository extends JpaRepository<UserAiConfig, Long> {

    Optional<UserAiConfig> findByConfigKey(String configKey);
}
