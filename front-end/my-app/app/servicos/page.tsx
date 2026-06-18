"use client";

import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";

type Servico = {
  id: number;
  nome: string;
  descricao: string;
};

const iconesPorNome: Record<string, string> = {
  "Iluminação Pública": "💡",
  "Coleta de Lixo": "🗑️",
  "Infraestrutura": "🚧",
  "Limpeza Urbana": "🧹",
  "Vazamento de Água": "💧",
  "Outros": "📌",
};

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarServicos();
  }, []);

  async function carregarServicos() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://protoserv-backend.up.railway.app/servicos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao buscar serviços");

      const data = await res.json();
      const lista = Array.isArray(data) ? data : data.content ?? [];
      setServicos(lista);
    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
      // fallback com serviços fixos se o backend falhar
      setServicos([
        { id: 1, nome: "Iluminação Pública", descricao: "Postes ou lâmpadas apagadas" },
        { id: 2, nome: "Coleta de Lixo", descricao: "Acúmulo ou falta de coleta" },
        { id: 3, nome: "Infraestrutura", descricao: "Buracos, ruas e calçadas" },
        { id: 4, nome: "Limpeza Urbana", descricao: "Entulhos e terrenos sujos" },
        { id: 5, nome: "Vazamento de Água", descricao: "Problemas na rede" },
        { id: 6, nome: "Outros", descricao: "Outras solicitações" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const servicosFiltrados = servicos.filter((s) =>
    s.nome.toLowerCase().includes(busca.toLowerCase())
  );

  async function abrirSolicitacao(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!servicoSelecionado) return;

    setEnviando(true);

    const token = localStorage.getItem("token");

    if (!token || token.split(".").length !== 3) {
      toast.error("Token inválido ou expirado");
      setEnviando(false);
      return;
    }

    const form = e.currentTarget;

    const descricao = (form.elements.namedItem("descricao") as HTMLTextAreaElement).value;
    const cep = (form.elements.namedItem("cep") as HTMLInputElement).value;
    const logradouro = (form.elements.namedItem("logradouro") as HTMLInputElement).value;
    const numero = (form.elements.namedItem("numero") as HTMLInputElement).value;
    const bairro = (form.elements.namedItem("bairro") as HTMLInputElement).value;
    const cidade = (form.elements.namedItem("cidade") as HTMLInputElement).value;
    const estado = (form.elements.namedItem("estado") as HTMLInputElement).value;

    if (!descricao || !cep || !logradouro || !numero || !bairro || !cidade || !estado) {
      toast.error("Preencha todos os campos obrigatórios");
      setEnviando(false);
      return;
    }

    const payload = {
      servicoId: servicoSelecionado.id,
      descricao,
      cep,
      logradouro,
      numero,
      bairro,
      cidade,
      estado,
      complemento: (form.elements.namedItem("complemento") as HTMLInputElement).value || "",
      anexoUrl: (form.elements.namedItem("anexoUrl") as HTMLInputElement).value || "",
    };

    try {
      const res = await fetch("https://protoserv-backend.up.railway.app/solicitacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        console.log("STATUS:", res.status);
        console.log("ERROR BODY:", text);
        toast.error(`Erro ao enviar solicitação (${res.status})`);
        setEnviando(false);
        return;
      }

      const data = JSON.parse(text);
      toast.success(`Solicitação criada! Protocolo: ${data.protocolo}`);

      setTimeout(() => {
        window.location.href = "/protocolos";
      }, 1500);

    } catch (err) {
      console.error(err);
      toast.error("Erro de conexão com servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex h-screen bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-gray-100">

        <header className="bg-white px-8 py-4 border-b">
          <h1 className="text-2xl font-bold">Solicitar Serviço</h1>
        </header>

        <div className="flex-1 p-8 overflow-auto">

          {!servicoSelecionado && (
            <>
              <h2 className="text-xl font-bold mb-2">Escolha um serviço</h2>

              <input
                className="w-full p-3 border rounded mb-6"
                placeholder="Buscar serviço..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />

              {loading ? (
                <p>Carregando...</p>
              ) : (
                <div className="grid grid-cols-3 gap-5">
                  {servicosFiltrados.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setServicoSelecionado(s)}
                      className="bg-white p-5 rounded-xl border cursor-pointer hover:border-blue-500"
                    >
                      <div className="text-2xl" suppressHydrationWarning>
                        {iconesPorNome[s.nome] ?? "📋"}
                      </div>
                      <h3 className="font-bold">{s.nome}</h3>
                      <p className="text-sm text-gray-600">{s.descricao}</p>
                    </div>
                  ))}
                </div>
              )}

              {!loading && servicosFiltrados.length === 0 && (
                <p className="mt-4 text-gray-500">Nenhum serviço encontrado</p>
              )}
            </>
          )}

          {servicoSelecionado && (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">

              <button
                onClick={() => setServicoSelecionado(null)}
                className="text-blue-600 mb-4"
              >
                ← Voltar
              </button>

              <h2 className="text-2xl font-bold mb-4">
                {iconesPorNome[servicoSelecionado.nome] ?? "📋"} {servicoSelecionado.nome}
              </h2>

              <form onSubmit={abrirSolicitacao} className="space-y-3">

                <textarea name="descricao" placeholder="Descrição" className="w-full border p-3 rounded" required />

                <input name="cep" placeholder="CEP" className="w-full border p-3 rounded" required />
                <input name="logradouro" placeholder="Logradouro" className="w-full border p-3 rounded" required />
                <input name="numero" placeholder="Número" className="w-full border p-3 rounded" required />
                <input name="bairro" placeholder="Bairro" className="w-full border p-3 rounded" required />
                <input name="cidade" placeholder="Cidade" className="w-full border p-3 rounded" required />
                <input name="estado" placeholder="Estado" className="w-full border p-3 rounded" required />

                <input name="complemento" placeholder="Complemento" className="w-full border p-3 rounded" />
                <input name="anexoUrl" placeholder="Link de anexo (opcional)" className="w-full border p-3 rounded" />

                <button
                  disabled={enviando}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {enviando ? "Enviando..." : "Abrir Solicitação"}
                </button>

              </form>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}