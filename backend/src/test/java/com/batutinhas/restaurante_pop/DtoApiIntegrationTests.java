package com.batutinhas.restaurante_pop;

import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.EstoqueRepository;
import com.batutinhas.restaurante_pop.repository.MensagemRepository;
import com.batutinhas.restaurante_pop.repository.NoticiaRepository;
import com.batutinhas.restaurante_pop.repository.RefeicaoRepository;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class DtoApiIntegrationTests {
        private static final String PASSWORD = "password";

    @Value("${local.server.port}") private int port;
    private final HttpClient client = HttpClient.newHttpClient();
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SemanaRepository semanaRepository;
    @Autowired private RefeicaoRepository refeicaoRepository;
    @Autowired private MensagemRepository mensagemRepository;
    @Autowired private NoticiaRepository noticiaRepository;
    @Autowired private EstoqueRepository estoqueRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    private Usuario nutricionista;
    private Usuario caixa;

    @BeforeEach
    void setUp() {
        noticiaRepository.deleteAll();
        mensagemRepository.deleteAll();
        semanaRepository.deleteAll();
        refeicaoRepository.deleteAll();
        estoqueRepository.deleteAll();
        usuarioRepository.deleteAll();
        nutricionista = createUser("nutri@example.test", 'N');
        caixa = createUser("caixa@example.test", 'C');
    }

    @Test
    void userEndpointsReturnOnlyTheUserDtoFields() throws Exception {
        HttpResponse<String> list = request("GET", "/api/usuarios", nutricionista, null);
        assertEquals(200, list.statusCode());
        assertTrue(list.body().contains("\"emailRecuperacao\":\"nutri@example.test\""));
        assertTrue(list.body().contains("\"idUsuario\":"));
        assertFalse(list.body().contains("credencialAutenticacao"));

        HttpResponse<String> created = request("POST", "/api/usuarios", nutricionista,
                "{\"nome\":\"Novo usuario\",\"emailRecuperacao\":\"novo@example.test\",\"tipo\":\"C\",\"senhaPura\":\"senha\"}");
        assertEquals(200, created.statusCode());
        assertTrue(created.body().contains("\"emailRecuperacao\":\"novo@example.test\""));
        assertFalse(created.body().contains("senhaPura"));
        assertFalse(created.body().contains("passwordHash"));
    }

    @Test
    void firstMenuCanBeCreatedWithFiveDaySlotsAndReadBack() throws Exception {
        String body = """
                {"data":"2026-11-02","desperdicio":[],"fichasVendidas":[],
                 "cardapio":[null,{"proteina":"Frango","guarnicao":"Farofa",
                  "acompanhamento1":"Arroz","acompanhamento2":"Feijao","suco":"Caju",
                  "sobremesa":"Fruta","opcaoProteica":"Ovo","saladaDoDia":"Salada",
                  "calorias":1000},null,null,null]}
                """;

        HttpResponse<String> created = request("POST", "/api/semanas", nutricionista, body);
        assertEquals(200, created.statusCode(), created.body());
        assertTrue(created.body().contains("\"cardapio\":[null,{"));
        assertEquals(1, semanaRepository.count());
        assertEquals(1, refeicaoRepository.count());
        assertEquals(1000.0, refeicaoRepository.findAll().getFirst().getCalorias());

        HttpResponse<String> listed = request("GET", "/api/semanas", nutricionista, null);
        assertEquals(200, listed.statusCode());
        assertTrue(listed.body().contains("\"data\":\"2026-11-02\""));
        assertTrue(listed.body().contains("\"proteina\":\"Frango\""));

        HttpResponse<String> duplicate = request("POST", "/api/semanas", nutricionista, body);
        assertEquals(400, duplicate.statusCode(), duplicate.body());
        assertEquals(1, semanaRepository.count());
        assertEquals(1, refeicaoRepository.count());
    }

    @Test
    void mealCanBeSharedByWeeksWithoutAWeekIdInMealDtos() throws Exception {
        HttpResponse<String> meal = request("POST", "/api/refeicoes", nutricionista,
                "{\"proteina\":\"Peixe\",\"guarnicao\":\"Arroz\",\"acompanhamento1\":\"Feijao\",\"acompanhamento2\":\"Salada\",\"suco\":\"Caju\",\"sobremesa\":\"Fruta\",\"opcaoProteica\":\"Ovo\",\"calorias\":450}");
        assertEquals(200, meal.statusCode());
        assertFalse(meal.body().contains("semanaId"));
        long mealId = longField(meal.body(), "idRefeicao");
        HttpResponse<String> mealList = request("GET", "/api/refeicoes", nutricionista, null);
        assertEquals(200, mealList.statusCode());
        assertTrue(mealList.body().contains("\"proteina\":\"Peixe\""));

        HttpResponse<String> weekOne = request("POST", "/api/semanas", nutricionista,
                weekJson("2026-10-12", mealId));
        assertEquals(200, weekOne.statusCode());
        assertTrue(weekOne.body().contains("\"idRefeicao\":" + mealId));

        HttpResponse<String> weekTwo = request("POST", "/api/semanas", nutricionista,
                weekJson("2026-10-19", mealId));
        assertEquals(200, weekTwo.statusCode());
        assertTrue(weekTwo.body().contains("\"idRefeicao\":" + mealId));

        HttpResponse<String> inlineWeek = request("POST", "/api/semanas", nutricionista,
                "{\"data\":\"2026-10-26\",\"cardapio\":[{\"proteina\":\"Carne\",\"calorias\":500},null,null,null,null]}");
        assertEquals(200, inlineWeek.statusCode());
        assertTrue(inlineWeek.body().contains("\"proteina\":\"Carne\""));
        HttpResponse<String> weekList = request("GET", "/api/semanas", nutricionista, null);
        assertEquals(200, weekList.statusCode());
        assertTrue(weekList.body().contains("2026-10-26"));

        HttpResponse<String> update = request("PUT", "/api/semanas/2026-10-12", nutricionista,
                "{\"desperdicio\":[2.0],\"fichasVendidas\":[20],\"cardapio\":[{\"idRefeicao\":" + mealId + "},null,null,null,null]}");
        assertEquals(200, update.statusCode());
        assertTrue(update.body().contains("\"desperdicio\":[2.0]"));

        HttpResponse<String> absentWeek = request("PUT", "/api/semanas/2099-01-05", nutricionista, "{}");
        assertEquals(404, absentWeek.statusCode());

        HttpResponse<String> standaloneMeal = request("POST", "/api/refeicoes", nutricionista,
                "{\"proteina\":\"Legumes\",\"calorias\":300}");
        assertEquals(200, standaloneMeal.statusCode());
        assertEquals(3, refeicaoRepository.count());
    }

    @Test
    void newsEndpointIsPublicForReadsAndUsesAuthenticatedAuthorForCreates() throws Exception {
        HttpResponse<String> initialNews = request("GET", "/api/noticias", null, null);
        assertEquals(200, initialNews.statusCode());
        assertTrue(initialNews.body().startsWith("["));

        HttpResponse<String> created = request("POST", "/api/noticias", nutricionista,
                "{\"assunto\":\"Aviso\",\"texto\":\"Texto do aviso\",\"data\":\"2026-10-12\",\"horario\":\"08:30:00\",\"duracao\":24}");
        assertEquals(200, created.statusCode());
        assertTrue(created.body().contains("\"duracao\":24"));
        assertFalse(created.body().contains("\"usuario\""));
        assertFalse(created.body().contains("passwordHash"));

        HttpResponse<String> invalid = request("POST", "/api/noticias", nutricionista,
                "{\"assunto\":\"Aviso\",\"texto\":\"Texto do aviso\",\"duracao\":73}");
        assertEquals(400, invalid.statusCode());
        assertTrue(invalid.body().contains("BAD_REQUEST"));
        assertFalse(invalid.body().contains("stackTrace"));
        assertEquals(1, noticiaRepository.count());

        HttpResponse<String> list = request("GET", "/api/noticias", null, null);
        assertEquals(200, list.statusCode());
        assertTrue(list.body().contains("\"duracao\":24"));
    }

    @Test
    @DisplayName("ID de notícia retorna 404 nas rotas de mensagem e preserva a notícia persistida")
    void newsCannotBeModifiedThroughMessageRoutes() throws Exception {
        var created = request("POST", "/api/noticias", nutricionista,
                "{\"assunto\":\"Aviso\",\"texto\":\"Texto original\",\"data\":\"2026-11-02\",\"horario\":\"08:30:00\",\"duracao\":24}");
        assertEquals(200, created.statusCode(), created.body());
        long id = longField(created.body(), "idMensagem");

        assertEquals(404, request("GET", "/api/mensagens/" + id, caixa, null).statusCode());
        assertEquals(404, request("PUT", "/api/mensagens/" + id, caixa,
                "{\"texto\":\"Alteracao indevida\"}").statusCode());
        assertEquals(404, request("DELETE", "/api/mensagens/" + id, caixa, null).statusCode());

        var persisted = noticiaRepository.findById(id).orElseThrow();
        assertEquals("Texto original", persisted.getTexto());
        assertEquals("Aviso", persisted.getAssunto());
        assertEquals("2026-11-02", persisted.getData().toString());
        assertEquals("08:30", persisted.getHorario().toString());
        assertEquals(24, persisted.getDuracao());
        assertEquals(1, noticiaRepository.count());
    }

    @Test
    @DisplayName("Criação rejeita ingredientes duplicados com calorias diferentes sem persistir parcialmente")
    void duplicateMealIngredientsRejectWeekCreationWithoutSaving() throws Exception {
        String body = """
                {"data":"2026-11-02","cardapio":[
                 {"proteina":"Lentilha","calorias":450},
                 {"proteina":"Lentilha","calorias":700},null,null,null]}
                """;

        var response = request("POST", "/api/semanas", nutricionista, body);

        assertEquals(400, response.statusCode(), response.body());
        assertTrue(response.body().contains("BAD_REQUEST"));
        assertEquals(0, semanaRepository.count());
        assertEquals(0, refeicaoRepository.count());
    }

    @Test
    @DisplayName("Atualização com ingredientes duplicados faz rollback e preserva o cardápio anterior")
    void duplicateMealIngredientsPreserveExistingWeek() throws Exception {
        var created = request("POST", "/api/semanas", nutricionista, """
                {"data":"2026-11-02","desperdicio":[1.5],
                 "cardapio":[{"proteina":"Frango","calorias":450},null,null,null,null]}
                """);
        assertEquals(200, created.statusCode(), created.body());

        var rejected = request("PUT", "/api/semanas/2026-11-02", nutricionista, """
                {"desperdicio":[9.0],"cardapio":[
                 {"proteina":"Lentilha","calorias":450},
                 {"proteina":"Lentilha","calorias":700},null,null,null]}
                """);

        assertEquals(400, rejected.statusCode(), rejected.body());
        var listed = request("GET", "/api/semanas", nutricionista, null);
        assertEquals(200, listed.statusCode(), listed.body());
        assertTrue(listed.body().contains("\"proteina\":\"Frango\""));
        assertTrue(listed.body().contains("\"desperdicio\":[1.5]"));
        assertFalse(listed.body().contains("Lentilha"));
        assertEquals(1, semanaRepository.count());
        assertEquals(1, refeicaoRepository.count());
    }

    @Test
    void messageAndStockEndpointsUseDtosAndPreserveNotFoundAndNoContentStatuses() throws Exception {
        assertEquals(404, request("POST", "/api/mensagens/usuario/999999", caixa,
                "{\"texto\":\"Nao deve ser salvo\"}").statusCode());
        assertEquals(0, mensagemRepository.count());

        HttpResponse<String> createdMessage = request("POST",
                "/api/mensagens/usuario/" + nutricionista.getIdUsuario(), caixa,
                "{\"assunto\":\"Duvida\",\"texto\":\"Mensagem de teste\",\"horario\":\"09:15:00\",\"data\":\"2026-10-12\"}");
        assertEquals(200, createdMessage.statusCode());
        assertTrue(createdMessage.body().contains("\"usuarioId\":" + nutricionista.getIdUsuario()));
        assertFalse(createdMessage.body().contains("\"usuario\""));
        long messageId = longField(createdMessage.body(), "idMensagem");

        HttpResponse<String> messages = request("GET", "/api/mensagens", caixa, null);
        assertEquals(200, messages.statusCode());
        assertTrue(messages.body().contains("\"idMensagem\":" + messageId));

        HttpResponse<String> message = request("GET", "/api/mensagens/" + messageId, caixa, null);
        assertEquals(200, message.statusCode());
        assertTrue(message.body().contains("\"assunto\":\"Duvida\""));

        HttpResponse<String> update = request("PUT", "/api/mensagens/" + messageId, caixa,
                "{\"texto\":\"Mensagem atualizada\",\"horario\":\"10:00:00\",\"data\":\"2026-10-13\"}");
        assertEquals(200, update.statusCode());
        assertTrue(update.body().contains("\"assunto\":\"Duvida\""));
        assertTrue(update.body().contains("\"texto\":\"Mensagem atualizada\""));
        assertEquals(404, request("GET", "/api/mensagens/999999", caixa, null).statusCode());

        HttpResponse<String> deleted = request("DELETE", "/api/mensagens/" + messageId, caixa, null);
        assertEquals(204, deleted.statusCode());
        assertTrue(deleted.body() == null || deleted.body().isEmpty());
        assertEquals(404, request("DELETE", "/api/mensagens/" + messageId, caixa, null).statusCode());

        HttpResponse<String> malformedStock = request("POST", "/api/estoque", nutricionista, "{malformed");
        assertEquals(400, malformedStock.statusCode());
        assertFalse(malformedStock.body().contains("stackTrace"));
        assertEquals(0, estoqueRepository.count());

        HttpResponse<String> stock = request("POST", "/api/estoque", nutricionista,
                "{\"nome\":\"Arroz\",\"quantidade\":12.5,\"unidade\":\"kg\",\"lote\":\"L-42\",\"dataDeRecebimento\":\"2026-10-01\",\"dataDeValidade\":\"2027-01-01\",\"observacoes\":\"Lote de teste\"}");
        assertEquals(200, stock.statusCode());
        assertTrue(stock.body().contains("\"idMaterial\":"));
        assertTrue(stock.body().contains("\"quantidade\":12.5"));

        HttpResponse<String> stockList = request("GET", "/api/estoque", nutricionista, null);
        assertEquals(200, stockList.statusCode());
        assertTrue(stockList.body().contains("\"nome\":\"Arroz\""));
    }

    @Test
    void securityRulesRemainInForce() throws Exception {
        assertEquals(401, request("GET", "/api/semanas", null, null).statusCode());
        assertEquals(403, request("GET", "/api/semanas", caixa, null).statusCode());
        assertEquals(200, request("GET", "/api/mensagens", caixa, null).statusCode());
    }

    private Usuario createUser(String email, char role) {
        Usuario usuario = new Usuario();
        usuario.setNome("Usuário de teste");
        usuario.setEmailRecuperacao(email);
        usuario.setTipo(role);
        CredencialAutenticacao credential = new CredencialAutenticacao();
        credential.setPasswordHash(passwordEncoder.encode(PASSWORD));
        credential.setUsuario(usuario);
        usuario.setCredencialAutenticacao(credential);
        return usuarioRepository.save(usuario);
    }

    private HttpResponse<String> request(String method, String path, Usuario user, String jsonBody) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Accept", "application/json");
        if (user != null) {
            builder.header("Authorization", "Bearer " + tokenFor(user));
        }
        if (jsonBody != null) {
            builder.header("Content-Type", "application/json");
        }
        builder.method(method, jsonBody == null
                ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(jsonBody));
        return client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private String weekJson(String date, long mealId) {
        return "{\"data\":\"" + date + "\",\"desperdicio\":[1.5],\"fichasVendidas\":[10],\"cardapio\":[{\"idRefeicao\":" + mealId + "},null,null,null,null]}";
    }

    private String tokenFor(Usuario user) throws Exception {
        String body = "{\"email\":\"" + user.getEmailRecuperacao() + "\",\"senha\":\"" + PASSWORD + "\"}";
        HttpRequest login = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/api/auth/login"))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> response = client.send(login, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, response.statusCode(), response.body());
        Matcher matcher = Pattern.compile("\\\"accessToken\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"").matcher(response.body());
        assertTrue(matcher.find(), "Login response should include an access token");
        return matcher.group(1);
    }

    private long longField(String json, String field) {
        assertNotNull(json);
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*(\\d+)");
        Matcher matcher = pattern.matcher(json);
        assertTrue(matcher.find(), "Expected numeric JSON field: " + field);
        return Long.parseLong(matcher.group(1));
    }
}
