"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, MotionConfig, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { navbarLinks } from "@/config/navbar";
import { UserAccountNavClient } from "@/components/user-account-nav-client";
import type { User } from "@/lib/services/auth-service";

// ============================================================================
// MobileNav
// ============================================================================
export function MobileNav({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <MenuIcon isOpen={isOpen} onToggle={toggleMenu} />
      <AnimatePresence>
        {isOpen && (
          <>
            <Backdrop onToggle={toggleMenu} />
            <MenuDrawer user={user} onLinkClick={() => setIsOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MenuIcon
// ============================================================================
function MenuIcon({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <MotionConfig transition={{ duration: 0.15, ease: "easeOut" }}>
      <motion.button
        initial={false}
        animate={isOpen ? "open" : "closed"}
        onClick={onToggle}
        className="relative z-50 [@media(pointer:fine)]:p-0 p-4"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <div className="relative size-6">
          <motion.div
            variants={{
              closed: { y: "-50%", top: "25%", rotate: 0 },
              open: { y: "-50%", top: "50%", rotate: 45 },
            }}
            className="absolute h-[1.5px] w-full rounded-full bg-neutral-600"
          />
          <motion.div
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 },
            }}
            className="absolute top-1/2 h-[1.5px] w-full -translate-y-1/2 rounded-full bg-neutral-600"
          />
          <motion.div
            variants={{
              closed: { y: "50%", bottom: "25%", rotate: 0 },
              open: { y: "50%", bottom: "50%", rotate: -45 },
            }}
            className="absolute h-[1.5px] w-full rounded-full bg-neutral-600"
          />
        </div>
      </motion.button>
    </MotionConfig>
  );
}

// ============================================================================
// Backdrop
// ============================================================================
function Backdrop({ onToggle }: { onToggle: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onClick={onToggle}
      className="fixed inset-x-0 top-20 bottom-0 z-30 bg-black/20 backdrop-blur-sm"
      aria-hidden="true"
    />
  );
}

// ============================================================================
// MenuDrawer
// ============================================================================
function MenuDrawer({
  user,
  onLinkClick,
}: {
  user: User | null;
  onLinkClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: "-100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="fixed top-20 left-0 z-40 h-[calc(100vh-5rem)] min-w-72 max-w-md bg-neutral-50 p-6 shadow-xl"
    >
      <nav>
        <ul className="flex flex-col space-y-2">
          {navbarLinks.main.map((item) => (
            <li key={item.href}>
              <MobileNavLink href={item.href} onClick={onLinkClick}>
                {item.title}
              </MobileNavLink>
            </li>
          ))}
        </ul>
      </nav>

      <hr className="my-4 border-neutral-200" />

      <div className="flex flex-col items-center">
        {user ? (
          <UserAccountNavClient user={user} />
        ) : (
          <Link
            href="/signin"
            onClick={onLinkClick}
            className="flex w-full items-center justify-center rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-900/90"
          >
            Sign In
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// MobileNavLink
// ============================================================================
function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block rounded-md px-4 py-2 text-base font-medium transition-colors",
        isActive
          ? "text-neutral-900 font-semibold"
          : "text-neutral-700 hover:text-neutral-900"
      )}
    >
      {children}
    </Link>
  );
}
