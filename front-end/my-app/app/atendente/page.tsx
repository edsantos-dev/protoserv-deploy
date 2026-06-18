"use client";

import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Solicitacao = {
  id: number;
  protocolo: string;
  servicoNome: string;
  cidadaoNome: string;
  status: string;
  prioridade: string;
  atendenteNome: string | null;
  dataAbertura: string;
};

function getStatusStyle(status: string) {
  switch (status) {
    case "NOVO":
      return "bg-red-100 text-red-700";
    case "EM_ANDAMENTO":
      return "bg-yellow-100 text-yellow-700";
    case "CONCLUIDA":
      return "bg-green-100 text-green-700";
    case "CANCELADA":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    NOVO: "Novo",
    EM_ANDAMENTO: "Em andamento",
    CONCLUIDA: "Concluída",
    CANCELADA: "Cancelada",
  };
  return labels[status] ?? status;
}

export default function ProtocolosAtendente() {
  const [protocolos, setProtocolos] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  async function carregarSolicitacoes() {
    setErro(false);
    setLoading(true);

    try {
      const response = await fetch("https://protoserv-backend.up.railway.app/solicitacoes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar solicitações");
      }

      const data = await response.json();

      setProtocolos(
        Array.isArray(data)
          ? data
          : data.content ?? []
      );
    } catch (error) {
      console.error(error);
      setErro(true);
      toast.error("Erro ao carregar solicitações.");
    } finally {
      setLoading(false);
    }
  }

  async function assumirSolicitacao(id: number) {
    try {
      const response = await fetch(
        `https://protoserv-backend.up.railway.app/solicitacoes/${id}/assumir`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao assumir solicitação");
      }

      toast.success("Solicitação assumida com sucesso!");

      carregarSolicitacoes();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao assumir solicitação.");
    }
  }

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  return (
    <main className="flex h-screen bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-gray-100">
        <header className="bg-white px-8 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestão de Protocolos
          </h1>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-gray-500">Total</h2>
              <p className="text-3xl font-bold text-blue-600">
                {protocolos.length}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-gray-500">Novos</h2>
              <p className="text-3xl font-bold text-red-600">
                {
                  protocolos.filter(
                    (p) => p.status === "NOVO"
                  ).length
                }
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-gray-500">Em andamento</h2>
              <p className="text-3xl font-bold text-yellow-600">
                {
                  protocolos.filter(
                    (p) => p.status === "EM_ANDAMENTO"
                  ).length
                }
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-gray-500">Concluídas</h2>
              <p className="text-3xl font-bold text-green-600">
                {
                  protocolos.filter(
                    (p) => p.status === "CONCLUIDA"
                  ).length
                }
              </p>
            </div>
          </div>

          {loading ? (
            <div className="bg-white p-10 rounded-xl text-center text-gray-500">
              Carregando solicitações...
            </div>
          ) : erro ? (
            <div className="bg-white p-10 rounded-xl text-center">
              <p className="text-red-600 font-semibold mb-3">
                Erro ao carregar solicitações.
              </p>

              <button
                onClick={carregarSolicitacoes}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                Tentar novamente
              </button>
            </div>
          ) : protocolos.length === 0 ? (
            <div className="bg-white p-10 rounded-xl text-center text-gray-500">
              Nenhuma solicitação encontrada.
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {protocolos.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-bold text-lg">
                        {item.protocolo}
                      </h2>

                      <p className="text-gray-600">
                        {item.servicoNome}
                      </p>

                      <p className="text-sm text-gray-400">
                        {new Date(
                          item.dataAbertura
                        ).toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="font-semibold">
                      Solicitante
                    </p>

                    <p className="text-gray-700">
                      {item.cidadaoNome}
                    </p>
                  </div>

                  <div className="mb-5">
                    <p className="font-semibold">
                      Atendente
                    </p>

                    <p className="text-gray-700">
                      {item.atendenteNome ||
                        "Não atribuído"}
                    </p>
                  </div>

                  {!item.atendenteNome && (
                    <button
                      onClick={() =>
                        assumirSolicitacao(item.id)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
                    >
                      Assumir Solicitação
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </main>
  );
}