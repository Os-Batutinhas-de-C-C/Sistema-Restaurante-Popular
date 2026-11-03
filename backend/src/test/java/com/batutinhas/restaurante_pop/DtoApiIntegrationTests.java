package com.batutinhas.restaurante_pop;

import com.batutinhas.restaurante_pop.factory.UsuarioFactory;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.EstoqueRepository;
import com.batutinhas.restaurante_pop.repository.MensagemRepository;
import com.batutinhas.restaurante_pop.repository.NoticiaRepository;
import com.batutinhas.restaurante_pop.repository.RefeicaoRepository;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Value;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
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
                "{\"data\":\"2026-10-26\",\"cardapio\":[{\"proteina\":\"Carne\",\"calorias\":500}]}");
        assertEquals(200, inlineWeek.statusCode());
        assertTrue(inlineWeek.body().contains("\"proteina\":\"Carne\""));
        HttpResponse<String> weekList = request("GET", "/api/semanas", nutricionista, null);
        assertEquals(200, weekList.statusCode());
        assertTrue(weekList.body().contains("2026-10-26"));

        HttpResponse<String> update = request("PUT", "/api/semanas/2026-10-12", nutricionista,
                "{\"desperdicio\":[2.0],\"fichasVendidas\":[20],\"cardapio\":[{\"idRefeicao\":" + mealId + "}]}");
        assertEquals(200, update.statusCode());
        assertTrue(update.body().contains("\"desperdicio\":[2.0]"));

        HttpResponse<String> absentWeek = request("PUT", "/api/semanas/2099-01-01", nutricionista, "{}");
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
                return usuarioRepository.save(UsuarioFactory.criarUsuarioEntidadeValido(email, role));
    }

    private HttpResponse<String> request(String method, String path, Usuario user, String jsonBody) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Accept", "application/json");
        if (user != null) {
            String raw = user.getEmailRecuperacao() + ":" + PASSWORD;
            String credentials = Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
            builder.header("Authorization", "Basic " + credentials);
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
        return "{\"data\":\"" + date + "\",\"desperdicio\":[1.5],\"fichasVendidas\":[10],\"cardapio\":[{\"idRefeicao\":" + mealId + "}]}";
    }

    private long longField(String json, String field) {
        assertNotNull(json);
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*(\\d+)");
        Matcher matcher = pattern.matcher(json);
        assertTrue(matcher.find(), "Expected numeric JSON field: " + field);
        return Long.parseLong(matcher.group(1));
    }
}
