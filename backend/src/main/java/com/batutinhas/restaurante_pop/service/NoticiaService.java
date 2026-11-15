package com.batutinhas.restaurante_pop.service;

import com.batutinhas.restaurante_pop.dto.NoticiaCreateRequestDTO;
import com.batutinhas.restaurante_pop.dto.NoticiaResponseDTO;
import com.batutinhas.restaurante_pop.model.Noticia;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.NoticiaRepository;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoticiaService {
    private final NoticiaRepository noticiaRepository;
    private final UsuarioRepository usuarioRepository;

    public NoticiaService(NoticiaRepository noticiaRepository, UsuarioRepository usuarioRepository) {
        this.noticiaRepository = noticiaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<NoticiaResponseDTO> findAll() {
        return noticiaRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public NoticiaResponseDTO create(NoticiaCreateRequestDTO request, String emailUsuarioAutenticado) {
        String assunto = RequestValidation.requiredText(request.assunto(), "assunto", 255);
        String texto = RequestValidation.requiredText(request.texto(), "texto", 255);
        if (request.duracao() == null || request.duracao() < 1 || request.duracao() > 72) {
            throw new IllegalArgumentException("duracao deve ser um inteiro entre 1 e 72 horas.");
        }

        Usuario autor = usuarioRepository.findByEmailRecuperacao(emailUsuarioAutenticado)
                .orElseThrow(() -> new EntityNotFoundException("Usuário autenticado não encontrado."));

        Noticia noticia = new Noticia();
        noticia.setAssunto(assunto);
        noticia.setTexto(texto);
        noticia.setHorario(request.horario());
        noticia.setData(request.data());
        noticia.setDuracao(request.duracao());
        noticia.setUsuario(autor);
        return toResponseDTO(noticiaRepository.save(noticia));
    }

    @Transactional
    public boolean delete(Long id) {
        if (!noticiaRepository.existsById(id)) return false;
        noticiaRepository.deleteById(id);
        return true;
    }

    private NoticiaResponseDTO toResponseDTO(Noticia noticia) {
        return new NoticiaResponseDTO(
                noticia.getIdMensagem(),
                noticia.getAssunto(),
                noticia.getTexto(),
                noticia.getHorario(),
                noticia.getData(),
                noticia.getDuracao()
        );
    }
}
