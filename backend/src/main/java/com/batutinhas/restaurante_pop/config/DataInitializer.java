package com.batutinhas.restaurante_pop.config;

import com.batutinhas.restaurante_pop.model.CredencialAutenticacao;
import com.batutinhas.restaurante_pop.model.Usuario;
import com.batutinhas.restaurante_pop.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Profile("local")
public class DataInitializer implements CommandLineRunner {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final List<BootstrapAccount> accounts;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.nutricionista.email:}") String nutricionistaEmail,
            @Value("${app.bootstrap.nutricionista.password:}") String nutricionistaPassword,
            @Value("${app.bootstrap.caixa.email:}") String caixaEmail,
            @Value("${app.bootstrap.caixa.password:}") String caixaPassword,
            @Value("${app.bootstrap.gestor.email:}") String gestorEmail,
            @Value("${app.bootstrap.gestor.password:}") String gestorPassword
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.accounts = List.of(
                new BootstrapAccount("Nutricionista", 'N', nutricionistaEmail, nutricionistaPassword),
                new BootstrapAccount("Caixa", 'C', caixaEmail, caixaPassword),
                new BootstrapAccount("Gestor", 'G', gestorEmail, gestorPassword)
        );
    }

    @Override
    public void run(String... args) {
        for (BootstrapAccount account : accounts) {
            boolean hasEmail = account.email() != null && !account.email().isBlank();
            boolean hasPassword = account.password() != null && !account.password().isBlank();
            if (!hasEmail && !hasPassword) continue;
            if (hasEmail != hasPassword) {
                throw new IllegalStateException("Both bootstrap email and password must be configured for " + account.label() + ".");
            }
            if (usuarioRepository.findByEmailRecuperacao(account.email()).isPresent()) continue;

            Usuario usuario = new Usuario();
            usuario.setNome(account.label());
            usuario.setEmailRecuperacao(account.email().trim());
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

    private record BootstrapAccount(String label, char tipo, String email, String password) {
    }
}
