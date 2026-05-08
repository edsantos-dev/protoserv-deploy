"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
{ href: "/", label: "Home", icon: "📊" },
  { href: "/servicos", label: "Serviços", icon: "⚙️", badge: "" },
  { href: "/protocolos", label: "Protocolos", icon: "📋" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

export default function Sidebar() {
  const USER_LOGIN = "José da Silva";
  const USER_ROLE = "Administrador";
  const pathname = usePathname();

  return (
    <aside
      className="relative w-64 flex flex-col p-7 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #13131f 0%, #0d0d1a 100%)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        minHeight: "100vh",
      }}
    >
      {/* Glow top-right */}
      <div
        className="pointer-events-none absolute -top-20 -right-16 w-56 h-56 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Glow bottom-left */}
      <div
        className="pointer-events-none absolute -bottom-16 -left-10 w-44 h-44 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)",
        }}
      />

      {/* Título */}
      <div className="flex items-center gap-3 mb-8">
        <span className="font-bold text-lg text-white tracking-tight font-[Syne,sans-serif]">
          Proto<span className="text-indigo-400">Serv</span>
        </span>
      </div>

      {/* Divider */}
      <div
        className="h-px mb-6"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {/* Nav */}
      <p className="text-[10px] font-medium tracking-[1.5px] uppercase text-white/25 px-2 mb-2">
        Menu
      </p>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon, badge }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="relative flex items-center gap-3 px-3 py-[11px] rounded-xl text-sm transition-all duration-200"
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(56,189,248,0.1))",
                      color: "#fff",
                      fontWeight: 500,
                      border: "1px solid rgba(99,102,241,0.25)",
                      boxShadow: "0 4px 20px rgba(99,102,241,0.15)",
                    }
                  : { color: "rgba(255,255,255,0.45)" }
              }
            >
              {/* Active bar */}
              {isActive && (
                <span
                  className="absolute -left-5 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-sm"
                  style={{
                    background:
                      "linear-gradient(180deg, #6366f1, #38bdf8)",
                  }}
                />
              )}

              <span className="w-5 text-center text-base">{icon}</span>
              {label}

              {badge && (
                <span
                  className="ml-auto text-[10px] font-semibold px-2 py-[2px] rounded-full"
                  style={{
                    background: "rgba(99,102,241,0.25)",
                    color: "#a5b4fc",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="mt-auto pt-5"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* User card (sem avatar) */}
        <div
          className="flex items-center gap-3 p-[10px] rounded-2xl mb-3 cursor-pointer transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              {USER_LOGIN}
            </p>
            <p className="text-[11px] text-white/30">
              {USER_ROLE}
            </p>
          </div>

          <div
            className="ml-auto w-[7px] h-[7px] rounded-full flex-shrink-0"
            style={{
              background: "#34d399",
              boxShadow: "0 0 6px #34d399",
            }}
          />
        </div>

        {/* Logout */}
        <button
          className="w-full flex items-center justify-center gap-2 py-[10px] rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "rgba(239,68,68,0.8)",
          }}
        >
          <span>⎋</span> Sair da conta
        </button>
      </div>
    </aside>
  );
}