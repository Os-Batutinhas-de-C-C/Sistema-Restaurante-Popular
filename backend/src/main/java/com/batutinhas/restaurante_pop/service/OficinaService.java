package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.OficinaDTO;
import com.batutinhas.restaurante_pop.exception.OficinaException;
import com.batutinhas.restaurante_pop.model.EventoOficina;
import com.batutinhas.restaurante_pop.model.InscricaoOficina;
import com.batutinhas.restaurante_pop.repository.EventoOficinaRepository;
import com.batutinhas.restaurante_pop.repository.InscricaoOficinaRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.text.Normalizer;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Supplier;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class OficinaService {
    private static final ZoneId FORTALEZA = ZoneId.of("America/Fortaleza");
    private static final Sort ORDEM = Sort.by("data", "horaInicio", "id");
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+$");
    private static final Pattern CPF = Pattern.compile("[0-9]{11}|[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}");
    private static final Pattern NOME = Pattern.compile("[\\p{L} ]+");
    private static final int TENTATIVAS = 5;

    private final EventoOficinaRepository eventos;
    private final InscricaoOficinaRepository inscricoes;
    private final Clock clock;
    private final TransactionTemplate transacao;

    public OficinaService(EventoOficinaRepository eventos, InscricaoOficinaRepository inscricoes,
                          @Qualifier("fichasClock") Clock clock, PlatformTransactionManager txManager) {
        this.eventos = eventos;
        this.inscricoes = inscricoes;
        this.clock = clock;
        this.transacao = new TransactionTemplate(txManager);
        transacao.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        transacao.setIsolationLevel(TransactionDefinition.ISOLATION_SERIALIZABLE);
    }

    @Transactional(readOnly = true)
    public OficinaDTO.Agenda listar(LocalDate data, LocalTime inicio, LocalTime fim) {
        Instant agora = clock.instant();
        var encontrados = eventos.findAll((root, query, cb) -> {
            List<Predicate> filtros = new ArrayList<>();
            if (data != null) filtros.add(cb.equal(root.get("data"), data));
            if (inicio != null) filtros.add(cb.equal(root.get("horaInicio"), inicio));
            if (fim != null) filtros.add(cb.equal(root.get("horaFim"), fim));
            return cb.and(filtros.toArray(Predicate[]::new));
        }, ORDEM);
        return agenda(encontrados, agora);
    }

    @Transactional(readOnly = true)
    public OficinaDTO.Agenda programacao() {
        Instant agora = clock.instant();
        LocalDateTime local = LocalDateTime.ofInstant(agora, FORTALEZA);
        return agenda(eventos.listarProgramacao(local.toLocalDate(), local.toLocalTime()), agora);
    }

    @Transactional(readOnly = true)
    public OficinaDTO.EventoGestao consultar(long id) {
        EventoOficina evento = eventos.findById(id).orElseThrow(OficinaService::eventoNaoEncontrado);
        return gestao(evento, inscricoes.countByEventoId(id), clock.instant());
    }

    public OficinaDTO.EventoGestao criar(OficinaDTO.EventoRequest entrada) {
        var dados = validarEvento(entrada);
        return gravar(() -> {
            Instant agora = clock.instant();
            conferirFim(dados, agora);
            EventoOficina evento = new EventoOficina();
            aplicar(dados, evento);
            return gestao(eventos.saveAndFlush(evento), 0, agora);
        });
    }

    public OficinaDTO.EventoGestao editar(long id, OficinaDTO.EventoRequest entrada) {
        EventoOficina dados = validarEvento(entrada);
        return gravar(() -> {
            EventoOficina evento = bloquearEvento(id);
            Instant agora = clock.instant();
            if (!fim(evento).isAfter(agora)) throw conflito("EVENTO_ENCERRADO", "O evento já terminou.");
            conferirFim(dados, agora);
            if (!Objects.equals(entrada.versao(), evento.getVersao())) {
                throw conflito("EVENTO_ALTERADO", "O evento foi alterado. Recarregue os dados antes de editar.");
            }
            long total = inscricoes.countByEventoId(id);
            if (total > 0 && dados.getVagas().compareTo(evento.getVagas()) < 0) {
                throw conflito("REDUCAO_DE_VAGAS", "O evento tem inscrições ativas. A capacidade pode ser aumentada.");
            }

            List<Long> conflitos = mudouHorario(evento, dados) ? conflitosDoEvento(evento, dados) : List.of();
            if (!conflitos.isEmpty() || entrada.confirmacao() != null) {
                String referencia = referencia(evento, dados, conflitos);
                if (!referencia.equals(entrada.confirmacao())) {
                    throw new OficinaException(conflitos.size(), referencia);
                }
            }

            aplicar(dados, evento);
            if (!conflitos.isEmpty()) inscricoes.deleteAllByIdInBatch(conflitos);
            return gestao(eventos.saveAndFlush(evento), total - conflitos.size(), agora);
        });
    }

    public void remover(long id) {
        gravar(() -> {
            eventos.delete(bloquearEvento(id));
            return null;
        });
    }

    public OficinaDTO.Evento inscrever(long id, OficinaDTO.InscricaoRequest entrada) {
        String cpf = normalizarCpf(entrada.cpf());
        String email = texto(entrada.email(), "e-mail", 0);
        if (!EMAIL.matcher(email).matches()) throw invalido("Informe um e-mail válido.");
        return gravar(() -> {
            EventoOficina evento = bloquearEvento(id);
            Instant agora = clock.instant();
            validarNascimento(entrada.dataNascimento(), agora);
            conferirPrazo(evento, agora);
            if (inscricoes.existsByEventoIdAndCpf(id, cpf)) {
                throw conflito("INSCRICAO_DUPLICADA", "Este CPF já está inscrito neste evento.");
            }
            long total = inscricoes.countByEventoId(id);
            if (evento.getVagas().compareTo(BigInteger.valueOf(total)) <= 0) {
                throw conflito("EVENTO_LOTADO", "Todas as vagas deste evento foram preenchidas.");
            }
            if (!inscricoes.buscarCpfsEmConflito(List.of(cpf), id, evento.getData(),
                    evento.getHoraInicio(), evento.getHoraFim()).isEmpty()) {
                throw conflito("CONFLITO_DE_HORARIO", "Já existe uma inscrição para este CPF em um horário sobreposto.");
            }
            inscricoes.saveAndFlush(new InscricaoOficina(evento, cpf, entrada.dataNascimento(), email));
            return resposta(evento, total + 1, agora);
        });
    }

    @Transactional(readOnly = true)
    public OficinaDTO.Agenda consultarProprias(OficinaDTO.IdentidadeRequest entrada) {
        Instant agora = clock.instant();
        String cpf = normalizarCpf(entrada.cpf());
        LocalDate nascimento = validarNascimento(entrada.dataNascimento(), agora);
        LocalDateTime local = LocalDateTime.ofInstant(agora, FORTALEZA);
        return agenda(inscricoes.consultarProprias(cpf, nascimento, local.toLocalDate(), local.toLocalTime()), agora);
    }

    public void cancelarPropria(long id, OficinaDTO.IdentidadeRequest entrada) {
        String cpf = normalizarCpf(entrada.cpf());
        gravar(() -> {
            EventoOficina evento = bloquearEvento(id);
            Instant agora = clock.instant();
            LocalDate nascimento = validarNascimento(entrada.dataNascimento(), agora);
            InscricaoOficina inscricao = inscricoes.findByEventoIdAndCpfAndDataNascimento(id, cpf, nascimento)
                    .orElseThrow(OficinaService::inscricaoNaoEncontrada);
            conferirPrazo(evento, agora);
            inscricoes.delete(inscricao);
            return null;
        });
    }

    @Transactional(readOnly = true)
    public OficinaDTO.Inscritos listarInscritos(long id) {
        EventoOficina evento = eventos.findById(id).orElseThrow(OficinaService::eventoNaoEncontrado);
        var lista = inscricoes.findAllByEventoIdOrderByIdAsc(id).stream()
                .map(i -> new OficinaDTO.Inscrito(i.getId(), i.getCpf(), i.getDataNascimento(), i.getEmail()))
                .toList();
        return new OficinaDTO.Inscritos(clock.instant(), inicio(evento), lista);
    }

    public void cancelarComoGestor(long id, long inscricaoId) {
        gravar(() -> {
            EventoOficina evento = bloquearEvento(id);
            conferirPrazo(evento, clock.instant());
            InscricaoOficina inscricao = inscricoes.findByIdAndEventoId(inscricaoId, id)
                    .orElseThrow(OficinaService::inscricaoNaoEncontrada);
            inscricoes.delete(inscricao);
            return null;
        });
    }

    private OficinaDTO.Agenda agenda(List<EventoOficina> lista, Instant agora) {
        if (lista.isEmpty()) return new OficinaDTO.Agenda(agora, List.of());
        Map<Long, Long> totais = inscricoes.contarPorEvento(lista.stream().map(EventoOficina::getId).toList())
                .stream().collect(Collectors.toMap(InscricaoOficinaRepository.Contagem::getEventoId,
                        InscricaoOficinaRepository.Contagem::getTotal));
        return new OficinaDTO.Agenda(agora, lista.stream()
                .map(e -> resposta(e, totais.getOrDefault(e.getId(), 0L), agora)).toList());
    }

    private static OficinaDTO.EventoGestao gestao(EventoOficina evento, long total, Instant agora) {
        return new OficinaDTO.EventoGestao(resposta(evento, total, agora), evento.getVersao(), agora);
    }

    private static OficinaDTO.Evento resposta(EventoOficina e, long total, Instant agora) {
        Instant inicio = inicio(e);
        Instant fim = fim(e);
        OficinaDTO.Estado estado = agora.isBefore(inicio) ? OficinaDTO.Estado.PROGRAMADO
                : agora.isBefore(fim) ? OficinaDTO.Estado.EM_ANDAMENTO : OficinaDTO.Estado.ENCERRADO;
        return new OficinaDTO.Evento(e.getId(), e.getTitle(), e.getTipo(), e.getVagas().toString(),
                e.getVagas().subtract(BigInteger.valueOf(total)).toString(), e.getDescricao(), e.getData(),
                e.getHoraInicio(), e.getHoraFim(), e.getLocal(), e.getInstrutor(), e.getCusto(), estado, inicio, fim);
    }

    private List<Long> conflitosDoEvento(EventoOficina evento, EventoOficina novosDados) {
        var inscritos = inscricoes.findAllByEventoIdOrderByIdAsc(evento.getId());
        if (inscritos.isEmpty()) return List.of();
        var cpfs = new HashSet<>(inscricoes.buscarCpfsEmConflito(
                inscritos.stream().map(InscricaoOficina::getCpf).toList(), evento.getId(), novosDados.getData(),
                novosDados.getHoraInicio(), novosDados.getHoraFim()));
        return inscritos.stream().filter(i -> cpfs.contains(i.getCpf())).map(InscricaoOficina::getId).toList();
    }

    private static String referencia(EventoOficina evento, EventoOficina novosDados, List<Long> conflitos) {
        String dados = evento.getId() + "|" + evento.getVersao() + "|" + novosDados.getData() + "|"
                + novosDados.getHoraInicio() + "|" + novosDados.getHoraFim() + "|" + conflitos;
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(dados.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private <T> T gravar(Supplier<T> operacao) {
        for (int tentativa = 1; ; tentativa++) {
            try {
                return transacao.execute(status -> operacao.get());
            } catch (RuntimeException e) {
                if (violacaoCpfUnico(e)) {
                    throw conflito("INSCRICAO_DUPLICADA", "Este CPF já está inscrito neste evento.");
                }
                if (!conflitoDeTransacao(e)) throw e;
                if (tentativa == TENTATIVAS) {
                    throw conflito("OPERACAO_CONCORRENTE", "Os dados do evento mudaram. Tente novamente.");
                }
            }
        }
    }

    private static boolean conflitoDeTransacao(Throwable e) {
        for (Throwable causa = e; causa != null; causa = causa.getCause()) {
            if (causa instanceof SQLException sql && ("40001".equals(sql.getSQLState()) || "40P01".equals(sql.getSQLState()))) {
                return true;
            }
        }
        return false;
    }

    private static boolean violacaoCpfUnico(Throwable e) {
        for (Throwable causa = e; causa != null; causa = causa.getCause()) {
            if (causa instanceof org.hibernate.exception.ConstraintViolationException violacao
                    && violacao.getConstraintName() != null
                    && violacao.getConstraintName().toLowerCase(Locale.ROOT).contains("uk_oficina_inscricao_cpf")) {
                return true;
            }
        }
        return false;
    }

    private EventoOficina bloquearEvento(long id) {
        return eventos.findByIdForUpdate(id).orElseThrow(OficinaService::eventoNaoEncontrado);
    }

    private static EventoOficina validarEvento(OficinaDTO.EventoRequest entrada) {
        String title = texto(entrada.title(), "título", 60);
        String descricao = texto(entrada.descricao(), "descrição", 0);
        String local = maiusculas(entrada.local(), "local");
        String instrutor = maiusculas(entrada.instrutor(), "instrutor");
        if (!NOME.matcher(instrutor).matches()) throw invalido("O instrutor deve conter apenas letras e espaços.");
        if (entrada.tipo() == null || entrada.custo() == null) throw invalido("Informe o tipo e o custo.");
        String capacidade = texto(entrada.vagas(), "número de vagas", 0);
        if (!capacidade.matches("[0-9]+")) throw invalido("Informe um número inteiro de vagas maior que zero.");
        BigInteger vagas = new BigInteger(capacidade);
        if (vagas.signum() <= 0) throw invalido("Informe um número de vagas maior que zero.");
        if (entrada.data() == null || entrada.horaInicio() == null || entrada.horaFim() == null) {
            throw invalido("Informe data, horário de início e horário de fim.");
        }
        LocalTime inicio = entrada.horaInicio().truncatedTo(ChronoUnit.MICROS);
        LocalTime fim = entrada.horaFim().truncatedTo(ChronoUnit.MICROS);
        if (!fim.isAfter(inicio)) throw invalido("O horário de fim deve ser posterior ao início no mesmo dia.");
        EventoOficina evento = new EventoOficina();
        evento.atualizar(title, entrada.tipo(), vagas, descricao, entrada.data(), inicio, fim, local, instrutor, entrada.custo());
        return evento;
    }

    private static void aplicar(EventoOficina dados, EventoOficina evento) {
        evento.atualizar(dados.getTitle(), dados.getTipo(), dados.getVagas(), dados.getDescricao(), dados.getData(),
                dados.getHoraInicio(), dados.getHoraFim(), dados.getLocal(), dados.getInstrutor(), dados.getCusto());
    }

    private static String texto(String valor, String campo, int limite) {
        if (valor == null || valor.isBlank()) throw invalido("Informe " + campo + ".");
        String limpo = valor.strip();
        if (limite > 0 && limpo.codePointCount(0, limpo.length()) > limite) {
            throw invalido("O campo " + campo + " deve ter até " + limite + " caracteres.");
        }
        return limpo;
    }

    private static String maiusculas(String valor, String campo) {
        String limpo = texto(valor, campo, 0);
        return texto(Normalizer.normalize(limpo.toUpperCase(Locale.ROOT), Normalizer.Form.NFC), campo, 150);
    }

    private static String normalizarCpf(String valor) {
        String informado = texto(valor, "CPF", 0);
        if (!CPF.matcher(informado).matches()) throw invalido("Informe um CPF válido.");
        String cpf = informado.replace("-", "").replace(".", "");
        if (cpf.chars().distinct().count() == 1 || digitoCpf(cpf, 9) != cpf.charAt(9) - '0'
                || digitoCpf(cpf, 10) != cpf.charAt(10) - '0') {
            throw invalido("Informe um CPF válido.");
        }
        return cpf;
    }

    private static int digitoCpf(String cpf, int tamanho) {
        int soma = 0;
        for (int i = 0; i < tamanho; i++) soma += (cpf.charAt(i) - '0') * (tamanho + 1 - i);
        return soma * 10 % 11 % 10;
    }

    private static LocalDate validarNascimento(LocalDate data, Instant agora) {
        if (data == null || data.isAfter(LocalDate.ofInstant(agora, FORTALEZA))) {
            throw invalido("Informe uma data de nascimento válida.");
        }
        return data;
    }

    private static boolean mudouHorario(EventoOficina anterior, EventoOficina proposta) {
        return !anterior.getData().equals(proposta.getData()) || !anterior.getHoraInicio().equals(proposta.getHoraInicio())
                || !anterior.getHoraFim().equals(proposta.getHoraFim());
    }

    private static Instant inicio(EventoOficina evento) {
        return evento.getData().atTime(evento.getHoraInicio()).atZone(FORTALEZA).toInstant();
    }

    private static Instant fim(EventoOficina evento) {
        return evento.getData().atTime(evento.getHoraFim()).atZone(FORTALEZA).toInstant();
    }

    private static void conferirFim(EventoOficina evento, Instant agora) {
        if (!fim(evento).isAfter(agora)) throw invalido("O horário de fim deve estar no futuro.");
    }

    private static void conferirPrazo(EventoOficina evento, Instant agora) {
        if (!inicio(evento).isAfter(agora)) {
            throw conflito("INSCRICOES_ENCERRADAS", "O prazo de inscrição e cancelamento já terminou.");
        }
    }

    private static OficinaException invalido(String mensagem) {
        return new OficinaException(HttpStatus.BAD_REQUEST, "DADOS_INVALIDOS", mensagem);
    }

    private static OficinaException conflito(String codigo, String mensagem) {
        return new OficinaException(HttpStatus.CONFLICT, codigo, mensagem);
    }

    private static OficinaException eventoNaoEncontrado() {
        return new OficinaException(HttpStatus.NOT_FOUND, "EVENTO_NAO_ENCONTRADO", "Evento não encontrado.");
    }

    private static OficinaException inscricaoNaoEncontrada() {
        return new OficinaException(HttpStatus.NOT_FOUND, "INSCRICAO_NAO_ENCONTRADA", "Inscrição não encontrada.");
    }
}
