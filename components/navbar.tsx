"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { name: "Compression", path: "/" },
    { name: "Redimensionnement", path: "/resize" },
    { name: "Renommage", path: "/rename" },
  ];

  // Gestion du défilement pour l'effet de fond
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer le menu mobile quand on clique sur un lien
  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-black backdrop-blur transition-all duration-300",
        isScrolled && "bg-black/90 shadow-md"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <img
            src="logo-portfolio-bakou.PNG"
            alt="Logo"
            width={130}
            height={130}
            className="h-10 w-auto"
          />
        </div>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[#ffef10c0] py-2",
                pathname === item.path
                  ? "text-[#FFEE10]"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 py-2 space-y-1.5 rounded"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={cn(
              "block w-6 h-0.5 bg-gray-300 transition-transform duration-300",
              isMenuOpen && "transform rotate-45 translate-y-2"
            )}
          />
          <span
            className={cn(
              "block w-6 h-0.5 bg-gray-300 transition-opacity duration-300",
              isMenuOpen && "opacity-0"
            )}
          />
          <span
            className={cn(
              "block w-6 h-0.5 bg-gray-300 transition-transform duration-300",
              isMenuOpen && "transform -rotate-45 -translate-y-2"
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          "md:hidden bg-black/95 backdrop-blur-lg overflow-hidden transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="container py-4 flex flex-col space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "text-base font-medium transition-colors hover:text-[#ffef10c0] py-2 px-4 rounded-lg",
                pathname === item.path
                  ? "text-[#FFEE10] bg-gray-800"
                  : "text-muted-foreground"
              )}
              onClick={handleNavClick}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
