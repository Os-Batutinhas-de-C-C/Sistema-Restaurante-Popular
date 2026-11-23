package com.batutinhas.restaurante_pop;

import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.MensagemRepository;
import com.batutinhas.restaurante_pop.repository.NoticiaRepository;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class JwtSecurityIntegrationTests {
    private static final String PASSWORD = "integration-test-password";

    @Value("${local.server.port}")
    private int port;

    @Value("${app.security.jwt.issuer}")
    private String issuer;

    private final HttpClient client = HttpClient.newHttpClient();

    @Autowired private ObjectMapper objectMapper;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private MensagemRepository mensagemRepository;
    @Autowired private NoticiaRepository noticiaRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtEncoder jwtEncoder;

    private Usuario nutricionista;
    private Usuario caixa;
    private Usuario gestor;

    @BeforeEach
    void setUp() {
        noticiaRepository.deleteAll();
        mensagemRepository.deleteAll();
        usuarioRepository.deleteAll();
        nutricionista = createUser("nutri-jwt@example.test", 'N');
        caixa = createUser("caixa-jwt@example.test", 'C');
        gestor = createUser("gestor-jwt@example.test", 'G');
    }

    @Test
    void loginReturnsOneHourBearerTokenAndRejectsInvalidCredentials() throws Exception {
        HttpResponse<String> login = request("POST", "/api/auth/login", null,
                "{\"email\":\"" + nutricionista.getEmailRecuperacao() + "\",\"senha\":\"" + PASSWORD + "\"}");
        assertEquals(200, login.statusCode());
        JsonNode response = objectMapper.readTree(login.body());
        assertEquals("Bearer", response.path("tokenType").asText());
        assertEquals(3600, response.path("expiresIn").asLong());
        assertTrue(response.path("accessToken").asText().split("\\.").length == 3);
        assertEquals("Nutricionista", response.path("usuario").path("perfil").asText());

        HttpResponse<String> invalid = request("POST", "/api/auth/login", null,
                "{\"email\":\"" + nutricionista.getEmailRecuperacao() + "\",\"senha\":\"wrong-password\"}");
        assertEquals(401, invalid.statusCode());
        assertTrue(invalid.body().contains("AUTHENTICATION_FAILED"));
    }

    @Test
    void missingMalformedAndExpiredTokensReturnJson401() throws Exception {
        HttpResponse<String> missing = request("GET", "/api/semanas", null, null);
        assertEquals(401, missing.statusCode());
        assertTrue(missing.headers().firstValue("Content-Type").orElse("").contains("application/json"));

        HttpResponse<String> malformed = request("GET", "/api/semanas", "not-a-jwt", null);
        assertEquals(401, malformed.statusCode());
        assertTrue(malformed.body().contains("UNAUTHORIZED"));

        HttpResponse<String> expired = request("GET", "/api/semanas", expiredToken(), null);
        assertEquals(401, expired.statusCode());
        assertTrue(expired.body().contains("UNAUTHORIZED"));
    }

    @Test
    void endpointPermissionsMatchPublicAndRoleRules() throws Exception {
        String nutriToken = token(nutricionista);
        String caixaToken = token(caixa);
        assertEquals(200, request("GET", "/api/semanas", nutriToken, null).statusCode());
        assertEquals(200, request("GET", "/api/estoque", nutriToken, null).statusCode());
        assertEquals(200, request("GET", "/api/refeicoes", nutriToken, null).statusCode());
        assertEquals(200, request("GET", "/api/usuarios", nutriToken, null).statusCode());
        HttpResponse<String> denied = request("GET", "/api/semanas", caixaToken, null);
        assertEquals(403, denied.statusCode());
        assertTrue(denied.body().contains("FORBIDDEN"));

        assertEquals(200, request("GET", "/api/mensagens", nutriToken, null).statusCode());
        assertEquals(200, request("GET", "/api/mensagens", caixaToken, null).statusCode());
        assertEquals(401, request("GET", "/api/desperdicio/hoje", null, null).statusCode());
        assertEquals(403, request("GET", "/api/desperdicio/hoje", nutriToken, null).statusCode());
        assertEquals(403, request("GET", "/api/desperdicio/hoje", caixaToken, null).statusCode());
        assertEquals(200, request("GET", "/api/noticias", null, null).statusCode());
        assertEquals(200, request("GET", "/api/cardapios/publicos", null, null).statusCode());

        HttpResponse<String> anonymousMessage = request("POST", "/api/mensagens/publicas", null,
                "{\"assunto\":\"Contato\",\"texto\":\"Mensagem pública de teste\"}");
        assertEquals(200, anonymousMessage.statusCode(), anonymousMessage.body());
        long messageId = objectMapper.readTree(anonymousMessage.body()).path("idMensagem").asLong();
        assertTrue(mensagemRepository.findById(messageId).orElseThrow().getUsuario() == null);
    }

    @Test
    void managerMayReadDailyIndicatorsAndOwnProfileButNotAdministrativeOperations() throws Exception {
        String gestorToken = token(gestor);
        for (String path : List.of("/api/desperdicio/hoje", "/api/fichas/hoje", "/api/noticias",
                "/api/cardapios/publicos", "/api/usuarios/me")) {
            assertEquals(200, request("GET", path, gestorToken, null).statusCode(), path);
        }

        for (String operation : List.of(
                "GET /api/semanas", "POST /api/semanas", "PUT /api/semanas/2026-11-23",
                "GET /api/refeicoes", "POST /api/refeicoes",
                "GET /api/estoque", "POST /api/estoque", "PUT /api/estoque/1", "DELETE /api/estoque/1",
                "POST /api/noticias", "DELETE /api/noticias/1",
                "GET /api/mensagens", "GET /api/mensagens/1", "POST /api/mensagens/usuario/1",
                "PUT /api/mensagens/1", "DELETE /api/mensagens/1",
                "GET /api/usuarios", "POST /api/usuarios", "POST /api/fichas/hoje/incrementos",
                "PUT /api/desperdicio/hoje")) {
            String[] parts = operation.split(" ", 2);
            HttpResponse<String> response = request(parts[0], parts[1], gestorToken, null);
            assertEquals(403, response.statusCode(), operation);
            assertEquals("FORBIDDEN", objectMapper.readTree(response.body()).path("code").asText(), operation);
        }
    }

    private Usuario createUser(String email, char role) {
        Usuario usuario = new Usuario();
        usuario.setNome("Conta de teste");
        usuario.setEmailRecuperacao(email);
        usuario.setTipo(role);

        CredencialAutenticacao credential = new CredencialAutenticacao();
        credential.setPasswordHash(passwordEncoder.encode(PASSWORD));
        credential.setUsuario(usuario);
        usuario.setCredencialAutenticacao(credential);
        return usuarioRepository.save(usuario);
    }

    private String token(Usuario usuario) throws Exception {
        String body = "{\"email\":\"" + usuario.getEmailRecuperacao() + "\",\"senha\":\"" + PASSWORD + "\"}";
        HttpResponse<String> response = request("POST", "/api/auth/login", null, body);
        assertEquals(200, response.statusCode(), response.body());
        return objectMapper.readTree(response.body()).path("accessToken").asText();
    }

    private String expiredToken() {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now.minusSeconds(7200))
                .expiresAt(now.minusSeconds(3600))
                .subject(nutricionista.getEmailRecuperacao())
                .claim("roles", List.of("NUTRICIONISTA"))
                .claim("userId", nutricionista.getIdUsuario())
                .claim("tokenVersion", nutricionista.getCredencialAutenticacao().getVersaoToken())
                .build();
        return jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims
        )).getTokenValue();
    }

    private HttpResponse<String> request(String method, String path, String bearerToken, String jsonBody) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Accept", "application/json");
        if (bearerToken != null) builder.header("Authorization", "Bearer " + bearerToken);
        if (jsonBody != null) builder.header("Content-Type", "application/json");
        builder.method(method, jsonBody == null
                ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(jsonBody));
        return client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }
}
