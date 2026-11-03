package com.batutinhas.restaurante_pop;

import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Refeicao;
import com.batutinhas.restaurante_pop.model.Semana;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.RefeicaoRepository;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.datasource.url=jdbc:h2:mem:fichas_api_tests;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;LOCK_TIMEOUT=20000",
                "spring.datasource.driver-class-name=org.h2.Driver",
                "spring.datasource.username=sa",
                "spring.datasource.password=",
                "spring.jpa.hibernate.ddl-auto=create-drop",
                "spring.jpa.show-sql=false",
                "spring.jpa.open-in-view=true",
                "spring.profiles.active=default",
                "app.security.jwt.issuer=fichas-api-tests",
                "app.security.jwt.secret-base64=MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE="
        }
)
@Import(FichasApiIntegrationTests.ClockConfiguration.class)
class FichasApiIntegrationTests {
    private static final String TODAY_PATH = "/api/fichas/hoje";
    private static final String INCREMENT_PATH = TODAY_PATH + "/incrementos";
    private static final String PASSWORD = "fichas-test-password";
    private static final LocalDate MONDAY = LocalDate.of(2026, 11, 2);

    @Value("${local.server.port}") private int port;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SemanaRepository semanaRepository;
    @Autowired private RefeicaoRepository refeicaoRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private TransactionTemplate transactions;
    @Autowired private MutableClock fichaTestClock;

    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private Usuario nutricionista;
    private Usuario caixa;
    private Usuario gestor;

    @BeforeEach
    void setUp() {
        semanaRepository.deleteAll();
        refeicaoRepository.deleteAll();
        usuarioRepository.deleteAll();
        fichaTestClock.set(Instant.parse("2026-11-03T15:00:00Z"));
        nutricionista = createUser("nutri-fichas@example.test", 'N');
        caixa = createUser("caixa-fichas@example.test", 'C');
        gestor = createUser("gestor-fichas@example.test", 'G');
    }

    @Test
    void anonymousReadExposesOnlyTodaysCounterAndDoesNotCreateAWeek() throws Exception {
        HttpResponse<String> response = request("GET", TODAY_PATH + "?data=2099-01-05", null, null);
        assertCounter(response, "2026-11-03", 0, true);
        assertEquals(0, semanaRepository.count());

        seedWeek(List.of(12, 34, 56, 78, 90), List.of(1.0, 2.0), null);
        response = request("GET", TODAY_PATH, null, null);
        assertCounter(response, "2026-11-03", 34, true);
        assertEquals(1, semanaRepository.count());
        for (String hidden : List.of("desperdicio", "cardapio", "fichasVendidas", "idSemana", "usuario", "token")) {
            assertFalse(json(response).has(hidden));
        }
    }

    @Test
    void onlyCaixaMayIncrementAndProtectedWeeklyResourcesKeepTheirPermissions() throws Exception {
        assertEquals(401, increment(null).statusCode());
        assertEquals(401, increment("malformed-token").statusCode());
        assertEquals(403, increment(token(nutricionista)).statusCode());
        assertEquals(403, increment(token(gestor)).statusCode());
        assertEquals(0, semanaRepository.count());

        String caixaToken = token(caixa);
        assertCounter(increment(caixaToken), "2026-11-03", 1, true);
        assertEquals(403, request("GET", "/api/semanas", caixaToken, null).statusCode());
        assertEquals(401, request("GET", "/api/semanas", null, null).statusCode());
        assertEquals(200, request("GET", "/api/semanas", token(nutricionista), null).statusCode());
        assertCounter(request("GET", TODAY_PATH, null, null), "2026-11-03", 1, true);
    }

    @Test
    void firstRegistrationNeedsNoMenuAndClientCannotChooseTheDayOrQuantity() throws Exception {
        HttpResponse<String> response = request("POST", INCREMENT_PATH + "?data=2099-01-05", token(caixa),
                Map.of("data", "2099-01-05", "quantidade", 300, "entregues", 300));
        assertCounter(response, "2026-11-03", 1, true);
        assertEquals(1, semanaRepository.count());
        assertEquals(0, refeicaoRepository.count());
        assertTrue(semanaRepository.findByData(LocalDate.of(2099, 1, 5)).isEmpty());
        WeekSnapshot week = snapshot(MONDAY);
        assertEquals(1, countAt(week, 1));
        for (int index : List.of(0, 2, 3, 4)) assertEquals(0, countAt(week, index));
        assertEquals(Collections.nCopies(5, null), week.mealIds());
    }

    @Test
    void incrementPreservesOtherDaysWasteAndExistingMeals() throws Exception {
        Refeicao meal = new Refeicao();
        meal.setProteina("Refeicao ficticia para fichas");
        meal.setCalorias(600);
        refeicaoRepository.saveAndFlush(meal);
        List<Integer> tickets = List.of(9, 41, 7, 3, 5);
        List<Double> waste = Arrays.asList(1.2, 2.4, null, 4.1, 5.0);
        seedWeek(tickets, waste, meal);
        WeekSnapshot before = snapshot(MONDAY);

        assertCounter(increment(token(caixa)), "2026-11-03", 42, true);
        WeekSnapshot after = snapshot(MONDAY);
        assertEquals(List.of(9, 42, 7, 3, 5), after.tickets());
        assertEquals(before.waste(), after.waste());
        assertEquals(before.mealIds(), after.mealIds());
        assertEquals(1, refeicaoRepository.count());
    }

    @Test
    void menuCreationCannotSeedFichasAndStaleMenuUpdatesCannotEraseThem() throws Exception {
        String nutritionToken = token(nutricionista);
        Map<String, Object> newMenu = Map.of(
                "data", "2026-11-09", "fichasVendidas", List.of(300, 300, 300, 300, 300),
                "desperdicio", List.of(), "cardapio", Collections.nCopies(5, null));
        assertEquals(200, request("POST", "/api/semanas", nutritionToken, newMenu).statusCode());
        assertTrue(snapshot(LocalDate.of(2026, 11, 9)).tickets().stream().allMatch(value -> value == null || value == 0));

        String cashierToken = token(caixa);
        assertCounter(increment(cashierToken), "2026-11-03", 1, true);
        Map<String, Object> staleMenu = Map.of(
                "fichasVendidas", List.of(), "desperdicio", List.of(2.0),
                "cardapio", Collections.nCopies(5, null));
        HttpResponse<String> updated = request("PUT", "/api/semanas/2026-11-02", nutritionToken, staleMenu);
        assertEquals(200, updated.statusCode());
        assertEquals(1, countAt(snapshot(MONDAY), 1));
        assertEquals(List.of(2.0), snapshot(MONDAY).waste());

        Map<String, Object> forgedMenu = Map.of(
                "fichasVendidas", List.of(300, 300, 300, 300, 300),
                "desperdicio", List.of(2.0), "cardapio", Collections.nCopies(5, null));
        assertEquals(200, request("PUT", "/api/semanas/2026-11-02", token(gestor), forgedMenu).statusCode());
        assertCounter(request("GET", TODAY_PATH, null, null), "2026-11-03", 1, true);
    }

    @Test
    void weekendsAreClosedWithoutChangingWeekdayHistory() throws Exception {
        seedWeek(List.of(0, 0, 0, 0, 23), List.of(), null);
        WeekSnapshot before = snapshot(MONDAY);
        String cashierToken = token(caixa);
        for (String instant : List.of("2026-11-07T15:00:00Z", "2026-11-08T15:00:00Z")) {
            fichaTestClock.set(Instant.parse(instant));
            String localDate = instant.substring(0, 10);
            assertCounter(request("GET", TODAY_PATH, null, null), localDate, 0, false);
            assertError(increment(cashierToken), 409, "FICHAS_CLOSED_DAY");
            assertEquals(1, semanaRepository.count());
            assertEquals(before, snapshot(MONDAY));
        }
    }

    @Test
    void theThreeHundredthFichaSucceedsAndFurtherRegistrationIsBlocked() throws Exception {
        seedWeek(List.of(12, 299, 8, 6, 4), List.of(1.5), null);
        String cashierToken = token(caixa);
        assertCounter(increment(cashierToken), "2026-11-03", 300, false);
        assertError(increment(cashierToken), 409, "FICHAS_LIMIT_REACHED");
        assertCounter(request("GET", TODAY_PATH, null, null), "2026-11-03", 300, false);
        assertEquals(List.of(12, 300, 8, 6, 4), snapshot(MONDAY).tickets());
        assertEquals(List.of(1.5), snapshot(MONDAY).waste());
    }

    @Test
    void simultaneousFirstRegistrationsCreateOneWeekAndRetainEveryIncrement() throws Exception {
        List<HttpResponse<String>> responses = simultaneousIncrements(token(caixa), 6);
        List<Integer> delivered = new ArrayList<>();
        for (HttpResponse<String> response : responses) {
            assertEquals(200, response.statusCode(), response.body());
            delivered.add(json(response).path("entregues").asInt());
        }
        Collections.sort(delivered);
        assertEquals(List.of(1, 2, 3, 4, 5, 6), delivered);
        assertEquals(1, semanaRepository.count());
        assertCounter(request("GET", TODAY_PATH, null, null), "2026-11-03", 6, true);
        assertEquals(6, countAt(snapshot(MONDAY), 1));
    }

    @Test
    void simultaneousRegistrationsNearCapacityNeverExceedTheDailyLimit() throws Exception {
        seedWeek(List.of(10, 298, 20, 30, 40), List.of(3.0), null);
        List<HttpResponse<String>> responses = simultaneousIncrements(token(caixa), 8);
        int successful = 0;
        for (HttpResponse<String> response : responses) {
            if (response.statusCode() == 200) successful++;
            else assertError(response, 409, "FICHAS_LIMIT_REACHED");
        }
        assertEquals(2, successful);
        assertCounter(request("GET", TODAY_PATH, null, null), "2026-11-03", 300, false);
        assertEquals(List.of(10, 300, 20, 30, 40), snapshot(MONDAY).tickets());
        assertEquals(List.of(3.0), snapshot(MONDAY).waste());
    }

    @Test
    void fortalezaMidnightStartsANewDayAndNewWeekWithoutErasingHistory() throws Exception {
        String cashierToken = token(caixa);
        fichaTestClock.set(Instant.parse("2026-11-03T23:59:00Z"));
        assertCounter(increment(cashierToken), "2026-11-03", 1, true);
        fichaTestClock.set(Instant.parse("2026-11-04T00:01:00Z"));
        assertCounter(request("GET", TODAY_PATH, null, null), "2026-11-03", 1, true);
        fichaTestClock.set(Instant.parse("2026-11-04T02:59:59Z"));
        assertCounter(increment(cashierToken), "2026-11-03", 2, true);
        fichaTestClock.set(Instant.parse("2026-11-04T03:00:00Z"));
        assertCounter(request("GET", TODAY_PATH, null, null), "2026-11-04", 0, true);
        assertEquals(2, countAt(snapshot(MONDAY), 1));
        assertCounter(increment(cashierToken), "2026-11-04", 1, true);
        assertEquals(2, countAt(snapshot(MONDAY), 1));
        assertEquals(1, countAt(snapshot(MONDAY), 2));

        WeekSnapshot previousWeek = snapshot(MONDAY);
        fichaTestClock.set(Instant.parse("2026-11-09T03:00:00Z"));
        assertCounter(request("GET", TODAY_PATH, null, null), "2026-11-09", 0, true);
        assertEquals(1, semanaRepository.count());
        assertCounter(increment(cashierToken), "2026-11-09", 1, true);
        assertEquals(2, semanaRepository.count());
        assertEquals(previousWeek, snapshot(MONDAY));
    }

    private Usuario createUser(String email, char role) {
        Usuario usuario = new Usuario();
        usuario.setNome("Conta ficticia de fichas " + role);
        usuario.setEmailRecuperacao(email);
        usuario.setTipo(role);
        CredencialAutenticacao credential = new CredencialAutenticacao();
        credential.setPasswordHash(passwordEncoder.encode(PASSWORD));
        credential.setDataCriacao(LocalDate.of(2026, 11, 3));
        credential.setUsuario(usuario);
        usuario.setCredencialAutenticacao(credential);
        return usuarioRepository.saveAndFlush(usuario);
    }

    private void seedWeek(List<Integer> tickets, List<Double> waste, Refeicao meal) {
        transactions.executeWithoutResult(status -> {
            Semana week = new Semana();
            week.setData(MONDAY);
            week.setFichasVendidas(new ArrayList<>(tickets));
            week.setDesperdicio(new ArrayList<>(waste));
            List<Refeicao> meals = new ArrayList<>(Collections.nCopies(5, null));
            if (meal != null) {
                meals.set(0, refeicaoRepository.findById(meal.getIdRefeicao()).orElseThrow());
            }
            week.setCardapio(meals);
            semanaRepository.saveAndFlush(week);
        });
    }

    private WeekSnapshot snapshot(LocalDate monday) {
        return Objects.requireNonNull(transactions.execute(status -> {
            Semana week = semanaRepository.findByData(monday).orElseThrow();
            return new WeekSnapshot(new ArrayList<>(week.getFichasVendidas()),
                    new ArrayList<>(week.getDesperdicio()),
                    week.getCardapio().stream().map(meal -> meal == null ? null : meal.getIdRefeicao()).toList());
        }));
    }

    private int countAt(WeekSnapshot week, int index) {
        return index >= week.tickets().size() || week.tickets().get(index) == null ? 0 : week.tickets().get(index);
    }

    private List<HttpResponse<String>> simultaneousIncrements(String bearer, int count) throws Exception {
        CountDownLatch ready = new CountDownLatch(count);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(count);
        try {
            List<Future<HttpResponse<String>>> pending = new ArrayList<>();
            for (int index = 0; index < count; index++) {
                pending.add(executor.submit(() -> {
                    ready.countDown();
                    if (!start.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("Concurrent start timed out");
                    return increment(bearer);
                }));
            }
            assertTrue(ready.await(10, TimeUnit.SECONDS));
            start.countDown();
            List<HttpResponse<String>> responses = new ArrayList<>();
            for (Future<HttpResponse<String>> response : pending) responses.add(response.get(30, TimeUnit.SECONDS));
            return responses;
        } finally {
            start.countDown();
            executor.shutdownNow();
            assertTrue(executor.awaitTermination(10, TimeUnit.SECONDS));
        }
    }

    private String token(Usuario user) throws Exception {
        HttpResponse<String> response = request("POST", "/api/auth/login", null,
                Map.of("email", user.getEmailRecuperacao(), "senha", PASSWORD));
        assertEquals(200, response.statusCode());
        return json(response).path("accessToken").asText();
    }

    private HttpResponse<String> increment(String bearer) throws Exception {
        return request("POST", INCREMENT_PATH, bearer, null);
    }

    private HttpResponse<String> request(String method, String path, String bearer, Object body) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .timeout(Duration.ofSeconds(30))
                .header("Accept", "application/json");
        if (bearer != null) request.header("Authorization", "Bearer " + bearer);
        if (body != null) request.header("Content-Type", "application/json");
        request.method(method, body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)));
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private JsonNode json(HttpResponse<String> response) throws Exception {
        return objectMapper.readTree(response.body());
    }

    private void assertCounter(HttpResponse<String> response, String date, int delivered, boolean mayAdd) throws Exception {
        assertEquals(200, response.statusCode(), response.body());
        JsonNode body = json(response);
        assertTrue(body.isObject());
        assertEquals(5, body.size());
        assertEquals(date, body.path("data").asText());
        assertEquals(delivered, body.path("entregues").asInt());
        assertEquals(300, body.path("capacidade").asInt());
        assertEquals(300 - delivered, body.path("restantes").asInt());
        assertEquals(mayAdd, body.path("permiteAdicionar").asBoolean());
    }

    private void assertError(HttpResponse<String> response, int status, String code) throws Exception {
        assertEquals(status, response.statusCode(), response.body());
        assertEquals(code, json(response).path("code").asText());
    }

    private record WeekSnapshot(List<Integer> tickets, List<Double> waste, List<Long> mealIds) {}

    @TestConfiguration(proxyBeanMethods = false)
    static class ClockConfiguration {
        @Bean
        @Primary
        @Qualifier("fichasClock")
        MutableClock fichaTestClock() {
            return new MutableClock(new AtomicReference<>(Instant.parse("2026-11-03T15:00:00Z")), ZoneOffset.UTC);
        }
    }

    static final class MutableClock extends Clock {
        private final AtomicReference<Instant> current;
        private final ZoneId zone;

        private MutableClock(AtomicReference<Instant> current, ZoneId zone) {
            this.current = current;
            this.zone = zone;
        }

        void set(Instant instant) { current.set(instant); }
        @Override public ZoneId getZone() { return zone; }
        @Override public Clock withZone(ZoneId zone) { return new MutableClock(current, zone); }
        @Override public Instant instant() { return current.get(); }
    }
}
