package com.protoserv.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.protoserv.dto.request.DadosLoginDTO;
import com.protoserv.dto.request.DadosRegistroDTO;
import com.protoserv.dto.response.DadosAutenticacaoDTO;
import com.protoserv.model.Perfil;
import com.protoserv.model.StatusUsuario;
import com.protoserv.model.Usuario;
import com.protoserv.repository.UsuarioRepository;
import com.protoserv.security.JwtService;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioRepository usuarioRepository;

    public AuthService(JwtService jwtService, AuthenticationManager authenticationManager, PasswordEncoder passwordEncoder, UsuarioRepository usuarioRepository){
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public DadosAutenticacaoDTO registrar(DadosRegistroDTO registro){
        log.info("Iniciando processo de registro para o e-mail: {}", registro.email());

        if (usuarioRepository.findByEmailAndStatus(registro.email(), StatusUsuario.ATIVO).isPresent()) {
            log.warn("Tentativa de registro falhou: E-mail {} já está em uso.", registro.email());
            throw new IllegalArgumentException("Este e-mail já está em uso.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(registro.nome());
        usuario.setEmail(registro.email());
        usuario.setSenha(passwordEncoder.encode(registro.senha()));
        usuario.setPerfil(Perfil.CIDADAO);

        usuarioRepository.save(usuario);
        log.info("Usuário {} registrado com sucesso sob o perfil CIDADAO.", registro.email());

        String jwtToken = jwtService.gerarToken(usuario.getEmail(), usuario.getPerfil());
        
        return new DadosAutenticacaoDTO(jwtToken);
    }

    @Transactional
    public DadosAutenticacaoDTO login(DadosLoginDTO login){
        log.info("Tentativa de login recebida para o e-mail: {}", login.email());

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    login.email(), 
                    login.senha()
                )
            );
        } catch (BadCredentialsException e) {
            log.warn("Falha de autenticação: E-mail ou senha incorretos para o usuário {}.", login.email());
            throw new IllegalArgumentException("E-mail ou senha incorretos.");
        }

        Usuario usuario = usuarioRepository.findByEmailAndStatus(login.email(), StatusUsuario.ATIVO)
            .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado no banco de dados."));

        String jwtToken = jwtService.gerarToken(usuario.getEmail(), usuario.getPerfil());
        log.info("Login realizado com sucesso. Token gerado para: {}", login.email());

        return new DadosAutenticacaoDTO(jwtToken);
    }
}
