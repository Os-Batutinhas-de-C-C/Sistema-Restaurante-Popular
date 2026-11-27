package com.batutinhas.restaurante_pop.config;

import com.batutinhas.restaurante_pop.factory.UsuarioFactory;
import com.batutinhas.restaurante_pop.model.Refeicao;
import com.batutinhas.restaurante_pop.model.Semana;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.RefeicaoRepository;
import com.batutinhas.restaurante_pop.repository.SemanaRepository;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** RF012: bootstrap é opcional e idempotente; conferir a conta capturada sem banco ou perfil Spring. */
@ExtendWith(MockitoExtension.class)
@DisplayName("RF012 — Criação local de contas de bootstrap")
class DataInitializerTest {
    private static final String EMAIL = "bootstrap@example.test";
    private static final String SENHA = "senha-ficticia-de-teste";
    private static final LocalDate DATA_CRIACAO = LocalDate.of(2026, 11, 9);
    @Mock private UsuarioRepository usuarios;
    @Mock private RefeicaoRepository refeicoes;
    @Mock private SemanaRepository semanas;
    @Mock private PasswordEncoder encoder;

    @ParameterizedTest(name = "sem conta: e-mail={0}, senha={1}")
    @MethodSource("paresAusentes")
    @DisplayName("Par ausente ou branco não cria conta nem acessa colaboradores")
    void parAusenteIgnoraConta(String email, String senha) {
        inicializador('N', email, senha).run();

        verifyNoInteractions(usuarios, encoder);
    }

    @ParameterizedTest(name = "par incompleto: e-mail={0}, senha={1}")
    @MethodSource("paresIncompletos")
    @DisplayName("E-mail e senha devem ser configurados juntos para evitar conta incompleta")
    void parIncompletoFalhaAntesDePersistir(String email, String senha) {
        assertThatThrownBy(() -> inicializador('N', email, senha).run())
                .isInstanceOf(IllegalStateException.class);

        verifyNoInteractions(usuarios, encoder);
    }

    @Test
    @DisplayName("Conta já cadastrada não é recriada nem tem a senha recodificada")
    void contaExistenteNaoSofreAlteracao() {
        when(usuarios.findByEmailRecuperacao(EMAIL))
                .thenReturn(Optional.of(UsuarioFactory.criarUsuarioEntidadeValido(EMAIL, 'N')));

        inicializador('N', EMAIL, SENHA).run();

        verify(usuarios, never()).save(any());
        verifyNoInteractions(encoder);
    }

    @ParameterizedTest(name = "tipo {0} cria {1}")
    @CsvSource({"N,Nutricionista", "C,Caixa", "G,Gestor"})
    @DisplayName("Conta nova recebe papel correto, hash e credencial ligada ao usuário")
    void novaContaMantemPapelEHash(char tipo, String nome) {
        when(usuarios.findByEmailRecuperacao(EMAIL)).thenReturn(Optional.empty());
        when(encoder.encode(SENHA)).thenReturn("hash-ficticio");
        var capturada = ArgumentCaptor.forClass(Usuario.class);

        try (var datas = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
            datas.when(LocalDate::now).thenReturn(DATA_CRIACAO);
            inicializador(tipo, EMAIL, SENHA).run();
        }

        verify(usuarios).save(capturada.capture());
        var usuario = capturada.getValue();
        assertThat(usuario.getNome()).isEqualTo(nome);
        assertThat(usuario.getTipo()).isEqualTo(tipo);
        assertThat(usuario.getEmailRecuperacao()).isEqualTo(EMAIL);
        assertThat(usuario.getCredencialAutenticacao().getUsuario()).isSameAs(usuario);
        assertThat(usuario.getCredencialAutenticacao().getPasswordHash()).isEqualTo("hash-ficticio");
        assertThat(usuario.getCredencialAutenticacao().getDataCriacao()).isEqualTo(DATA_CRIACAO);
        assertThat(usuario.getCredencialAutenticacao().getTentativasFalhas()).isZero();
        assertThat(usuario.getCredencialAutenticacao().getVersaoToken()).isZero();
    }

    @Test
    @DisplayName("Regressão aprovada: trim antes da consulta impede recriar e-mail com espaços")
    void emailComEspacosConsultaContaNormalizadaAntesDeCriar() {
        // A regra aprovada exige a mesma normalização na consulta e na gravação.
        var existente = UsuarioFactory.criarUsuarioEntidadeValido(EMAIL, 'N');
        when(usuarios.findByEmailRecuperacao(anyString()))
                .thenAnswer(chamada -> EMAIL.equals(chamada.getArgument(0)) ? Optional.of(existente) : Optional.empty());

        inicializador('N', "  " + EMAIL + "  ", SENHA).run();

        verify(usuarios).findByEmailRecuperacao(EMAIL);
        verify(usuarios, never()).save(any());
        verifyNoInteractions(encoder);
    }

    @Test
    @DisplayName("Inicializa cinco refeições completas e diferentes no histórico local")
    void inicializaCincoRefeicoesCompletas() {
        prepararPersistenciaDemonstracao();
        var semanaCapturada = ArgumentCaptor.forClass(Semana.class);

        inicializador('N', "", "").run();

        verify(semanas).save(semanaCapturada.capture());
        var cardapio = semanaCapturada.getValue().getCardapio();
        assertThat(cardapio).hasSize(5).doesNotContainNull().doesNotHaveDuplicates();
        assertThat(cardapio).allSatisfy(refeicao -> {
            assertThat(refeicao.getProteina()).isNotBlank();
            assertThat(refeicao.getGuarnicao()).isNotBlank();
            assertThat(refeicao.getAcompanhamento1()).isNotBlank();
            assertThat(refeicao.getAcompanhamento2()).isNotBlank();
            assertThat(refeicao.getSuco()).isNotBlank();
            assertThat(refeicao.getSobremesa()).isNotBlank();
            assertThat(refeicao.getOpcaoProteica()).isNotBlank();
            assertThat(refeicao.getSaladaDoDia()).isNotBlank();
            assertThat(refeicao.getCalorias()).isPositive();
        });
    }

    @Test
    @DisplayName("Execuções repetidas reutilizam o histórico e não criam outra semana")
    void inicializacaoDemonstracaoEhIdempotente() {
        prepararPersistenciaDemonstracao();

        inicializador('N', "", "").run();
        inicializador('N', "", "").run();

        verify(semanas).save(any(Semana.class));
        verify(refeicoes, org.mockito.Mockito.times(5)).save(any(Refeicao.class));
    }

    @Test
    @DisplayName("Data de demonstração ocupada não substitui a semana existente")
    void dataOcupadaUsaOutraSemanaSemAlterarHistorico() {
        prepararPersistenciaDemonstracao();
        LocalDate dataOcupada = LocalDate.of(2025, 1, 6);
        Semana semanaExistente = new Semana();
        semanaExistente.setData(dataOcupada);
        semanaExistente.setCardapio(new ArrayList<>(java.util.Collections.nCopies(5, null)));
        when(semanas.findAllByOrderByDataAsc()).thenReturn(List.of(semanaExistente));
        var semanaCapturada = ArgumentCaptor.forClass(Semana.class);

        inicializador('N', "", "").run();

        verify(semanas).save(semanaCapturada.capture());
        assertThat(semanaCapturada.getValue().getData()).isEqualTo(dataOcupada.minusWeeks(1));
        assertThat(semanaCapturada.getValue().getData().getDayOfWeek()).isEqualTo(DayOfWeek.MONDAY);
        assertThat(semanaExistente.getData()).isEqualTo(dataOcupada);
        assertThat(semanaExistente.getCardapio()).containsOnlyNulls();
    }

    private void prepararPersistenciaDemonstracao() {
        Map<String, Refeicao> salvas = new HashMap<>();
        List<Semana> semanasSalvas = new ArrayList<>();
        when(refeicoes.findByComposicao(anyString(), anyString(), anyString(), anyString(),
                anyString(), anyString(), anyString(), anyString()))
                .thenAnswer(chamada -> Optional.ofNullable(salvas.get(chave(chamada.getArguments()))));
        when(refeicoes.save(any(Refeicao.class))).thenAnswer(chamada -> {
            Refeicao refeicao = chamada.getArgument(0);
            salvas.put(chave(refeicao), refeicao);
            return refeicao;
        });
        when(semanas.findAllByOrderByDataAsc()).thenAnswer(chamada -> List.copyOf(semanasSalvas));
        when(semanas.save(any(Semana.class))).thenAnswer(chamada -> {
            Semana semana = chamada.getArgument(0);
            semanasSalvas.add(semana);
            return semana;
        });
    }

    private static String chave(Object[] argumentos) {
        return java.util.Arrays.stream(argumentos).map(String::valueOf).collect(java.util.stream.Collectors.joining("|"));
    }

    private static String chave(Refeicao refeicao) {
        return String.join("|", refeicao.getProteina(), refeicao.getGuarnicao(), refeicao.getAcompanhamento1(),
                refeicao.getAcompanhamento2(), refeicao.getSuco(), refeicao.getSobremesa(),
                refeicao.getOpcaoProteica(), refeicao.getSaladaDoDia());
    }

    private DataInitializer inicializador(char tipo, String email, String senha) {
        return new DataInitializer(usuarios, refeicoes, semanas, encoder,
                tipo == 'N' ? email : "", tipo == 'N' ? senha : "",
                tipo == 'C' ? email : "", tipo == 'C' ? senha : "",
                tipo == 'G' ? email : "", tipo == 'G' ? senha : "");
    }

    private static Stream<Arguments> paresAusentes() {
        return Stream.of(Arguments.of(null, null), Arguments.of("", ""), Arguments.of(" ", "\t"));
    }

    private static Stream<Arguments> paresIncompletos() {
        return Stream.of(Arguments.of(EMAIL, null), Arguments.of(null, SENHA),
                Arguments.of(EMAIL, " "), Arguments.of(" ", SENHA));
    }
}
