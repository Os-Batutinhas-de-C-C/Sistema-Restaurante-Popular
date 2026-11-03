package com.batutinhas.restaurante_pop.config;

import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        
        if (usuarioRepository.findByEmailRecuperacao("marlianne@restaurante.com").isEmpty()) {
            Usuario nutri = new Usuario();
            nutri.setNome("Marlianne Nutricionista");
            nutri.setEmailRecuperacao("marlianne@restaurante.com");
            nutri.setTipo('N'); // Tipo Nutricionista

            CredencialAutenticacao credNutri = new CredencialAutenticacao();
            credNutri.setPasswordHash(passwordEncoder.encode("senhaNutri123")); // Troque pela senha real depois
            credNutri.setDataCriacao(LocalDate.now());
            credNutri.setTentativasFalhas(0);

            credNutri.setUsuario(nutri);
            nutri.setCredencialAutenticacao(credNutri);

            usuarioRepository.save(nutri);
            System.out.println("Usuário Nutricionista criado com sucesso!");
        }

        if (usuarioRepository.findByEmailRecuperacao("caixa@restaurante.com").isEmpty()) {
            Usuario caixa = new Usuario();
            caixa.setNome("Operador de Caixa");
            caixa.setEmailRecuperacao("caixa@restaurante.com");
            caixa.setTipo('C'); // Tipo Caixa

            CredencialAutenticacao credCaixa = new CredencialAutenticacao();
            credCaixa.setPasswordHash(passwordEncoder.encode("senhaCaixa123")); // Troque pela senha real depois
            credCaixa.setDataCriacao(LocalDate.now());
            credCaixa.setTentativasFalhas(0);

            credCaixa.setUsuario(caixa);
            caixa.setCredencialAutenticacao(credCaixa);

            usuarioRepository.save(caixa);
            System.out.println("Usuário Caixa criado com sucesso!");
        }
    }
}