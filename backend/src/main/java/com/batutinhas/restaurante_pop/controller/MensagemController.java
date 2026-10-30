package com.batutinhas.restaurante_pop.controller;

import org.springframework.web.bind.annotation.*; //[cite: 4]
import org.springframework.http.ResponseEntity;
import com.batutinhas.restaurante_pop.model.*; //[cite: 4]
import com.batutinhas.restaurante_pop.repository.MensagemRepository; //[cite: 4]
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;

import java.util.List;

    
@RestController
@RequestMapping("/api/mensagens")
public class MensagemController {
    private final MensagemRepository mensagemRepository;
    private final UsuarioRepository usuarioRepository;

    public MensagemController(MensagemRepository mensagemRepository, UsuarioRepository usuarioRepository) {
        this.mensagemRepository = mensagemRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mensagem> getMensagemById(@PathVariable Long id) {
        return mensagemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/usuario/{usuarioId}")
    public ResponseEntity<Mensagem> createMensagem(@PathVariable Long usuarioId, @RequestBody Mensagem mensagem) {    
        return usuarioRepository.findById(usuarioId).map(usuario -> {
            usuario.addMensagem(mensagem); // Utiliza o método auxiliar criado no passo anterior
            Mensagem novaMensagem = mensagemRepository.save(mensagem);
            return ResponseEntity.ok(novaMensagem);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mensagem> updateMensagem(@PathVariable Long id, @RequestBody Mensagem detalhesMensagem) {
        return mensagemRepository.findById(id).map(mensagemExistente -> {
            mensagemExistente.setTexto(detalhesMensagem.getTexto());
            mensagemExistente.setHorario(detalhesMensagem.getHorario());
            mensagemExistente.setData(detalhesMensagem.getData());
            
            Mensagem atualizada = mensagemRepository.save(mensagemExistente);
            return ResponseEntity.ok(atualizada);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMensagem(@PathVariable Long id) {
        if (mensagemRepository.existsById(id)) {
            mensagemRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
