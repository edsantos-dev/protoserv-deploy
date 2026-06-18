"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Logo from "@/components/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://protoserv-backend.up.railway.app/autenticacao/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            senha: password,
          }),
        }
      );

      if (!response.ok) {
        toast.error("E-mail ou senha inválidos");
        return;
      }

      const data = await response.json();

      // Limpa token antigo
      localStorage.removeItem("token");

      // Salva novo token
      if (data?.token) {
        localStorage.setItem("token", data.token);
      } else {
        toast.error("Erro ao obter token");
        return;
      }

      toast.success("Login realizado com sucesso!");

      setTimeout(() => {
        router.push("/");
      }, 1000);

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Erro ao conectar com o servidor.");
    }
  };

  return (
    <main className="flex flex-col min-h-screen items-center bg-gray-500 p-4">
      <Logo />

      <div className="w-full max-w-sm flex flex-col gap-6 bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="Digite seu e-mail"
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

          <Button label="Acessar" type="submit" />
        </form>

        <Link href="/register">
          <Button label="Quero me cadastrar" />
        </Link>
      </div>
    </main>
  );
}