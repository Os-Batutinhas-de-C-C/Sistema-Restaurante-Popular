package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.MensagemCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.MensagemResponseDTO;
import com.batutinhas.restaurante_pop.dto.MensagemUpdateRequestDTO;
import com.batutinhas.restaurante_pop.model.Mensagem;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.MensagemRepository;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MensagemService {
    private final MensagemRepository mensagemRepository;
    private final UsuarioRepository usuarioRepository;

    public MensagemService(MensagemRepository mensagemRepository, UsuarioRepository usuarioRepository) {
        this.mensagemRepository = mensagemRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<MensagemResponseDTO> findAll() {
        return mensagemRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<MensagemResponseDTO> findById(Long id) {
        return mensagemRepository.findById(id).map(this::toResponseDTO);
    }

    @Transactional
    public Optional<MensagemResponseDTO> create(Long usuarioId, MensagemCreateRequestDTO request) {
        return usuarioRepository.findById(usuarioId).map(usuario -> {
            RequestValidation.text(request.assunto(), "assunto", 255);
            RequestValidation.requiredText(request.texto(), "texto", 255);

            Mensagem mensagem = new Mensagem();
            mensagem.setAssunto(request.assunto());
            mensagem.setTexto(request.texto());
            mensagem.setHorario(request.horario());
            mensagem.setData(request.data());
            usuario.addMensagem(mensagem);
            return toResponseDTO(mensagemRepository.save(mensagem));
        });
    }

    @Transactional
    public Optional<MensagemResponseDTO> update(Long id, MensagemUpdateRequestDTO request) {
        return mensagemRepository.findById(id).map(mensagem -> {
            RequestValidation.requiredText(request.texto(), "texto", 255);
            mensagem.setTexto(request.texto());
            mensagem.setHorario(request.horario());
            mensagem.setData(request.data());
            return toResponseDTO(mensagemRepository.save(mensagem));
        });
    }

    @Transactional
    public boolean delete(Long id) {
        if (!mensagemRepository.existsById(id)) {
            return false;
        }
        mensagemRepository.deleteById(id);
        return true;
    }

    private MensagemResponseDTO toResponseDTO(Mensagem mensagem) {
        Usuario usuario = mensagem.getUsuario();
        return new MensagemResponseDTO(
                mensagem.getIdMensagem(),
                mensagem.getAssunto(),
                mensagem.getTexto(),
                mensagem.getHorario(),
                mensagem.getData(),
                usuario == null ? null : usuario.getIdUsuario()
        );
    }
}
