"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  ativo?: boolean;
  status?: string;
};

type FormData = {
  nome: string;
  email: string;
  senha: string;
  perfil: string;
};

const FORM_VAZIO: FormData = { nome: "", email: "", senha: "", perfil: "CIDADAO" };
const PERFIS = ["CIDADAO", "ATENDENTE", "ADMIN"];

function perfilLabel(p: string) {
  const map: Record<string, string> = { CIDADAO: "Cidadão", ATENDENTE: "Atendente", ADMIN: "Admin" };
  return map[p] ?? p;
}

function isAtivo(u: Usuario) {
  if (u.ativo !== undefined) return u.ativo;
  if (u.status) return u.status === "ATIVO";
  return true;
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const [painelAberto, setPainelAberto] = useState(false);
  const [modoForm, setModoForm] = useState<"detalhe" | "criar" | "editar">("detalhe");
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [form, setForm] = useState<FormData>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  useEffect(() => { carregarUsuarios(); }, []);

  async function carregarUsuarios() {
    setLoading(true);
    setErro(false);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      setErro(true);
    } finally {
      setLoading(false);
    }
  }

  function abrirCriar() {
    setForm(FORM_VAZIO);
    setErroForm("");
    setModoForm("criar");
    setUsuarioSelecionado(null);
    setPainelAberto(true);
  }

  function abrirDetalhe(u: Usuario) {
    setUsuarioSelecionado(u);
    setErroForm("");
    setModoForm("detalhe");
    setPainelAberto(true);
  }

  function abrirEditar() {
    if (!usuarioSelecionado) return;
    setForm({
      nome: usuarioSelecionado.nome,
      email: usuarioSelecionado.email,
      senha: "",
      perfil: usuarioSelecionado.perfil,
    });
    setErroForm("");
    setModoForm("editar");
  }

  function fecharPainel() {
    setPainelAberto(false);
    setUsuarioSelecionado(null);
    setForm(FORM_VAZIO);
  }

  async function salvarUsuario() {
    setErroForm("");
    if (!form.nome.trim() || !form.email.trim()) {
      setErroForm("Nome e e-mail são obrigatórios.");
      return;
    }
    if (modoForm === "criar" && !form.senha.trim()) {
      setErroForm("Senha é obrigatória ao criar usuário.");
      return;
    }
    setSalvando(true);
    try {
      const token = localStorage.getItem("token");
      const isEditar = modoForm === "editar";

      const payload: Record<string, string> = {
        nome: form.nome,
        email: form.email,
        perfil: form.perfil,
      };
      if (!isEditar || form.senha.trim()) payload.senha = form.senha;

      const url = isEditar
        ? `http://localhost:8080/usuarios/${usuarioSelecionado!.id}`
        : "http://localhost:8080/usuarios";

      const res = await fetch(url, {
        method: isEditar ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      const salvo: Usuario = await res.json();
      setUsuarioSelecionado(salvo);
      setModoForm("detalhe");
      carregarUsuarios();
    } catch (e: any) {
      setErroForm(e.message || "Erro ao salvar usuário.");
    } finally {
      setSalvando(false);
    }
  }

async function toggleAtivo(u: Usuario) {
  try {
    const token = localStorage.getItem("token");

    let res: Response;

    if (isAtivo(u)) {
      // DELETE /usuarios/inativar/{id}
      res = await fetch(`http://localhost:8080/usuarios/inativar/${u.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      // PATCH /usuarios/ativar/{id}
      res = await fetch(`http://localhost:8080/usuarios/ativar/${u.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    if (!res.ok) throw new Error();

    carregarUsuarios();
    if (usuarioSelecionado?.id === u.id) {
      const novoAtivo = !isAtivo(u);
      setUsuarioSelecionado((prev) =>
        prev ? { ...prev, ativo: novoAtivo, status: novoAtivo ? "ATIVO" : "INATIVO" } : prev
      );
    }
  } catch {
    alert("Erro ao alterar status do usuário.");
  }
}

  return (
    <main className="flex h-screen bg-gray-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex overflow-hidden bg-gray-100">

        {/* ── LISTA ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white px-8 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
            <button
              onClick={abrirCriar}
              className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
            >
              + Novo usuário
            </button>
          </header>

          <div className="flex-1 p-8 overflow-auto">
            {loading ? (
              <p className="text-center text-gray-500 mt-10">Carregando usuários...</p>
            ) : erro ? (
              <div className="bg-white p-10 rounded-xl shadow text-center">
                <p className="text-red-700 font-semibold mb-3">Erro ao carregar usuários.</p>
                <button onClick={carregarUsuarios} className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm">
                  Tentar novamente
                </button>
              </div>
            ) : usuarios.length === 0 ? (
              <div className="bg-white p-10 rounded-xl shadow text-center">
                <p className="text-gray-500">Nenhum usuário cadastrado.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {usuarios.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => abrirDetalhe(u)}
                    className={`bg-white rounded-xl shadow px-6 py-4 flex items-center justify-between cursor-pointer transition hover:shadow-md hover:ring-2 hover:ring-blue-200 ${
                      usuarioSelecionado?.id === u.id ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div>
                      <p className="font-bold text-gray-900">{u.nome}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                      <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        {perfilLabel(u.perfil)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        isAtivo(u) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {isAtivo(u) ? "Ativo" : "Inativo"}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleAtivo(u); }}
                        className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                          isAtivo(u)
                            ? "bg-red-100 hover:bg-red-200 text-red-700"
                            : "bg-green-700 hover:bg-green-800 text-white"
                        }`}
                      >
                        {isAtivo(u) ? "Inativar" : "Ativar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── PAINEL LATERAL ── */}
        {painelAberto && (
          <aside className="w-[400px] shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h2 className="font-bold text-gray-900 text-sm">
                {modoForm === "criar" ? "Novo Usuário" : modoForm === "editar" ? "Editar Usuário" : "Detalhes do Usuário"}
              </h2>
              <button onClick={fecharPainel} className="text-gray-400 hover:text-gray-700 text-lg">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">

              {/* ── DETALHE ── */}
              {modoForm === "detalhe" && usuarioSelecionado && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {usuarioSelecionado.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{usuarioSelecionado.nome}</p>
                      <p className="text-sm text-gray-500">{usuarioSelecionado.email}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Perfil</p>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                      {perfilLabel(usuarioSelecionado.perfil)}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Status</p>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      isAtivo(usuarioSelecionado) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {isAtivo(usuarioSelecionado) ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={abrirEditar}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg text-sm font-semibold transition"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => toggleAtivo(usuarioSelecionado)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                        isAtivo(usuarioSelecionado)
                          ? "bg-red-100 hover:bg-red-200 text-red-700"
                          : "bg-green-700 hover:bg-green-800 text-white"
                      }`}
                    >
                      {isAtivo(usuarioSelecionado) ? "🚫 Inativar" : "✅ Ativar"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── FORM CRIAR / EDITAR ── */}
              {(modoForm === "criar" || modoForm === "editar") && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Nome *</label>
                    <input
                      value={form.nome}
                      onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">E-mail *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Senha {modoForm === "editar" && <span className="text-gray-400 font-normal">(deixe em branco para não alterar)</span>}
                      {modoForm === "criar" && " *"}
                    </label>
                    <input
                      type="password"
                      value={form.senha}
                      onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Perfil *</label>
                    <select
                      value={form.perfil}
                      onChange={(e) => setForm((f) => ({ ...f, perfil: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {PERFIS.map((p) => (
                        <option key={p} value={p}>{perfilLabel(p)}</option>
                      ))}
                    </select>
                  </div>

                  {erroForm && (
                    <p className="text-red-600 text-xs font-medium">{erroForm}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    {modoForm === "editar" && (
                      <button
                        onClick={() => setModoForm("detalhe")}
                        className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      onClick={salvarUsuario}
                      disabled={salvando}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold transition"
                    >
                      {salvando ? "Salvando..." : modoForm === "criar" ? "Criar usuário" : "Salvar alterações"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}