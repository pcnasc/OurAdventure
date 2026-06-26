"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Compass,
  Map,
  CheckSquare,
  Plane,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Início", icon: Compass },
  { href: "/trips", label: "Viagens", icon: Map },
  { href: "/checklists", label: "Checklists", icon: CheckSquare },
  { href: "/flights", label: "Voos", icon: Plane },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="mt-4 flex items-center justify-between rounded-2xl px-6 py-3"
          style={{
            background: "hsl(220 16% 8% / 0.85)",
            backdropFilter: "blur(20px) saturate(1.3)",
            WebkitBackdropFilter: "blur(20px) saturate(1.3)",
            border: "1px solid hsl(220 12% 18% / 0.6)",
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-accent group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 blur-md bg-accent/30 group-hover:bg-accent/50 transition-colors" />
            </div>
            <span className="font-serif text-lg font-bold tracking-tight text-text">
              Our<span className="text-accent">Adventure</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "hsl(32 60% 20% / 0.3)",
                        border: "1px solid hsl(32 50% 30% / 0.4)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <span
                    className={`relative z-10 flex items-center gap-2 ${
                      isActive ? "text-accent" : "text-text-muted hover:text-text"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Avatars */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="avatar-ring">
                <Image
                  src="/avatars/alice-v2.png"
                  alt="Alice"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
              <div className="avatar-ring">
                <Image
                  src="/avatars/pedro-v2.png"
                  alt="Pedro"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
        <div
          className="flex items-center justify-around rounded-2xl px-2 py-3"
          style={{
            background: "hsl(220 16% 8% / 0.92)",
            backdropFilter: "blur(20px) saturate(1.3)",
            WebkitBackdropFilter: "blur(20px) saturate(1.3)",
            border: "1px solid hsl(220 12% 18% / 0.6)",
          }}
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${
                  isActive ? "text-accent" : "text-text-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
