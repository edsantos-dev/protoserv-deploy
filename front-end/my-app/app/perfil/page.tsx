"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Perfil() {
  const router = useRouter();

  const [editando, setEditando] = useState(false);
  const [trocandoSenha, setTrocandoSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [usuario, setUsuario] = useState({ nome: "", email: "" });
  const [backup, setBackup] = useState({ nome: "", email: "" });

  const [senha, setSenha] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  const [toast, setToast] = useState<{ mensagem: string; tipo: "sucesso" | "erro" } | null>(null);

  function mostrarToast(mensagem: string, tipo: "sucesso" | "erro") {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    async function carregar() {
      try {
        const res = await fetch("http://protoserv-backend.up.railway.app/usuarios/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsuario({ nome: data.nome, email: data.email });
        setBackup({ nome: data.nome, email: data.email });
      } catch {
        router.push("/login");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  }

  function handleSenhaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setSenha((prev) => ({ ...prev, [name]: value }));
  }

  function cancelarEdicao() {
    setUsuario(backup);
    setEditando(false);
  }

  function cancelarSenha() {
    setSenha({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    setTrocandoSenha(false);
  }

  async function salvarPerfil() {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch("http://protoserv-backend.up.railway.app/usuarios/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: usuario.nome }),
      });

      if (!res.ok) {
        mostrarToast("Erro ao salvar perfil.", "erro");
        return;
      }

      setBackup(usuario);
      setEditando(false);
      mostrarToast("Perfil atualizado com sucesso!", "sucesso");
    } catch {
      mostrarToast("Erro de conexão.", "erro");
    } finally {
      setLoading(false);
    }
  }

  async function salvarSenha() {
    if (senha.novaSenha !== senha.confirmarSenha) {
      mostrarToast("As senhas não coincidem.", "erro");
      return;
    }
    if (senha.novaSenha.length < 6) {
      mostrarToast("A nova senha deve ter ao menos 6 caracteres.", "erro");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch("http://protoserv-backend.up.railway.app/usuarios/me/senha", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senhaAtual: senha.senhaAtual,
          novaSenha: senha.novaSenha,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        mostrarToast(err?.message || "Senha atual incorreta.", "erro");
        return;
      }

      cancelarSenha();
      mostrarToast("Senha alterada com sucesso!", "sucesso");
    } catch {
      mostrarToast("Erro de conexão.", "erro");
    } finally {
      setLoading(false);
    }
  }

  const inicial = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "U";

  if (carregando) {
    return (
      <main className="flex h-screen bg-gray-900">
        <Sidebar />
        <div className="flex-1 bg-gray-100 flex justify-center items-center">
          <p className="text-gray-400 text-sm">Carregando perfil...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen bg-gray-900">
      <Sidebar />

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.tipo === "sucesso"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {toast.mensagem}
        </div>
      )}

      <div className="flex-1 bg-gray-100 flex justify-center items-start p-8 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-6">

          {/* CARD PERFIL */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">

            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {inicial}
              </div>
              <div>
                <p className="text-sm text-gray-800 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {usuario.email}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nome</label>
                <input
                  name="nome"
                  value={usuario.nome}
                  onChange={handleChange}
                  disabled={!editando}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">E-mail</label>
                <p className="text-sm text-gray-800 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {usuario.email}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {editando && (
                <button
                  onClick={cancelarEdicao}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={() => (editando ? salvarPerfil() : setEditando(true))}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
              >
                {editando ? (loading ? "Salvando..." : "Salvar") : "Editar perfil"}
              </button>
            </div>
          </div>

          {/* CARD SENHA */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-semibold text-gray-800">Senha</p>
                <p className="text-sm text-gray-400">Altere sua senha de acesso</p>
              </div>
              {!trocandoSenha && (
                <button
                  onClick={() => setTrocandoSenha(true)}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                >
                  Alterar senha
                </button>
              )}
            </div>

            {trocandoSenha && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Senha atual</label>
                  <input
                    type="password"
                    name="senhaAtual"
                    value={senha.senhaAtual}
                    onChange={handleSenhaChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Nova senha</label>
                  <input
                    type="password"
                    name="novaSenha"
                    value={senha.novaSenha}
                    onChange={handleSenhaChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Confirmar nova senha</label>
                  <input
                    type="password"
                    name="confirmarSenha"
                    value={senha.confirmarSenha}
                    onChange={handleSenhaChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={cancelarSenha}
                    className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={salvarSenha}
                    disabled={loading}
                    className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {loading ? "Salvando..." : "Salvar senha"}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}