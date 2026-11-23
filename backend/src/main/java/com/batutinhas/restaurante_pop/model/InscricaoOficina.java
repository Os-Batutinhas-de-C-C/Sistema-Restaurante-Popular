package com.batutinhas.restaurante_pop.model;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Entity
@Table(name = "inscricoes_oficinas_ou_cursos", uniqueConstraints = @UniqueConstraint(
        name = "uk_oficina_inscricao_cpf", columnNames = {"evento_id", "cpf"}))
public class InscricaoOficina {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private EventoOficina evento;

    @Column(nullable = false, length = 11)
    private String cpf;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Column(nullable = false, columnDefinition = "text")
    private String email;

    protected InscricaoOficina() {}

    public InscricaoOficina(EventoOficina evento, String cpf, LocalDate dataNascimento, String email) {
        this.evento = evento;
        this.cpf = cpf;
        this.dataNascimento = dataNascimento;
        this.email = email;
    }

    public Long getId() { return id; }
    public EventoOficina getEvento() { return evento; }
    public String getCpf() { return cpf; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public String getEmail() { return email; }
}
