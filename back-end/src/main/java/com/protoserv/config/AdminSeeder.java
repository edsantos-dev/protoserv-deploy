package com.protoserv.config;

import com.protoserv.model.Perfil;
import com.protoserv.model.Usuario;
import com.protoserv.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${api.default.admin.email}")
    private String adminEmail;

    @Value("${api.default.admin.senha}")
    private String adminSenha;

    public AdminSeeder(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        try {
            if (adminEmail == null || adminEmail.isBlank() || adminSenha == null || adminSenha.isBlank()) {
                log.error("Falha ao semear Admin: As credenciais de ambiente estão inválidas ou vazias.");
                return;
            }

            usuarioRepository.findByEmail(adminEmail).ifPresentOrElse(
                    usuario -> log.info("Admin padrão já existe no banco de dados. Pulando etapa de criação."),
                    () -> {
                        Usuario novoAdmin = new Usuario();
                        novoAdmin.setNome("Administrador do Sistema");
                        novoAdmin.setEmail(adminEmail);
                        novoAdmin.setSenha(passwordEncoder.encode(adminSenha));
                        novoAdmin.setPerfil(Perfil.ADMIN);
                        
                        usuarioRepository.save(novoAdmin);
                        log.info("Usuário Administrador padrão gerado com sucesso!");
                    }
            );
        } catch (Exception e) {
            log.error("Erro inesperado ao tentar gerar o administrador padrão: {}", e.getMessage(), e);
        }
    }
}