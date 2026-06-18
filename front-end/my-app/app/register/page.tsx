"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Logo from "@/components/Logo";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://protoserv-backend.up.railway.app/autenticacao/registrar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: name,
            email,
            senha: password,
          }),
        }
      );

      if (!response.ok) {
        toast.error("Erro ao realizar cadastro");
        return;
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);

      toast.success("Cadastro realizado com sucesso!");

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error("Erro ao conectar com o servidor.");
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-500 p-4">
      <Logo />

      <div className="w-full max-w-sm flex flex-col gap-6 bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Cadastro
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Nome"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={setName}
            required
          />

          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={setEmail}
            required
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            required
          />

          <Button label="Criar Conta" type="submit" />
        </form>

        <Link href="/login">
          <Button label="Já possuo uma conta" />
        </Link>
      </div>
    </main>
  );
}