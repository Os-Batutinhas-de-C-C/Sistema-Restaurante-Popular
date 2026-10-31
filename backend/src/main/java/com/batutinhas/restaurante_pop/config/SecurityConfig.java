package com.batutinhas.restaurante_pop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/noticias").permitAll()
                
                .requestMatchers("/api/refeicoes/**").hasRole("NUTRICIONISTA")
                .requestMatchers("/api/semanas/**").hasRole("NUTRICIONISTA")
                .requestMatchers("/api/estoque/**").hasRole("NUTRICIONISTA")

                .requestMatchers("/api/vendas/**").hasRole("CAIXA")

                .requestMatchers("/api/mensagens/**").hasAnyRole("NUTRICIONISTA", "CAIXA")

                .anyRequest().authenticated()
            )
            .httpBasic(org.springframework.security.config.Customizer.withDefaults()); // Reativa o basic auth provisoriamente para testes

        return http.build();
    }
}
