package com.batutinhas.restaurante_pop.controller;

import com.batutinhas.restaurante_pop.dto.ApiErrorDTO;
import com.batutinhas.restaurante_pop.dto.OficinaDTO;
import com.batutinhas.restaurante_pop.exception.OficinaException;
import com.batutinhas.restaurante_pop.service.OficinaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/oficinas-ou-cursos")
public class OficinaController {
    private final OficinaService service;

    public OficinaController(OficinaService service) {
        this.service = service;
    }

    @GetMapping("/publicas")
    public OficinaDTO.Agenda programacao() {
        return service.programacao();
    }

    @PostMapping("/publicas/{id}/inscricoes")
    @ResponseStatus(HttpStatus.CREATED)
    public OficinaDTO.Evento inscrever(@PathVariable long id, @RequestBody OficinaDTO.InscricaoRequest entrada) {
        return service.inscrever(id, entrada);
    }

    @PostMapping("/publicas/minhas-inscricoes")
    public ResponseEntity<OficinaDTO.Agenda> consultarProprias(@RequestBody OficinaDTO.IdentidadeRequest entrada) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.consultarProprias(entrada));
    }

    @PostMapping("/publicas/{id}/cancelamentos")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelarPropria(@PathVariable long id, @RequestBody OficinaDTO.IdentidadeRequest entrada) {
        service.cancelarPropria(id, entrada);
    }

    @GetMapping
    public OficinaDTO.Agenda listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horaFim) {
        return service.listar(data, horaInicio, horaFim);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OficinaDTO.EventoGestao criar(@RequestBody OficinaDTO.EventoRequest entrada) {
        return service.criar(entrada);
    }

    @GetMapping("/{id}")
    public OficinaDTO.EventoGestao consultar(@PathVariable long id) {
        return service.consultar(id);
    }

    @PutMapping("/{id}")
    public OficinaDTO.EventoGestao editar(@PathVariable long id, @RequestBody OficinaDTO.EventoRequest entrada) {
        return service.editar(id, entrada);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable long id) {
        service.remover(id);
    }

    @GetMapping("/{id}/inscricoes")
    public ResponseEntity<OficinaDTO.Inscritos> consultarInscritos(@PathVariable long id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.listarInscritos(id));
    }

    @DeleteMapping("/{id}/inscricoes/{inscricaoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelarComoGestor(@PathVariable long id, @PathVariable long inscricaoId) {
        service.cancelarComoGestor(id, inscricaoId);
    }

    @ExceptionHandler(OficinaException.class)
    public ResponseEntity<?> falhaDeOficina(OficinaException erro) {
        Object corpo = erro.getConfirmacao() != null ? erro.getConfirmacao() : new ApiErrorDTO(erro.getCode(), erro.getMessage());
        return ResponseEntity.status(erro.getStatus()).body(corpo);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiErrorDTO> dadosInvalidos() {
        return ResponseEntity.badRequest().body(new ApiErrorDTO("DADOS_INVALIDOS", "Confira os dados enviados."));
    }
}
