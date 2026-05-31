package com.protoserv.model;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios")
@EqualsAndHashCode(of = "id")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String email;
    private String senha;

    @Enumerated(EnumType.STRING)
    private Perfil perfil = Perfil.CIDADAO;
    @Enumerated(EnumType.STRING)
    private StatusUsuario status = StatusUsuario.ATIVO;

    public Usuario(String nome, String email, String senha) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
    }

    public Usuario(String nome, String email, String senha, Perfil perfil) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
    }

    public static Usuario criarAdmin(String nome, String email, String senha) {
        return new Usuario(nome, email, senha, Perfil.ADMIN);
    }

    public void inativar() {
        if (this.status == StatusUsuario.INATIVO) {
            throw new IllegalArgumentException("O usuário já está inativo.");
        }

        this.status = StatusUsuario.INATIVO;
    }

    public void ativar() {
        if (this.status == StatusUsuario.ATIVO) {
            throw new IllegalArgumentException("O usuário já está ativo.");
        }

        this.status = StatusUsuario.ATIVO;
    }

    public void atualizarSenha(String novaSenhaCriptografada) {
        if (novaSenhaCriptografada == null || novaSenhaCriptografada.isBlank()) {
            throw new IllegalArgumentException("A nova senha não pode ser nula ou vazia no domínio.");
        }
        this.senha = novaSenhaCriptografada;
    }

    public void atualizarDadosUsuario(String novoNome) {
        if (novoNome == null || novoNome.trim().isBlank()) {
            throw new IllegalArgumentException("O nome não pode ser nulo ou vazio.");
        }

        this.nome = novoNome;
    }

    public void alterarDadosUsuarioPerfilAdmin(Perfil novoPerfil) {
        if (novoPerfil == null) {
            throw new IllegalArgumentException("O perfil não pode ser nulo.");
        }
        
        this.perfil = novoPerfil;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(perfil.name()));
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.status == StatusUsuario.ATIVO;
    }
}
