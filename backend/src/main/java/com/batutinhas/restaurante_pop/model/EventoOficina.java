package com.batutinhas.restaurante_pop.model;

import jakarta.persistence.*;

import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "oficinas_ou_cursos")
public class EventoOficina {
    public enum Tipo { OFICINA, CURSO }
    public enum Custo { PAGO, GRATUITO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private long versao;

    @Column(nullable = false, length = 60)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Tipo tipo;

    @Column(nullable = false, columnDefinition = "numeric")
    private BigInteger vagas;

    @Column(nullable = false, columnDefinition = "text")
    private String descricao;

    @Column(nullable = false)
    private LocalDate data;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fim", nullable = false)
    private LocalTime horaFim;

    @Column(nullable = false, length = 150)
    private String local;

    @Column(nullable = false, length = 150)
    private String instrutor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Custo custo;

    public EventoOficina() {}

    public void atualizar(String title, Tipo tipo, BigInteger vagas, String descricao, LocalDate data,
                           LocalTime horaInicio, LocalTime horaFim, String local, String instrutor, Custo custo) {
        this.title = title;
        this.tipo = tipo;
        this.vagas = vagas;
        this.descricao = descricao;
        this.data = data;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
        this.local = local;
        this.instrutor = instrutor;
        this.custo = custo;
    }

    public Long getId() { return id; }
    public long getVersao() { return versao; }
    public String getTitle() { return title; }
    public Tipo getTipo() { return tipo; }
    public BigInteger getVagas() { return vagas; }
    public String getDescricao() { return descricao; }
    public LocalDate getData() { return data; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public LocalTime getHoraFim() { return horaFim; }
    public String getLocal() { return local; }
    public String getInstrutor() { return instrutor; }
    public Custo getCusto() { return custo; }
}
