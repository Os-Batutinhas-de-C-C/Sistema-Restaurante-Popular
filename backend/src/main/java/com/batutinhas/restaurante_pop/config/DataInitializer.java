package com.batutinhas.restaurante_pop.config;

import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Refeicao;
import com.batutinhas.restaurante_pop.model.Semana;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.RefeicaoRepository;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Profile("local")
public class DataInitializer implements CommandLineRunner {
    private static final LocalDate SEMANA_DEMO = LocalDate.of(2025, 1, 6);
    private static final List<RefeicaoDemo> REFEICOES_DEMO = List.of(
            new RefeicaoDemo("Frango grelhado", "Arroz integral", "Feijão carioca", "Abóbora refogada", "Laranja", "Banana", "Omelete de legumes", "Alface e tomate", 650),
            new RefeicaoDemo("Carne de panela", "Purê de batata", "Feijão preto", "Couve refogada", "Maracujá", "Maçã", "Frango desfiado", "Repolho e cenoura", 710),
            new RefeicaoDemo("Peixe assado", "Macarrão ao sugo", "Lentilha", "Chuchu cozido", "Acerola", "Melancia", "Ovo cozido", "Alface e beterraba", 620),
            new RefeicaoDemo("Carne moída com legumes", "Cuscuz", "Feijão verde", "Macaxeira cozida", "Goiaba", "Mamão", "Torta de legumes", "Rúcula e tomate", 690),
            new RefeicaoDemo("Lombo suíno assado", "Arroz com cenoura", "Feijão fradinho", "Vagem refogada", "Abacaxi", "Laranja", "Escondidinho de soja", "Couve e tomate", 730)
    );

    private final UsuarioRepository usuarioRepository;
    private final RefeicaoRepository refeicaoRepository;
    private final SemanaRepository semanaRepository;
    private final PasswordEncoder passwordEncoder;
    private final List<BootstrapAccount> accounts;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            RefeicaoRepository refeicaoRepository,
            SemanaRepository semanaRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.nutricionista.email:}") String nutricionistaEmail,
            @Value("${app.bootstrap.nutricionista.password:}") String nutricionistaPassword,
            @Value("${app.bootstrap.caixa.email:}") String caixaEmail,
            @Value("${app.bootstrap.caixa.password:}") String caixaPassword,
            @Value("${app.bootstrap.gestor.email:}") String gestorEmail,
            @Value("${app.bootstrap.gestor.password:}") String gestorPassword
    ) {
        this.usuarioRepository = usuarioRepository;
        this.refeicaoRepository = refeicaoRepository;
        this.semanaRepository = semanaRepository;
        this.passwordEncoder = passwordEncoder;
        this.accounts = List.of(
                new BootstrapAccount("Nutricionista", 'N', nutricionistaEmail, nutricionistaPassword),
                new BootstrapAccount("Caixa", 'C', caixaEmail, caixaPassword),
                new BootstrapAccount("Gestor", 'G', gestorEmail, gestorPassword)
        );
    }

    @Override
    @Transactional
    public void run(String... args) {
        inicializarHistoricoDemonstracao();
        for (BootstrapAccount account : accounts) {
            boolean hasEmail = account.email() != null && !account.email().isBlank();
            boolean hasPassword = account.password() != null && !account.password().isBlank();
            if (!hasEmail && !hasPassword) continue;
            if (hasEmail != hasPassword) {
                throw new IllegalStateException("Both bootstrap email and password must be configured for " + account.label() + ".");
            }
            String email = account.email().trim();
            if (usuarioRepository.findByEmailRecuperacao(email).isPresent()) continue;

            Usuario usuario = new Usuario();
            usuario.setNome(account.label());
            usuario.setEmailRecuperacao(email);
            usuario.setTipo(account.tipo());

            CredencialAutenticacao credencial = new CredencialAutenticacao();
            credencial.setPasswordHash(passwordEncoder.encode(account.password()));
            credencial.setDataCriacao(LocalDate.now());
            credencial.setTentativasFalhas(0);
            credencial.setUsuario(usuario);
            usuario.setCredencialAutenticacao(credencial);

            usuarioRepository.save(usuario);
        }
    }

    /** Cria histórico fictício somente no perfil local para exercitar o gerador. */
    private void inicializarHistoricoDemonstracao() {
        List<Refeicao> refeicoes = REFEICOES_DEMO.stream()
                .map(this::obterOuCriarRefeicao)
                .toList();

        List<Semana> semanasExistentes = semanaRepository.findAllByOrderByDataAsc();
        boolean historicoJaPresente = semanasExistentes.stream()
                .anyMatch(semana -> semana.getCardapio().containsAll(refeicoes));
        if (historicoJaPresente) return;

        Set<LocalDate> datasOcupadas = semanasExistentes.stream()
                .map(Semana::getData)
                .collect(Collectors.toSet());
        LocalDate data = SEMANA_DEMO;
        while (datasOcupadas.contains(data)) data = data.minusWeeks(1);

        Semana semanaDemo = new Semana();
        semanaDemo.setData(data);
        semanaDemo.setCardapio(new ArrayList<>(refeicoes));
        semanaRepository.save(semanaDemo);
    }

    private Refeicao obterOuCriarRefeicao(RefeicaoDemo demo) {
        return refeicaoRepository.findByComposicao(
                demo.proteina(), demo.guarnicao(), demo.acompanhamento1(), demo.acompanhamento2(),
                demo.suco(), demo.sobremesa(), demo.opcaoProteica(), demo.saladaDoDia()
        ).orElseGet(() -> {
            Refeicao refeicao = new Refeicao();
            refeicao.setProteina(demo.proteina());
            refeicao.setGuarnicao(demo.guarnicao());
            refeicao.setAcompanhamento1(demo.acompanhamento1());
            refeicao.setAcompanhamento2(demo.acompanhamento2());
            refeicao.setSuco(demo.suco());
            refeicao.setSobremesa(demo.sobremesa());
            refeicao.setOpcaoProteica(demo.opcaoProteica());
            refeicao.setSaladaDoDia(demo.saladaDoDia());
            refeicao.setCalorias(demo.calorias());
            return refeicaoRepository.save(refeicao);
        });
    }

    private record BootstrapAccount(String label, char tipo, String email, String password) {
    }

    private record RefeicaoDemo(
            String proteina,
            String guarnicao,
            String acompanhamento1,
            String acompanhamento2,
            String suco,
            String sobremesa,
            String opcaoProteica,
            String saladaDoDia,
            double calorias
    ) {
    }
}
