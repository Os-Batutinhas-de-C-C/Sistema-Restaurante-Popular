package com.batutinhas.restaurante_pop.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class FichasConfig {
    @Bean("fichasClock")
    @ConditionalOnMissingBean(name = "fichasClock")
    public Clock fichasClock() {
        return Clock.system(ZoneId.of("America/Fortaleza"));
    }
}
