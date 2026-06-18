"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";

type Servico = {
  id: number;
  nome: string;
  descricao: string;
  icone?: string;
  ativo?: boolean;
  prazoDias: number;
  categoria: string;
};

type FormData = {
  nome: string;
  descricao: string;
  icone: string;
  prazoDias: number | "";
  categoria: string;
};

const FORM_VAZIO: FormData = { nome: "", descricao: "", icone: "", prazoDias: "", categoria: "" };

export default function AdminServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const [painelAberto, setPainelAberto] = useState(false);
  const [modoForm, setModoForm] = useState<"detalhe" | "criar" | "editar">("detalhe");
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [form, setForm] = useState<FormData>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  useEffect(() => { carregarServicos(); }, []);

  async function carregarServicos() {
    setLoading(true);
    setErro(false);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://protoserv-backend.up.railway.app/servicos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setServicos(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      setErro(true);
    } finally {
      setLoading(false);
    }
  }

  async function carregarDetalhe(id: number) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://protoserv-backend.up.railway.app/servicos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      return await res.json() as Servico;
    } catch {
      return null;
    }
  }

  function abrirCriar() {
    setServicoSelecionado(null);
    setForm(FORM_VAZIO);
    setErroForm("");
    setModoForm("criar");
    setPainelAberto(true);
  }

  async function abrirDetalhe(s: Servico) {
    setErroForm("");
    setModoForm("detalhe");
    setPainelAberto(true);
    setServicoSelecionado(s);
    const detalhe = await carregarDetalhe(s.id);
    if (detalhe) setServicoSelecionado(detalhe);
  }

  function abrirEditar() {
    if (!servicoSelecionado) return;
    setForm({
      nome: servicoSelecionado.nome,
      descricao: servicoSelecionado.descricao,
      icone: servicoSelecionado.icone ?? "",
      prazoDias: servicoSelecionado.prazoDias,
      categoria: servicoSelecionado.categoria,
    });
    setErroForm("");
    setModoForm("editar");
  }

  function fecharPainel() {
    setPainelAberto(false);
    setServicoSelecionado(null);
    setForm(FORM_VAZIO);
  }

  async function salvarServico() {
    setErroForm("");
    if (!form.nome.trim() || !form.descricao.trim()) {
      setErroForm("Nome e descrição são obrigatórios.");
      return;
    }
    if (!form.categoria.trim()) {
      setErroForm("A categoria é obrigatória.");
      return;
    }
    if (form.prazoDias === "" || Number(form.prazoDias) <= 0) {
      setErroForm("O prazo em dias é obrigatório e deve ser maior que zero.");
      return;
    }
    setSalvando(true);
    try {
      const token = localStorage.getItem("token");
      const isEditar = modoForm === "editar";
      const url = isEditar
        ? `http://protoserv-backend.up.railway.app/servicos/${servicoSelecionado!.id}`
        : "http://protoserv-backend.up.railway.app/servicos";

      const res = await fetch(url, {
        method: isEditar ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          prazoDias: Number(form.prazoDias),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const salvo: Servico = await res.json();
      setServicoSelecionado(salvo);
      setModoForm("detalhe");
      carregarServicos();
    } catch (e: any) {
      setErroForm(e.message || "Erro ao salvar serviço.");
    } finally {
      setSalvando(false);
    }
  }

  async function toggleAtivo(s: Servico) {
    try {
      const token = localStorage.getItem("token");
      const acao = s.ativo === false ? "ativar" : "desativar";
      const res = await fetch(`http://protoserv-backend.up.railway.app/servicos/${s.id}/${acao}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      carregarServicos();
      if (servicoSelecionado?.id === s.id) {
        setServicoSelecionado((prev) => prev ? { ...prev, ativo: !prev.ativo } : prev);
      }
    } catch {
      alert("Erro ao alterar status do serviço.");
    }
  }

  return (
    <main className="flex h-screen bg-gray-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex overflow-hidden bg-gray-100">

        {/* ── LISTA ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white px-8 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Serviços</h1>
            <button
              onClick={abrirCriar}
              className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
            >
              + Novo serviço
            </button>
          </header>

          <div className="flex-1 p-8 overflow-auto">
            {loading ? (
              <p className="text-center text-gray-500 mt-10">Carregando serviços...</p>
            ) : erro ? (
              <div className="bg-white p-10 rounded-xl shadow text-center">
                <p className="text-red-700 font-semibold mb-3">Erro ao carregar serviços.</p>
                <button onClick={carregarServicos} className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm">
                  Tentar novamente
                </button>
              </div>
            ) : servicos.length === 0 ? (
              <div className="bg-white p-10 rounded-xl shadow text-center">
                <p className="text-gray-500">Nenhum serviço cadastrado.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {servicos.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => abrirDetalhe(s)}
                    className={`bg-white rounded-xl shadow px-6 py-4 flex items-center justify-between cursor-pointer transition hover:shadow-md hover:ring-2 hover:ring-blue-200 ${
                      servicoSelecionado?.id === s.id ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {s.icone && <span className="text-2xl">{s.icone}</span>}
                      <div>
                        <p className="font-bold text-gray-900">{s.nome}</p>
                        <p className="text-sm text-gray-500">{s.descricao}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.categoria} · {s.prazoDias} dia{s.prazoDias !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        s.ativo === false ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {s.ativo === false ? "Inativo" : "Ativo"}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleAtivo(s); }}
                        className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                          s.ativo === false
                            ? "bg-green-700 hover:bg-green-800 text-white"
                            : "bg-red-100 hover:bg-red-200 text-red-700"
                        }`}
                      >
                        {s.ativo === false ? "Ativar" : "Desativar"}
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
                {modoForm === "criar" ? "Novo Serviço" : modoForm === "editar" ? "Editar Serviço" : "Detalhes do Serviço"}
              </h2>
              <button onClick={fecharPainel} className="text-gray-400 hover:text-gray-700 text-lg">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">

              {/* ── DETALHE ── */}
              {modoForm === "detalhe" && servicoSelecionado && (
                <div className="flex flex-col gap-5">
                  {servicoSelecionado.icone && (
                    <div className="text-5xl text-center">{servicoSelecionado.icone}</div>
                  )}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Nome</p>
                    <p className="text-gray-900 font-semibold">{servicoSelecionado.nome}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Descrição</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{servicoSelecionado.descricao}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Categoria</p>
                    <p className="text-gray-700 text-sm">{servicoSelecionado.categoria}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Prazo</p>
                    <p className="text-gray-700 text-sm">{servicoSelecionado.prazoDias} dia{servicoSelecionado.prazoDias !== 1 ? "s" : ""}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Status</p>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      servicoSelecionado.ativo === false ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                      {servicoSelecionado.ativo === false ? "Inativo" : "Ativo"}
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
                      onClick={() => toggleAtivo(servicoSelecionado)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                        servicoSelecionado.ativo === false
                          ? "bg-green-700 hover:bg-green-800 text-white"
                          : "bg-red-100 hover:bg-red-200 text-red-700"
                      }`}
                    >
                      {servicoSelecionado.ativo === false ? "✅ Ativar" : "🚫 Desativar"}
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
                      placeholder="Nome do serviço"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Descrição *</label>
                    <textarea
                      value={form.descricao}
                      onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Descrição do serviço"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Categoria *</label>
                    <input
                      value={form.categoria}
                      onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Saúde, Educação, Transporte..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Prazo (dias) *</label>
                    <input
                      type="number"
                      min={1}
                      value={form.prazoDias}
                      onChange={(e) => setForm((f) => ({ ...f, prazoDias: e.target.value === "" ? "" : Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 5"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Ícone (emoji)</label>
                    <input
                      value={form.icone}
                      onChange={(e) => setForm((f) => ({ ...f, icone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 💡"
                    />
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
                      onClick={salvarServico}
                      disabled={salvando}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold transition"
                    >
                      {salvando ? "Salvando..." : modoForm === "criar" ? "Criar serviço" : "Salvar alterações"}
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