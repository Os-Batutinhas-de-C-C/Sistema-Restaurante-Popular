package com.batutinhas.restaurante_pop;

import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.MensagemRepository;
import com.batutinhas.restaurante_pop.repository.NoticiaRepository;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
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
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.datasource.url=jdbc:h2:mem:perfil_api_tests;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
                "spring.datasource.driver-class-name=org.h2.Driver",
                "spring.datasource.username=sa",
                "spring.datasource.password=",
                "spring.jpa.hibernate.ddl-auto=create-drop",
                "spring.jpa.show-sql=false",
                "spring.jpa.open-in-view=false",
                "spring.profiles.active=default",
                "app.security.jwt.issuer=perfil-api-tests",
                "app.security.jwt.secret-base64=MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE="
        }
)
class PerfilApiIntegrationTests {
    private static final String PASSWORD = "profile-test-password";
    private static final String PROFILE_PATH = "/api/usuarios/me";

    @Value("${local.server.port}") private int port;
    @Value("${app.security.jwt.issuer}") private String issuer;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private MensagemRepository mensagemRepository;
    @Autowired private NoticiaRepository noticiaRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtEncoder jwtEncoder;

    private final HttpClient client = HttpClient.newHttpClient();
    private Usuario nutricionista;
    private Usuario caixa;
    private Usuario gestor;

    @BeforeEach
    void setUp() {
        noticiaRepository.deleteAll();
        mensagemRepository.deleteAll();
        usuarioRepository.deleteAll();
        nutricionista = createUser("nutri-profile@example.test", 'N');
        caixa = createUser("caixa-profile@example.test", 'C');
        gestor = createUser("gestor-profile@example.test", 'G');
    }

    @Test
    void profileEndpointsRequireAuthenticationAndReadOnlyTheCurrentAccount() throws Exception {
        assertEquals(401, request("GET", PROFILE_PATH, null, null).statusCode());
        assertEquals(401, updateProfile(null, caixa.getNome(), caixa.getEmailRecuperacao(), null).statusCode());
        assertEquals(401, changePassword(null, PASSWORD, "new-password", "new-password").statusCode());

        for (Usuario usuario : List.of(nutricionista, caixa, gestor)) {
            HttpResponse<String> response = request("GET", PROFILE_PATH, token(usuario), null);
            assertEquals(200, response.statusCode());
            JsonNode profile = json(response);
            assertTrue(profile.isObject());
            assertEquals(4, profile.size());
            assertEquals(usuario.getIdUsuario(), profile.path("idUsuario").asLong());
            assertEquals(usuario.getNome(), profile.path("nome").asText());
            assertEquals(usuario.getEmailRecuperacao(), profile.path("emailRecuperacao").asText());
            assertEquals(String.valueOf(usuario.getTipo()), profile.path("tipo").asText());
            assertNoCredentialFields(response);
        }
    }

    @Test
    void nameOnlyUpdatePersistsWithoutRevokingExistingTokens() throws Exception {
        String firstToken = token(caixa);
        String secondToken = token(caixa);

        HttpResponse<String> response = updateProfile(firstToken, "Caixa atualizado", caixa.getEmailRecuperacao(), null);
        assertEquals(200, response.statusCode());
        JsonNode result = json(response);
        assertFalse(result.path("requerNovoLogin").asBoolean());
        assertEquals(caixa.getIdUsuario(), result.path("usuario").path("idUsuario").asLong());
        assertEquals("Caixa atualizado", result.path("usuario").path("nome").asText());
        assertEquals("C", result.path("usuario").path("tipo").asText());
        assertEquals("Caixa atualizado", persisted(caixa).getNome());
        assertNoCredentialFields(response);

        assertEquals(200, request("GET", PROFILE_PATH, firstToken, null).statusCode());
        HttpResponse<String> readBack = request("GET", PROFILE_PATH, secondToken, null);
        assertEquals(200, readBack.statusCode());
        assertEquals("Caixa atualizado", json(readBack).path("nome").asText());
    }

    @Test
    void requestIdsAndAccessLevelsCannotTargetAnotherAccountOrEscalateRole() throws Exception {
        String bearer = token(caixa);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("nome", "Nome do proprio caixa");
        body.put("emailRecuperacao", caixa.getEmailRecuperacao());
        body.put("idUsuario", nutricionista.getIdUsuario());
        body.put("tipo", "G");

        HttpResponse<String> response = request("PUT", PROFILE_PATH, bearer, body);
        // Unknown identity/role fields may be ignored or rejected; they must never be authoritative.
        assertTrue(response.statusCode() == 200 || response.statusCode() == 400);
        assertEquals('C', persisted(caixa).getTipo());
        assertEquals(nutricionista.getNome(), persisted(nutricionista).getNome());
        assertEquals(nutricionista.getEmailRecuperacao(), persisted(nutricionista).getEmailRecuperacao());
        assertEquals(403, request("GET", "/api/semanas", bearer, null).statusCode());
        assertEquals(200, request("GET", PROFILE_PATH, bearer, null).statusCode());
    }

    @Test
    void emailChangesRejectMissingWrongPasswordConflictsAndInvalidFieldsWithoutChangingTheAccount() throws Exception {
        String bearer = token(caixa);
        String newEmail = "changed-profile@example.test";

        assertEquals(400, updateProfile(bearer, caixa.getNome(), newEmail, null).statusCode());
        assertError(updateProfile(bearer, caixa.getNome(), newEmail, "wrong-password"), 400, "CURRENT_PASSWORD_INVALID");
        assertError(updateProfile(bearer, caixa.getNome(), nutricionista.getEmailRecuperacao(), PASSWORD), 409, "EMAIL_IN_USE");
        assertError(updateProfile(bearer, " ", caixa.getEmailRecuperacao(), null), 400, "PROFILE_VALIDATION_ERROR");
        assertError(updateProfile(bearer, caixa.getNome(), "invalid-email", PASSWORD), 400, "PROFILE_VALIDATION_ERROR");

        assertEquals(caixa.getNome(), persisted(caixa).getNome());
        assertEquals(caixa.getEmailRecuperacao(), persisted(caixa).getEmailRecuperacao());
        assertEquals(200, request("GET", PROFILE_PATH, bearer, null).statusCode());
        assertEquals(200, login(caixa.getEmailRecuperacao(), PASSWORD).statusCode());
    }

    @Test
    void successfulEmailChangeRequiresLoginAndRevokesEveryPreviouslyIssuedToken() throws Exception {
        String firstToken = token(nutricionista);
        String secondToken = token(nutricionista);
        String originalEmail = nutricionista.getEmailRecuperacao();
        String newEmail = "updated-nutri-profile@example.test";

        HttpResponse<String> response = updateProfile(firstToken, nutricionista.getNome(), newEmail, PASSWORD);
        assertEquals(200, response.statusCode());
        assertTrue(json(response).path("requerNovoLogin").asBoolean());
        assertEquals(newEmail, json(response).path("usuario").path("emailRecuperacao").asText());
        assertNoCredentialFields(response);
        assertEquals(newEmail, persisted(nutricionista).getEmailRecuperacao());
        assertEquals(401, request("GET", PROFILE_PATH, firstToken, null).statusCode());
        assertEquals(401, request("GET", PROFILE_PATH, secondToken, null).statusCode());
        assertEquals(401, login(originalEmail, PASSWORD).statusCode());

        HttpResponse<String> freshLogin = login(newEmail, PASSWORD);
        assertEquals(200, freshLogin.statusCode());
        String freshToken = json(freshLogin).path("accessToken").asText();
        HttpResponse<String> freshProfile = request("GET", PROFILE_PATH, freshToken, null);
        assertEquals(200, freshProfile.statusCode());
        assertEquals(newEmail, json(freshProfile).path("emailRecuperacao").asText());
    }

    @Test
    void rejectedPasswordChangesPreserveCredentialsAndExistingTokens() throws Exception {
        String bearer = token(caixa);
        String originalHash = persisted(caixa).getCredencialAutenticacao().getPasswordHash();

        assertError(changePassword(bearer, "wrong-password", "new-password", "new-password"), 400, "CURRENT_PASSWORD_INVALID");
        for (Map<String, String> body : List.of(
                Map.of("senhaAtual", PASSWORD, "novaSenha", "12345", "confirmacaoSenha", "12345"),
                Map.of("senhaAtual", PASSWORD, "novaSenha", "new-password", "confirmacaoSenha", "different-password"),
                Map.of("senhaAtual", PASSWORD, "novaSenha", "new-password"),
                Map.of("senhaAtual", PASSWORD, "novaSenha", "a".repeat(73), "confirmacaoSenha", "a".repeat(73)),
                Map.of("senhaAtual", PASSWORD, "novaSenha", "á".repeat(37), "confirmacaoSenha", "á".repeat(37)),
                Map.of("senhaAtual", PASSWORD, "novaSenha", "😀".repeat(5), "confirmacaoSenha", "😀".repeat(5))
        )) {
            assertError(request("PUT", PROFILE_PATH + "/senha", bearer, body), 400, "PROFILE_VALIDATION_ERROR");
        }

        assertEquals(originalHash, persisted(caixa).getCredencialAutenticacao().getPasswordHash());
        assertEquals(200, request("GET", PROFILE_PATH, bearer, null).statusCode());
        assertEquals(200, login(caixa.getEmailRecuperacao(), PASSWORD).statusCode());
    }

    @Test
    void successfulPasswordChangeUsesBcryptAndRevokesEveryPreviouslyIssuedToken() throws Exception {
        String firstToken = token(caixa);
        String secondToken = token(caixa);
        String originalHash = persisted(caixa).getCredencialAutenticacao().getPasswordHash();
        String newPassword = "new-profile-password";

        HttpResponse<String> response = changePassword(firstToken, PASSWORD, newPassword, newPassword);
        assertEquals(204, response.statusCode());
        assertEquals("", response.body());
        String updatedHash = persisted(caixa).getCredencialAutenticacao().getPasswordHash();
        assertNotEquals(originalHash, updatedHash);
        assertTrue(updatedHash.startsWith("$2"));
        assertTrue(passwordEncoder.matches(newPassword, updatedHash));
        assertFalse(passwordEncoder.matches(PASSWORD, updatedHash));
        assertEquals(401, request("GET", PROFILE_PATH, firstToken, null).statusCode());
        assertEquals(401, request("GET", PROFILE_PATH, secondToken, null).statusCode());
        assertEquals(401, request("GET", "/api/mensagens", secondToken, null).statusCode());
        assertEquals(401, login(caixa.getEmailRecuperacao(), PASSWORD).statusCode());

        HttpResponse<String> freshLogin = login(caixa.getEmailRecuperacao(), newPassword);
        assertEquals(200, freshLogin.statusCode());
        assertEquals("Caixa", json(freshLogin).path("usuario").path("perfil").asText());
        assertEquals(200, request("GET", PROFILE_PATH, json(freshLogin).path("accessToken").asText(), null).statusCode());
    }

    @Test
    void passwordPolicyCountsUnicodeCharactersAndAcceptsExactlySeventyTwoUtf8Bytes() throws Exception {
        String sixCharacters = "😀".repeat(6);
        String seventyTwoBytes = "á".repeat(36);

        assertEquals(204, changePassword(token(gestor), PASSWORD, sixCharacters, sixCharacters).statusCode());
        HttpResponse<String> firstLogin = login(gestor.getEmailRecuperacao(), sixCharacters);
        assertEquals(200, firstLogin.statusCode());
        String bearer = json(firstLogin).path("accessToken").asText();
        assertEquals(204, changePassword(bearer, sixCharacters, seventyTwoBytes, seventyTwoBytes).statusCode());
        assertEquals(401, request("GET", PROFILE_PATH, bearer, null).statusCode());
        assertEquals(200, login(gestor.getEmailRecuperacao(), seventyTwoBytes).statusCode());
    }

    @Test
    void tokensWithoutTheCredentialVersionAreRejected() throws Exception {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(3600))
                .subject(caixa.getEmailRecuperacao())
                .claim("userId", caixa.getIdUsuario())
                .claim("roles", List.of("CAIXA"))
                .build();
        String legacyToken = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims
        )).getTokenValue();

        assertEquals(401, request("GET", PROFILE_PATH, legacyToken, null).statusCode());
    }

    private Usuario createUser(String email, char role) {
        Usuario usuario = new Usuario();
        usuario.setNome("Conta de teste " + role);
        usuario.setEmailRecuperacao(email);
        usuario.setTipo(role);
        CredencialAutenticacao credential = new CredencialAutenticacao();
        credential.setPasswordHash(passwordEncoder.encode(PASSWORD));
        credential.setDataCriacao(LocalDate.of(2026, 1, 1));
        credential.setUsuario(usuario);
        usuario.setCredencialAutenticacao(credential);
        return usuarioRepository.save(usuario);
    }

    private Usuario persisted(Usuario usuario) {
        return usuarioRepository.findById(usuario.getIdUsuario()).orElseThrow();
    }

    private HttpResponse<String> updateProfile(String token, String name, String email, String currentPassword) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("nome", name);
        body.put("emailRecuperacao", email);
        if (currentPassword != null) body.put("senhaAtual", currentPassword);
        return request("PUT", PROFILE_PATH, token, body);
    }

    private HttpResponse<String> changePassword(String token, String currentPassword, String newPassword, String confirmation) throws Exception {
        return request("PUT", PROFILE_PATH + "/senha", token,
                Map.of("senhaAtual", currentPassword, "novaSenha", newPassword, "confirmacaoSenha", confirmation));
    }

    private HttpResponse<String> login(String email, String password) throws Exception {
        return request("POST", "/api/auth/login", null, Map.of("email", email, "senha", password));
    }

    private String token(Usuario usuario) throws Exception {
        HttpResponse<String> response = login(usuario.getEmailRecuperacao(), PASSWORD);
        assertEquals(200, response.statusCode());
        return json(response).path("accessToken").asText();
    }

    private JsonNode json(HttpResponse<String> response) throws Exception {
        return objectMapper.readTree(response.body());
    }

    private void assertError(HttpResponse<String> response, int status, String code) throws Exception {
        assertEquals(status, response.statusCode());
        assertEquals(code, json(response).path("code").asText());
    }

    private void assertNoCredentialFields(HttpResponse<String> response) {
        for (String field : List.of("passwordHash", "passwordSalt", "senhaAtual", "novaSenha", "credencialAutenticacao", "versaoToken")) {
            assertFalse(response.body().contains("\"" + field + "\""));
        }
    }

    private HttpResponse<String> request(String method, String path, String bearerToken, Object body) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Accept", "application/json");
        if (bearerToken != null) request.header("Authorization", "Bearer " + bearerToken);
        if (body != null) request.header("Content-Type", "application/json");
        request.method(method, body == null
                ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)));
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
}
