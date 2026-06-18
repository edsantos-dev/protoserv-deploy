"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Usuario = {
  nome: string;
  perfil: string;
};

const NAV_CIDADAO = [
  { href: "/", label: "Início", icon: "📊" },
  { href: "/servicos", label: "Solicitar Serviço", icon: "⚙️" },
  { href: "/protocolos", label: "Meus Protocolos", icon: "📋" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

const NAV_ATENDENTE = [
  { href: "/", label: "Início", icon: "📊" },
  { href: "/protocolos", label: "Protocolos", icon: "📋" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

const NAV_ADMIN = [
  { href: "/", label: "Início", icon: "📊" },
  { href: "/protocolos", label: "Protocolos", icon: "📋" },
  { href: "/admin/servicos", label: "Serviços", icon: "⚙️" },
  { href: "/admin/usuarios", label: "Usuários", icon: "👥" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

function getNavItems(perfil: string) {
  if (perfil === "ADMIN") return NAV_ADMIN;
  if (perfil === "ATENDENTE") return NAV_ATENDENTE;
  return NAV_CIDADAO;
}

const perfilLabel: Record<string, string> = {
  CIDADAO: "Cidadão",
  ATENDENTE: "Atendente",
  ADMIN: "Administrador",
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario>({ nome: "Offline", perfil: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    async function carregarUsuario() {
      try {
        const response = await fetch("http://protoserv-backend.up.railway.app/usuarios/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) router.push("/login");
          return;
        }
        const data = await response.json();
        setUsuario({ nome: data.nome, perfil: data.perfil ?? "" });
      } catch {
        setUsuario({ nome: "Offline", perfil: "" });
      } finally {
        setLoading(false);
      }
    }

    carregarUsuario();
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const navItems = getNavItems(usuario.perfil);

  return (
    <aside
      className="w-64 flex flex-col p-7 h-screen sticky top-0 shrink-0"
      style={{
        background: "linear-gradient(160deg, #13131f 0%, #0d0d1a 100%)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p className="text-[10px] font-medium tracking-[1.5px] uppercase text-white/25 mb-2">
        Menu
      </p>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-[11px] rounded-xl text-sm transition"
              style={{
                color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                background: isActive ? "rgba(99,102,241,0.2)" : "transparent",
              }}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé: nome do usuário + botão sair lado a lado */}
      <div className="mt-auto pt-5 border-t border-white/10">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {loading ? "?" : usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">
              {loading ? "Carregando..." : usuario.nome}
            </p>
            <p className="text-white/40 text-xs truncate">
              {loading ? "" : perfilLabel[usuario.perfil] ?? usuario.perfil}
            </p>
          </div>
          <button
            onClick={logout}
            title="Sair da conta"
            className="shrink-0 px-2 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
          >
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}