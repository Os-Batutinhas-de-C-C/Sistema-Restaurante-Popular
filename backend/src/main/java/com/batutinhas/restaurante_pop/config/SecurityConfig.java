package com.batutinhas.restaurante_pop.config;

import com.batutinhas.restaurante_pop.dto.ApiErrorDTO;
import tools.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, ObjectMapper objectMapper) throws Exception {
        var authenticationEntryPoint = (org.springframework.security.web.AuthenticationEntryPoint)
                (request, response, exception) -> {
                    response.setStatus(401);
                    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    objectMapper.writeValue(response.getOutputStream(),
                            new ApiErrorDTO("UNAUTHORIZED", "Autenticação necessária ou token inválido."));
                };
        var accessDeniedHandler = (org.springframework.security.web.access.AccessDeniedHandler)
                (request, response, exception) -> {
                    response.setStatus(403);
                    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    objectMapper.writeValue(response.getOutputStream(),
                            new ApiErrorDTO("FORBIDDEN", "Seu perfil não tem permissão para esta operação."));
                };

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<String> roles = jwt.getClaimAsStringList("roles");
            if (roles == null) return List.of();
            return roles.stream()
                    .<GrantedAuthority>map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .toList();
        });

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/noticias").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cardapios/publicos").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/mensagens/publicas").permitAll()
                        .requestMatchers("/api/semanas/**", "/api/refeicoes/**", "/api/estoque/**")
                        .hasAnyRole("NUTRICIONISTA", "GESTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/noticias/**")
                        .hasAnyRole("NUTRICIONISTA", "GESTOR")
                        .requestMatchers("/api/mensagens/**")
                        .hasAnyRole("NUTRICIONISTA", "GESTOR", "CAIXA")
                        .requestMatchers("/api/noticias/**").authenticated()
                        .requestMatchers("/api/usuarios/**").authenticated()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .oauth2ResourceServer(resourceServer -> resourceServer
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
