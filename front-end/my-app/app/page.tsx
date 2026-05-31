"use client";

import Bot from "@/components/bot";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [suporte, setSuporte] = useState(false);
  const [servicos, setServicos] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:8080/servicos", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Erro ao buscar serviços");
          return;
        }

        const data = await response.json();
        setServicos(data.content || data); // suporta Page ou lista simples

        console.log("SERVIÇOS:", data);
      } catch (error) {
        console.error("Erro na requisição:", error);
      }
    };

    fetchServicos();
  }, []);

  return (
    <main className="flex h-screen bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-gray-100">
        <header className="bg-white px-8 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            Painel de Serviços
          </h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-5xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              O que você deseja fazer?
            </h2>

            <p className="text-gray-600 mb-8">
              Escolha uma das opções abaixo para continuar
            </p>

            <div className="grid grid-cols-3 gap-6">
              <div
                onClick={() => router.push("/servicos")}
                className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:scale-105 transition cursor-pointer"
              >
                <h3 className="text-lg font-bold mb-2">
                  Solicitar Serviço
                </h3>
                <p className="text-sm opacity-90">
                  Escolher e registrar uma solicitação
                </p>
              </div>

              <div
                onClick={() => router.push("/protocolos")}
                className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:scale-105 transition cursor-pointer"
              >
                <h3 className="text-lg font-bold mb-2">Acompanhar</h3>
                <p className="text-sm opacity-90">
                  Ver andamento do seu protocolo
                </p>
              </div>

              <div
                onClick={() => setSuporte(!suporte)}
                className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:scale-105 transition cursor-pointer"
              >
                <h3 className="text-lg font-bold mb-2">Suporte</h3>
                <p className="text-gray-200 text-sm">
                  Solicitar ajuda ou atendimento
                </p>
              </div>
            </div>

            {/* DEBUG DOS SERVIÇOS */}
            <div className="mt-10">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Serviços carregados:
              </h2>

              <div className="bg-white p-4 rounded-lg shadow">
                {servicos.length === 0 ? (
                  <p className="text-gray-500">Nenhum serviço encontrado</p>
                ) : (
                  servicos.map((s: any) => (
                    <div key={s.id} className="border-b py-2">
                      <p className="font-semibold">{s.nome}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {suporte && (
              <div className="mt-8">
                <Bot />
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}