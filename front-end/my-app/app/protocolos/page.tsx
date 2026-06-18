"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type Protocolo = {
  id: number;
  protocolo: string;
  servicoNome: string;
  cidadaoNome?: string;
  atendenteNome?: string | null;
  status: string;
  dataAbertura: string;
};

type Acompanhamento = {
  autorNome: string;
  autorPerfil: string;
  descricao: string;
  anexoUrl: string | null;
  dataRegistro: string;
};

type Solicitacao = {
  id: number;
  protocolo: string;
  descricao: string;
  status: string;
  prioridade: string;
  servicoNome: string;
  cidadaoNome: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string | null;
  anexoUrl: string | null;
  dataAbertura: string;
  dataConclusao: string | null;
  atendenteNome: string | null;
  historico: Acompanhamento[];
};

const STATUS_OPTIONS = [
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "CONCLUIDA", label: "Concluída" },
  { value: "CANCELADA", label: "Cancelada" },
];

function getPerfil(): string {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    const perfil = payload.perfil ?? payload.role ?? payload.authorities ?? "";
    return String(perfil).toUpperCase().replace("ROLE_", "");
  } catch {
    return "";
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "NOVO": return "bg-red-200 text-red-800";
    case "EM_ANDAMENTO": return "bg-yellow-200 text-yellow-900";
    case "PENDENTE": return "bg-purple-200 text-purple-900";
    case "CONCLUIDA": return "bg-green-200 text-green-900";
    case "CANCELADA": return "bg-gray-200 text-gray-700";
    default: return "bg-gray-200 text-gray-700";
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    NOVO: "Novo",
    EM_ANDAMENTO: "Em andamento",
    PENDENTE: "Pendente",
    CONCLUIDA: "Concluída",
    CANCELADA: "Cancelada",
  };
  return labels[status] ?? status;
}

function getPrioridadeLabel(prioridade: string) {
  const labels: Record<string, string> = { ALTA: "Alta", MEDIA: "Média", BAIXA: "Baixa" };
  return labels[prioridade] ?? prioridade;
}

function getPrioridadeStyle(prioridade: string) {
  switch (prioridade) {
    case "ALTA": return "bg-red-100 text-red-800";
    case "MEDIA": return "bg-orange-100 text-orange-800";
    case "BAIXA": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-600";
  }
}

function isStatusFinal(status: string) {
  return status === "CONCLUIDA" || status === "CANCELADA";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── PONTO 8 FIX: cor explícita no texto do robô ──
function MensagemBubble({ msg, perfil }: { msg: Acompanhamento; perfil: string }) {
  const isSistema = msg.autorPerfil === "SISTEMA";

  const isOwn = !isSistema && (
    perfil === "CIDADAO"
      ? msg.autorPerfil === "CIDADAO"
      : msg.autorPerfil === "ATENDENTE" || msg.autorPerfil === "ADMIN"
  );

  if (isSistema) {
    return (
      <div className="flex justify-center my-2">
        {/* fix: forçar cor do texto com style inline para não ser sobrescrita */}
        <div
          className="border border-gray-200 text-xs px-4 py-2 rounded-full"
          style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
        >
          🤖 <span style={{ color: "#374151" }}>{msg.descricao}</span>
          {" "}—{" "}
          <span style={{ color: "#9ca3af" }}>{formatDate(msg.dataRegistro)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[80%] flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
        <span className={`text-xs font-semibold ${isOwn ? "text-blue-700" : "text-gray-500"}`}>
          {isOwn ? "Você" : `${msg.autorNome} · ${msg.autorPerfil === "CIDADAO" ? "Cidadão" : "Atendente"}`}
        </span>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isOwn
            ? "bg-blue-700 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
        }`}>
          {msg.descricao}
          {msg.anexoUrl && (
            <a href={msg.anexoUrl} target="_blank" rel="noreferrer"
              className={`block mt-2 underline text-xs ${isOwn ? "text-blue-200" : "text-blue-600"}`}>
              📎 Ver anexo
            </a>
          )}
        </div>
        <span className="text-[11px] text-gray-400">{formatDate(msg.dataRegistro)}</span>
      </div>
    </div>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{titulo}</p>
      {children}
    </div>
  );
}

export default function Protocolos() {
  const [protocolos, setProtocolos] = useState<Protocolo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [perfil, setPerfil] = useState("");

  const [painelAberto, setPainelAberto] = useState(false);
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [erroChat, setErroChat] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [enviando, setEnviando] = useState(false);

  // ponto 9
  const [reabrindo, setReabrindo] = useState(false);
  const [confirmarCancelamento, setConfirmarCancelamento] = useState<number | null>(null);
const [confirmarReabertura, setConfirmarReabertura] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = getPerfil();
    setPerfil(p);
    carregarProtocolos(p);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [solicitacao?.historico]);

  async function carregarProtocolos(p?: string) {
    setErro(false);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { window.location.href = "/login"; return; }

      const perfilAtual = p ?? perfil;
      const url = perfilAtual === "CIDADAO"
        ? "https://protoserv-backend.up.railway.app/solicitacoes/minhas"
        : "https://protoserv-backend.up.railway.app/solicitacoes";

      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setProtocolos(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      setErro(true);
    } finally {
      setLoading(false);
    }
  }

  async function assumirSolicitacao(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      await fetch(`https://protoserv-backend.up.railway.app/solicitacoes/${id}/assumir`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      carregarProtocolos();
    } catch {
      toast.error("Erro ao assumir solicitação.");
    }
  }

async function cancelarSolicitacao(id: number) {
  try {
    const token = localStorage.getItem("token");

    await fetch(`https://protoserv-backend.up.railway.app/solicitacoes/${id}/cancelar`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Solicitação cancelada com sucesso!");

    setConfirmarCancelamento(null);

    carregarProtocolos();

    if (solicitacao?.id === id) {
      fecharPainel();
    }
  } catch {
    toast.error("Erro ao cancelar solicitação.");
  }
}

async function reabrirSolicitacao() {
  if (!solicitacao) return;

  setReabrindo(true);

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `https://protoserv-backend.up.railway.app/solicitacoes/${solicitacao.id}/reabrir`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error();
    }

    toast.success("Solicitação reaberta com sucesso!");

    setConfirmarReabertura(false);

    await recarregarChat();
    carregarProtocolos();
  } catch {
    toast.error("Erro ao reabrir solicitação.");
  } finally {
    setReabrindo(false);
  }
}

  async function abrirPainel(id: number) {
    setPainelAberto(true);
    setErroChat(false);
    setLoadingChat(true);
    setMensagem("");
    setNovoStatus("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://protoserv-backend.up.railway.app/solicitacoes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setSolicitacao(await res.json());
    } catch {
      setErroChat(true);
    } finally {
      setLoadingChat(false);
    }
  }

  function fecharPainel() {
    setPainelAberto(false);
    setSolicitacao(null);
  }

  async function recarregarChat() {
    if (!solicitacao) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://protoserv-backend.up.railway.app/solicitacoes/${solicitacao.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setSolicitacao(await res.json());
    } catch {}
  }

  async function enviarMensagem() {
    if (!mensagem.trim() || !solicitacao) return;
    setEnviando(true);
    try {
      const token = localStorage.getItem("token");
      const body: Record<string, string> = { descricao: mensagem.trim(), anexoUrl: "" };
      if (novoStatus) body.novoStatus = novoStatus;
      const res = await fetch(
        `https://protoserv-backend.up.railway.app/solicitacoes/${solicitacao.id}/acompanhamentos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      setMensagem("");
      setNovoStatus("");
      await recarregarChat();
      carregarProtocolos();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao enviar mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  async function atualizarSomenteStatus() {
    if (!novoStatus || !solicitacao) return;
    setEnviando(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://protoserv-backend.up.railway.app/solicitacoes/${solicitacao.id}/acompanhamentos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            descricao: `Status alterado para: ${getStatusLabel(novoStatus)}`,
            novoStatus,
            anexoUrl: "",
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      setNovoStatus("");
      await recarregarChat();
      carregarProtocolos();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao atualizar status.");
    } finally {
      setEnviando(false);
    }
  }

  const isCidadao = perfil === "CIDADAO";
  const isAtendente = perfil === "ATENDENTE" || perfil === "ADMIN";

  function statusFinal(status: string) {
    return status === "CONCLUIDA" || status === "CANCELADA";
  }

  function podeAssumir(item: Protocolo) {
    return perfil !== "CIDADAO" && !item.atendenteNome && !statusFinal(item.status);
  }

  return (
    <main className="flex h-screen bg-gray-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex overflow-hidden bg-gray-100">

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white px-8 py-4 border-b border-gray-200 shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">
              {isCidadao ? "Meus Protocolos" : "Gestão de Protocolos"}
            </h1>
          </header>

          <div className="flex-1 p-8 overflow-auto">
            {loading ? (
              <p className="text-center text-gray-600 mt-10">Carregando protocolos...</p>
            ) : erro ? (
              <div className="bg-white p-10 rounded-xl shadow text-center">
                <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar protocolos</h2>
                <p className="text-gray-600 mb-4">Não foi possível se conectar ao servidor.</p>
                <button onClick={() => carregarProtocolos()} className="bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition">
                  Tentar novamente
                </button>
              </div>
            ) : protocolos.length === 0 ? (
              <div className="bg-white p-10 rounded-xl shadow text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Nenhum protocolo encontrado</h2>
                <p className="text-gray-600">
                  {isCidadao ? "Você ainda não realizou nenhuma solicitação." : "Não há solicitações cadastradas."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {protocolos.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => abrirPainel(item.id)}
                    className={`bg-white p-5 rounded-xl shadow flex justify-between items-center cursor-pointer transition hover:shadow-md hover:ring-2 hover:ring-blue-200 ${
                      solicitacao?.id === item.id ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div>
                      <h2 className="font-bold text-gray-900">{item.protocolo}</h2>
                      <p className="text-gray-700">{item.servicoNome}</p>

                      {!isCidadao && item.cidadaoNome && (
                        <p className="text-sm">
                          <span className="text-gray-600 font-semibold">Solicitante:</span>{" "}
                          <span className="text-gray-900 font-medium">{item.cidadaoNome}</span>
                        </p>
                      )}

                      {!isCidadao && (
                        <p className="text-sm">
                          <span className="text-gray-600 font-semibold">Atendente:</span>{" "}
                          <span className={item.atendenteNome ? "text-gray-900 font-medium" : "text-gray-600 italic"}>
                            {item.atendenteNome ?? "Não atribuído"}
                          </span>
                        </p>
                      )}

                      <p className="text-sm text-gray-700 font-medium">
                        📅 {new Date(item.dataAbertura).toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>

                      {podeAssumir(item) && (
                        <button
                          onClick={(e) => assumirSolicitacao(e, item.id)}
                          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-1 rounded-lg text-sm"
                        >
                          Assumir
                        </button>
                      )}

                      {isCidadao && !statusFinal(item.status) && (
<button
  onClick={(e) => {
    e.stopPropagation();
    setConfirmarCancelamento(item.id);
  }}
  className="bg-red-700 hover:bg-red-800 text-white px-4 py-1 rounded-lg text-sm"
>
  Cancelar
</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── PAINEL LATERAL ── */}
        {painelAberto && (
          <aside className="relative z-20 w-[420px] shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-200 flex items-start justify-between shrink-0">
              <div className="flex-1 min-w-0 pr-3">
                {solicitacao ? (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-gray-900 text-sm">{solicitacao.protocolo}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusStyle(solicitacao.status)}`}>
                        {getStatusLabel(solicitacao.status)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getPrioridadeStyle(solicitacao.prioridade)}`}>
                        {getPrioridadeLabel(solicitacao.prioridade)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{solicitacao.servicoNome}</p>
                  </>
                ) : (
                  <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
                )}
              </div>
              <button onClick={fecharPainel} className="text-gray-400 hover:text-gray-700 text-lg leading-none shrink-0">✕</button>
            </div>

            {solicitacao && (
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex flex-col gap-2 shrink-0">
                <div className="flex gap-6 flex-wrap">
                  <Section titulo="Serviço">
                    <p className="text-gray-800 text-xs font-medium">{solicitacao.servicoNome}</p>
                  </Section>
                  <Section titulo="Solicitante">
                    <p className="text-gray-800 text-xs font-medium">{solicitacao.cidadaoNome}</p>
                  </Section>
                  {solicitacao.atendenteNome && (
                    <Section titulo="Atendente">
                      <p className="text-gray-800 text-xs font-medium">{solicitacao.atendenteNome}</p>
                    </Section>
                  )}
                </div>
                <Section titulo="Descrição">
                  <p className="text-gray-700 text-xs leading-relaxed">{solicitacao.descricao}</p>
                </Section>
                <Section titulo="Endereço">
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {solicitacao.logradouro}, {solicitacao.numero}
                    {solicitacao.complemento && ` — ${solicitacao.complemento}`} · {solicitacao.bairro} — {solicitacao.cidade}/{solicitacao.estado} · CEP {solicitacao.cep}
                  </p>
                </Section>
              </div>
            )}

            {/* Chat */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loadingChat ? (
                <p className="text-center text-gray-400 mt-10 text-sm">Carregando conversa...</p>
              ) : erroChat ? (
                <div className="text-center mt-10">
                  <p className="text-red-600 text-sm font-semibold">Erro ao carregar</p>
                  <button onClick={recarregarChat} className="mt-2 text-sm text-blue-700 underline">Tentar novamente</button>
                </div>
              ) : solicitacao?.historico.length === 0 ? (
                <div className="text-center mt-10 text-gray-400">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-sm font-medium">Nenhuma mensagem ainda.</p>
                  <p className="text-xs mt-1">
                    {isCidadao ? "Envie uma mensagem para o atendente." : "Inicie a conversa com o cidadão."}
                  </p>
                </div>
              ) : (
                solicitacao?.historico.map((msg, i) => (
                  <MensagemBubble key={i} msg={msg} perfil={perfil} />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── FOOTER DO PAINEL: aberto ── */}
            {!loadingChat && !erroChat && solicitacao && !isStatusFinal(solicitacao.status) && (
              <div className="border-t border-gray-200 px-5 py-4 shrink-0">
                {isAtendente && (
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Alterar status <span className="text-gray-400 font-normal">(sem precisar enviar mensagem)</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={novoStatus}
                        onChange={(e) => setNovoStatus(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      >
                        <option value="">Selecione o novo status...</option>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={atualizarSomenteStatus}
                        disabled={!novoStatus || enviando}
                        className="bg-gray-800 hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-semibold transition shrink-0"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 items-end">
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarMensagem(); }
                    }}
                    rows={2}
                    placeholder={isCidadao ? "Escreva uma mensagem para o atendente..." : "Escreva uma mensagem para o cidadão..."}
                    className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  <button
                    onClick={enviarMensagem}
                    disabled={enviando || !mensagem.trim()}
                    className="bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0"
                  >
                    {enviando ? "..." : "Enviar"}
                  </button>
                </div>

                {isCidadao && (
                  <div className="mt-3 flex justify-end">
<button
  onClick={() => {
    setConfirmarCancelamento(solicitacao.id);
  }}
  className="text-red-600 hover:text-red-800 text-xs font-medium underline transition"
>
  Cancelar solicitação
</button>
                  </div>
                )}
                
              </div>
            )}

            {/* ── FOOTER DO PAINEL: status final ── */}
            {!loadingChat && !erroChat && solicitacao && isStatusFinal(solicitacao.status) && (
              <div className="border-t border-gray-200 px-5 py-4 shrink-0 bg-gray-50 flex flex-col gap-3">
                <p className="text-center text-xs text-gray-400">
                  Solicitação <strong>{getStatusLabel(solicitacao.status).toLowerCase()}</strong>.
                </p>


                {/* Atendente/admin também pode reabrir se quiser — adapte conforme regra de negócio */}
{solicitacao.status === "CANCELADA" && isCidadao && (
  <button
    onClick={() => setConfirmarReabertura(true)}
    disabled={reabrindo}
    className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white py-2 rounded-xl text-sm font-semibold transition"
  >
    {reabrindo ? "Reabrindo..." : "🔄 Reabrir solicitação"}
  </button>
)}

              </div>
            )}
          </aside>
        )}
      </div>

      {confirmarReabertura && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[400px]">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Reabrir Solicitação
            </h2>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja reabrir esta solicitação?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmarReabertura(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Voltar
              </button>

              <button
                onClick={reabrirSolicitacao}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
              >
                Sim, reabrir
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmarCancelamento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[400px]">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Cancelar Solicitação
            </h2>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja cancelar esta solicitação?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmarCancelamento(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Voltar
              </button>

              <button
                onClick={() => cancelarSolicitacao(confirmarCancelamento)}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
              >
                Sim, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}