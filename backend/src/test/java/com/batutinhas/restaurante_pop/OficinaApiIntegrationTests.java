package com.batutinhas.restaurante_pop;

import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.EventoOficinaRepository;
import com.batutinhas.restaurante_pop.repository.InscricaoOficinaRepository;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:oficinas_api_tests;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "spring.profiles.active=default",
        "app.security.jwt.issuer=oficinas-api-tests",
        "app.security.jwt.secret-base64=MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=",
        "debug=false"
})
@Import(FichasApiIntegrationTests.ClockConfiguration.class)
class OficinaApiIntegrationTests {
    private static final String BASE = "/api/oficinas-ou-cursos";
    private static final String PUBLICAS = "/publicas";
    private static final String DATA = "2026-11-07";
    private static final String NASCIMENTO = "2000-11-01";
    private static final String EMAIL = "inscricoes@example.test";
    private static final String SENHA = "oficinas-test-password";
    private static final String CPF_A = cpf("902816473");
    private static final String CPF_B = cpf("902816474");
    private static final String CPF_C = cpf("902816475");
    private static final Set<String> CAMPOS_EVENTO = Set.of("id", "title", "tipo", "vagas", "vagasRestantes",
            "descricao", "data", "horaInicio", "horaFim", "local", "instrutor", "custo", "estado", "inicioEm", "fimEm");

    @Value("${local.server.port}") private int port;
    @Autowired private ObjectMapper json;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private EventoOficinaRepository eventos;
    @Autowired private InscricaoOficinaRepository inscricoes;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private FichasApiIntegrationTests.MutableClock relogio;

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private String gestor;

    @BeforeEach
    void preparar() throws Exception {
        inscricoes.deleteAllInBatch();
        eventos.deleteAllInBatch();
        usuarios.deleteAll();
        relogio.set(Instant.parse("2026-11-07T03:00:00Z"));
        gestor = entrar("gestor-oficinas", 'G');
    }

    @Test
    void validaCamposEOrdenaProgramacaoComDatasEHorariosDeFortaleza() throws Exception {
        var base = evento("08:30", "10:30", "900719925474099312345");
        for (String campo : base.keySet()) {
            var incompleto = new HashMap<>(base);
            incompleto.remove(campo);
            assertStatus(400, "POST", "", gestor, incompleto);
        }
        for (var alteracao : List.of(
                Map.entry("title", "x".repeat(61)), Map.entry("vagas", "0"), Map.entry("vagas", "1.5"),
                Map.entry("horaFim", "08:30"), Map.entry("horaFim", "00:15"),
                Map.entry("instrutor", "ANA-MARIA"), Map.entry("instrutor", "ANA D'ÁVILA"),
                Map.entry("instrutor", "ANA 2"), Map.entry("instrutor", "a".repeat(151)),
                Map.entry("local", "á".repeat(151)), Map.entry("tipo", "PALESTRA"), Map.entry("custo", "ABERTO"),
                Map.entry("data", "2026-11-06"))) {
            assertStatus(400, "POST", "", gestor, mudar(base, alteracao.getKey(), alteracao.getValue()));
        }
        assertEquals(0, eventos.count());

        JsonNode tarde = criar(evento("13:30", "15:30", "2"));
        JsonNode manha = criar(mudar(base, "descricao", "Descrição longa. ".repeat(1200)));
        long idManha = id(manha);
        assertEquals("SALA 2, BLOCO Á", manha.path("evento").path("local").asText());
        assertEquals("ÁLVARA ARAÚJO", manha.path("evento").path("instrutor").asText());
        assertEquals("900719925474099312345", manha.path("evento").path("vagasRestantes").asText());
        assertEquals("2026-11-07T11:30:00Z", manha.path("evento").path("inicioEm").asText());
        JsonNode publicos = agenda(PUBLICAS, null);
        assertEquals(List.of(idManha, id(tarde)), ids(publicos));
        assertEquals(CAMPOS_EVENTO, publicos.get(0).properties().stream().map(Map.Entry::getKey)
                .collect(java.util.stream.Collectors.toSet()));
        assertEquals(List.of(idManha), ids(agenda("?data=" + DATA + "&horaInicio=08:30&horaFim=10:30", gestor)));
        assertTrue(agenda("?horaFim=08:30", gestor).isEmpty());
        assertTrue(agenda("?data=2026-11-08", gestor).isEmpty());

        relogio.set(Instant.parse("2026-11-07T11:30:00Z"));
        assertEquals("EM_ANDAMENTO", agenda(PUBLICAS, null).get(0).path("estado").asText());
        relogio.set(Instant.parse("2026-11-07T13:30:00Z"));
        assertEquals(List.of(id(tarde)), ids(agenda(PUBLICAS, null)));
        assertEquals("ENCERRADO", agenda("", gestor).get(0).path("estado").asText());
        assertStatus(409, "PUT", "/" + idManha, gestor, mudar(base, "versao", manha.path("versao").asLong()));
        assertStatus(204, "DELETE", "/" + idManha, gestor, null);
    }

    @Test
    void permiteInscricaoConsultaECancelamentoSemLoginComCpfPorEvento() throws Exception {
        JsonNode criado = criar(evento("09:00", "10:00", "2"));
        long id = id(criado);
        String inscritos = "/" + id + "/inscricoes";
        String nutricionista = entrar("nutri-oficinas", 'N');
        String caixa = entrar("caixa-oficinas", 'C');
        String outroGestor = entrar("outro-gestor-oficinas", 'G');
        assertStatus(401, "GET", inscritos, null, null);
        for (String token : List.of(nutricionista, caixa)) {
            assertStatus(403, "GET", inscritos, token, null);
            assertStatus(403, "POST", "", token, evento("10:00", "11:00", "2"));
            assertStatus(403, "PUT", "/" + id, token, evento("10:00", "11:00", "2"));
            assertStatus(403, "DELETE", "/" + id, token, null);
        }
        assertStatus(400, "POST", PUBLICAS + inscritos, null, dadosInscricao("111.111.111-11"));
        assertStatus(400, "POST", PUBLICAS + inscritos, null, mudar(dadosInscricao(CPF_A), "dataNascimento", "2026-11-08"));
        assertStatus(400, "POST", PUBLICAS + inscritos, null, mudar(dadosInscricao(CPF_A), "email", "invalido"));
        assertEquals("1", inscrever(id, mascara(CPF_A), 201).path("vagasRestantes").asText());
        assertEquals("INSCRICAO_DUPLICADA", inscrever(id, CPF_A, 409).path("code").asText());
        assertEquals("0", inscrever(id, CPF_B, 201).path("vagasRestantes").asText());
        assertEquals("EVENTO_LOTADO", inscrever(id, CPF_C, 409).path("code").asText());
        assertTrue(minhas(CPF_A, "2000-11-02").isEmpty());
        assertEquals(List.of(id), ids(minhas(CPF_A, NASCIMENTO)));
        assertFalse(minhas(CPF_A, NASCIMENTO).get(0).has("cpf"));

        JsonNode lista = assertStatus(200, "GET", inscritos, outroGestor, null).path("inscricoes");
        assertEquals(2, lista.size());
        assertEquals(CPF_A, lista.get(0).path("cpf").asText());
        assertEquals(NASCIMENTO, lista.get(0).path("dataNascimento").asText());
        assertEquals(EMAIL, lista.get(0).path("email").asText());
        long inscricaoB = lista.get(1).path("id").asLong();
        assertStatus(403, "DELETE", inscritos + "/" + inscricaoB, caixa, null);
        assertEquals("REDUCAO_DE_VAGAS", editar(criado, evento("09:00", "10:00", "1"), 409).path("code").asText());
        assertStatus(404, "POST", PUBLICAS + "/" + id + "/cancelamentos", null, identidade(CPF_A, "2000-11-02"));
        assertStatus(204, "POST", PUBLICAS + "/" + id + "/cancelamentos", null, identidade(CPF_A, NASCIMENTO));
        assertTrue(minhas(CPF_A, NASCIMENTO).isEmpty());
        assertEquals("0", inscrever(id, CPF_A, 201).path("vagasRestantes").asText());
        assertStatus(204, "DELETE", inscritos + "/" + inscricaoB, outroGestor, null);
        assertTrue(minhas(CPF_B, NASCIMENTO).isEmpty());
        assertStatus(204, "DELETE", "/" + id, outroGestor, null);
        assertEquals(0, inscricoes.countByEventoId(id));
        assertStatus(404, "GET", inscritos, gestor, null);
    }

    @Test
    void consultaESalvaFrequenciaSomenteDoInicioEmDianteEParaInscricoesDoEvento() throws Exception {
        JsonNode criado = criar(evento("09:00", "10:00", "3"));
        long id = id(criado);
        inscrever(id, CPF_A, 201);
        inscrever(id, CPF_B, 201);
        String frequencia = "/" + id + "/frequencia";

        JsonNode inicial = assertStatus(200, "GET", frequencia, gestor, null);
        assertEquals("2026-11-07T12:00:00Z", inicial.path("evento").path("inicioEm").asText());
        assertEquals(2, inicial.path("inscricoes").size());
        assertFalse(inicial.path("inscricoes").get(0).path("presente").asBoolean());
        assertEquals(CPF_A, inicial.path("inscricoes").get(0).path("cpf").asText());

        String nutricionista = entrar("nutri-frequencia", 'N');
        assertStatus(401, "GET", frequencia, null, null);
        assertStatus(403, "GET", frequencia, nutricionista, null);
        assertStatus(403, "PUT", frequencia, nutricionista,
                Map.of("inscricoes", List.of(Map.of("inscricaoId", inicial.path("inscricoes").get(0).path("id").asLong(), "presente", true))));

        long inscricaoA = inicial.path("inscricoes").get(0).path("id").asLong();
        long inscricaoB = inicial.path("inscricoes").get(1).path("id").asLong();
        var lote = Map.of("inscricoes", List.of(Map.of("inscricaoId", inscricaoA, "presente", true),
                Map.of("inscricaoId", inscricaoB, "presente", false)));
        assertEquals("FREQUENCIA_BLOQUEADA", assertStatus(409, "PUT", frequencia, gestor, lote).path("code").asText());

        relogio.set(Instant.parse("2026-11-07T12:00:00Z"));
        assertEquals("INSCRICOES_ALTERADAS", assertStatus(409, "PUT", frequencia, gestor,
                Map.of("inscricoes", List.of(Map.of("inscricaoId", inscricaoA, "presente", true)))).path("code").asText());
        assertEquals("DADOS_INVALIDOS", assertStatus(400, "PUT", frequencia, gestor,
                Map.of("inscricoes", List.of(Map.of("inscricaoId", inscricaoA, "presente", true),
                        Map.of("inscricaoId", inscricaoA, "presente", false)))).path("code").asText());

        JsonNode salvo = assertStatus(200, "PUT", frequencia, gestor, lote);
        assertTrue(salvo.path("inscricoes").get(0).path("presente").asBoolean());
        assertFalse(salvo.path("inscricoes").get(1).path("presente").asBoolean());
        assertTrue(assertStatus(200, "GET", frequencia, gestor, null).path("inscricoes").get(0).path("presente").asBoolean());

        relogio.set(Instant.parse("2026-11-07T13:00:00Z"));
        lote = Map.of("inscricoes", List.of(Map.of("inscricaoId", inscricaoA, "presente", false),
                Map.of("inscricaoId", inscricaoB, "presente", true)));
        JsonNode corrigido = assertStatus(200, "PUT", frequencia, gestor, lote);
        assertFalse(corrigido.path("inscricoes").get(0).path("presente").asBoolean());
        assertTrue(corrigido.path("inscricoes").get(1).path("presente").asBoolean());
    }

    @Test
    void bloqueiaSobreposicaoEFechaInscricaoECancelamentoNoInicio() throws Exception {
        JsonNode primeiro = criar(evento("09:00", "10:00", "2"));
        long id = id(primeiro);
        long parcial = id(criar(evento("09:45", "10:30", "2")));
        long consecutivo = id(criar(evento("10:00", "11:00", "2")));
        long identico = id(criar(evento("09:00", "10:00", "2")));
        inscrever(id, CPF_A, 201);
        assertEquals("CONFLITO_DE_HORARIO", inscrever(parcial, CPF_A, 409).path("code").asText());
        assertEquals("CONFLITO_DE_HORARIO", inscrever(identico, CPF_A, 409).path("code").asText());
        inscrever(consecutivo, CPF_A, 201);
        long inscricao = assertStatus(200, "GET", "/" + id + "/inscricoes", gestor, null)
                .path("inscricoes").get(0).path("id").asLong();
        editar(primeiro, evento("09:00", "10:00", "3"), 200);

        relogio.set(Instant.parse("2026-11-07T12:00:00Z"));
        assertEquals("INSCRICOES_ENCERRADAS", inscrever(id, CPF_B, 409).path("code").asText());
        assertStatus(409, "POST", PUBLICAS + "/" + id + "/cancelamentos", null, identidade(CPF_A, NASCIMENTO));
        assertStatus(409, "DELETE", "/" + id + "/inscricoes/" + inscricao, gestor, null);
        assertEquals(List.of(id, consecutivo), ids(minhas(CPF_A, NASCIMENTO)));
        assertEquals("EM_ANDAMENTO", minhas(CPF_A, NASCIMENTO).get(0).path("estado").asText());
        relogio.set(Instant.parse("2026-11-07T13:00:00Z"));
        assertEquals(List.of(consecutivo), ids(minhas(CPF_A, NASCIMENTO)));
    }

    @Test
    void reagendarExigeConfirmacaoDoConjuntoAtualEPreservaInscricoesSemConflito() throws Exception {
        JsonNode movido = criar(evento("09:00", "10:00", "3"));
        long id = id(movido);
        long outro = id(criar(evento("11:00", "12:00", "3")));
        inscrever(id, CPF_A, 201);
        inscrever(id, CPF_B, 201);
        inscrever(id, CPF_C, 201);
        inscrever(outro, CPF_A, 201);

        var novoHorario = evento("11:45", "12:45", "3");
        JsonNode aviso = editar(movido, novoHorario, 409);
        assertEquals("REAGENDAMENTO_REQUER_CONFIRMACAO", aviso.path("code").asText());
        assertEquals(1, aviso.path("quantidade").asInt());
        assertEquals(3, inscricoes.countByEventoId(id));
        assertEquals("09:00:00", assertStatus(200, "GET", "/" + id, gestor, null).path("evento").path("horaInicio").asText());
        inscrever(outro, CPF_B, 201);
        JsonNode atualizado = editar(movido, mudar(novoHorario, "confirmacao", aviso.path("confirmacao").asText()), 409);
        assertEquals(2, atualizado.path("quantidade").asInt());
        assertNotEquals(aviso.path("confirmacao").asText(), atualizado.path("confirmacao").asText());
        assertEquals(3, inscricoes.countByEventoId(id));

        JsonNode salvo = editar(movido, mudar(novoHorario, "confirmacao", atualizado.path("confirmacao").asText()), 200);
        assertEquals("2", salvo.path("evento").path("vagasRestantes").asText());
        assertEquals(List.of(outro), ids(minhas(CPF_A, NASCIMENTO)));
        assertEquals(List.of(outro), ids(minhas(CPF_B, NASCIMENTO)));
        assertEquals(List.of(id), ids(minhas(CPF_C, NASCIMENTO)));
        assertEquals(1, inscricoes.countByEventoId(id));
        assertEquals(2, inscricoes.countByEventoId(outro));
        assertEquals("EVENTO_ALTERADO", editar(movido, novoHorario, 409).path("code").asText());
    }

    private JsonNode criar(Map<String, Object> evento) throws Exception {
        return assertStatus(201, "POST", "", gestor, evento);
    }

    private JsonNode editar(JsonNode anterior, Map<String, Object> evento, int status) throws Exception {
        return assertStatus(status, "PUT", "/" + id(anterior), gestor, mudar(evento, "versao", anterior.path("versao").asLong()));
    }

    private JsonNode inscrever(long id, String cpf, int status) throws Exception {
        return assertStatus(status, "POST", PUBLICAS + "/" + id + "/inscricoes", null, dadosInscricao(cpf));
    }

    private JsonNode minhas(String cpf, String dataNascimento) throws Exception {
        return assertStatus(200, "POST", PUBLICAS + "/minhas-inscricoes", null, identidade(cpf, dataNascimento)).path("eventos");
    }

    private JsonNode agenda(String rota, String token) throws Exception {
        return assertStatus(200, "GET", rota, token, null).path("eventos");
    }

    private JsonNode assertStatus(int status, String metodo, String rota, String token, Object corpo) throws Exception {
        var resposta = enviar(metodo, BASE + rota, token, corpo);
        assertEquals(status, resposta.statusCode(), () -> metodo + " " + rota + " " + resposta.body());
        return resposta.body().isBlank() ? null : json.readTree(resposta.body());
    }

    private HttpResponse<String> enviar(String metodo, String rota, String token, Object corpo) throws Exception {
        var requisicao = HttpRequest.newBuilder(URI.create("http://localhost:" + port + rota)).timeout(Duration.ofSeconds(15));
        if (token != null) requisicao.header("Authorization", "Bearer " + token);
        if (corpo != null) requisicao.header("Content-Type", "application/json");
        requisicao.method(metodo, corpo == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(json.writeValueAsString(corpo)));
        return http.send(requisicao.build(), HttpResponse.BodyHandlers.ofString());
    }

    private String entrar(String nome, char papel) throws Exception {
        String email = nome + "@example.test";
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setTipo(papel);
        usuario.setEmailRecuperacao(email);
        CredencialAutenticacao credencial = new CredencialAutenticacao();
        credencial.setPasswordHash(passwordEncoder.encode(SENHA));
        credencial.setDataCriacao(LocalDate.parse(DATA));
        credencial.setUsuario(usuario);
        usuario.setCredencialAutenticacao(credencial);
        usuarios.saveAndFlush(usuario);
        var resposta = enviar("POST", "/api/auth/login", null, Map.of("email", email, "senha", SENHA));
        assertEquals(200, resposta.statusCode());
        return json.readTree(resposta.body()).path("accessToken").asText();
    }

    private static Map<String, Object> evento(String inicio, String fim, String vagas) {
        return Map.of("title", "Oficina de teste", "tipo", "OFICINA", "vagas", vagas, "descricao", "Descrição de teste.",
                "data", DATA, "horaInicio", inicio, "horaFim", fim, "local", "Sala 2, bloco Á",
                "instrutor", "Álvara Araújo", "custo", "GRATUITO");
    }

    private static Map<String, Object> mudar(Map<String, Object> dados, String campo, Object valor) {
        var alterado = new HashMap<>(dados);
        alterado.put(campo, valor);
        return alterado;
    }

    private static Map<String, Object> identidade(String cpf, String nascimento) {
        return Map.of("cpf", cpf, "dataNascimento", nascimento);
    }

    private static Map<String, Object> dadosInscricao(String cpf) {
        return mudar(identidade(cpf, NASCIMENTO), "email", EMAIL);
    }

    private static long id(JsonNode gestao) {
        return gestao.path("evento").path("id").asLong();
    }

    private static List<Long> ids(JsonNode agenda) {
        return agenda.values().stream().map(evento -> evento.path("id").asLong()).toList();
    }

    private static String cpf(String base) {
        String cpf = base;
        while (cpf.length() < 11) {
            int soma = 0;
            for (int i = 0; i < cpf.length(); i++) soma += (cpf.charAt(i) - '0') * (cpf.length() + 1 - i);
            cpf += soma * 10 % 11 % 10;
        }
        return cpf;
    }

    private static String mascara(String cpf) {
        return cpf.substring(0, 3) + "." + cpf.substring(3, 6) + "." + cpf.substring(6, 9) + "-" + cpf.substring(9);
    }
}
