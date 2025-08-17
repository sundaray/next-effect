"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, MotionConfig, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { navbarLinks } from "@/config/navbar";
import { useUser } from "@/hooks/use-user";
import { UserAccountNavClient } from "@/components/user-account-nav-client";
import { Icons } from "@/components/icons";

// ============================================================================
// MobileNav
// ============================================================================

type MobileNavProps = {
  menuIconSize?: number;
  iconLineColor?: string;
  iconLineHeight?: number;
  iconLineRounded?: boolean;
};

export function MobileNav({
  menuIconSize = 24,
  iconLineColor = "bg-gray-600",
  iconLineHeight = 1.5,
  iconLineRounded = true,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Effect to handle closing the menu with the 'Escape' key
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
      <MenuIcon
        isOpen={isOpen}
        onToggle={toggleMenu}
        size={menuIconSize}
        lineColor={iconLineColor}
        lineHeight={iconLineHeight}
        lineRounded={iconLineRounded}
      />
      <AnimatePresence>
        {isOpen && (
          <>
            <Backdrop onToggle={toggleMenu} />
            <MenuDrawer onLinkClick={() => setIsOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MenuIcon
// ============================================================================

type MenuIconProps = {
  isOpen: boolean;
  onToggle: () => void;
  size: number;
  lineColor: string;
  lineHeight: number;
  lineRounded: boolean;
};

function MenuIcon({
  isOpen,
  onToggle,
  size,
  lineColor,
  lineHeight,
  lineRounded,
}: MenuIconProps) {
  const duration = 0.3;
  const lineWidth = size * 0.7;
  const lineSpacing = size * 0.17;

  const topVariants = {
    closed: { y: -lineSpacing, rotate: 0 },
    open: { y: [-lineSpacing, 0, 0], rotate: [0, 0, 45] },
  };
  const centerVariants = {
    closed: { opacity: 1, transition: { duration: duration * 0.5 } },
    open: { opacity: [1, 1, 0] },
  };
  const bottomVariants = {
    closed: { y: lineSpacing, rotate: 0 },
    open: { y: [lineSpacing, 0, 0], rotate: [0, 0, -45] },
  };

  return (
    <MotionConfig
      transition={{ duration, ease: "easeOut", times: [0, 0.5, 1] }}
    >
      <motion.button
        onClick={onToggle}
        className="relative flex items-center justify-center z-50 hover:bg-gray-100 rounded-full p-4"
        style={{ width: size, height: size }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
      >
        <motion.div
          className={cn(
            "absolute origin-center",
            {
              "rounded-full": lineRounded,
            },
            lineColor
          )}
          style={{
            width: lineWidth,
            height: lineHeight,
            backgroundColor: lineColor,
          }}
          variants={topVariants}
        />
        <motion.div
          className={cn(
            "absolute origin-center",
            {
              "rounded-full": lineRounded,
            },
            lineColor
          )}
          style={{
            width: lineWidth,
            height: lineHeight,
            backgroundColor: lineColor,
          }}
          variants={centerVariants}
        />
        <motion.div
          className={cn(
            "absolute origin-center",
            {
              "rounded-full": lineRounded,
            },
            lineColor
          )}
          style={{
            width: lineWidth,
            height: lineHeight,
            backgroundColor: lineColor,
          }}
          variants={bottomVariants}
        />
      </motion.button>
    </MotionConfig>
  );
}

// ============================================================================
// Backdrop
// ============================================================================

interface BackdropProps {
  onToggle: () => void;
}

function Backdrop({ onToggle }: BackdropProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onToggle}
      className="fixed inset-x-0 top-20 bottom-0 z-30 bg-gray-950/20 backdrop-blur-xs"
      aria-hidden="true"
    />
  );
}

// ============================================================================
// MenuDrawer
// ============================================================================

interface MenuDrawerProps {
  onLinkClick: () => void;
}

function MenuDrawer({ onLinkClick }: MenuDrawerProps) {
  const { user, loading } = useUser();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute inset-x-4 top-24 z-40 origin-top rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5 h-fit"
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

      <hr className="my-4 border-gray-200" />

      <div className="flex flex-col items-center">
        {loading ? (
          <div className="flex justify-center py-2">
            <Icons.loader className="size-4 animate-spin text-gray-600" />
          </div>
        ) : user ? (
          <UserAccountNavClient user={user} />
        ) : (
          <Link
            href="/signin"
            onClick={onLinkClick}
            className="flex w-full items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900/90"
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

type MobileNavLinkProps = {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
};

function MobileNavLink({ href, onClick, children }: MobileNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block rounded-md px-4 py-2 text-base font-medium transition-colors",
        isActive
          ? "text-gray-900 font-semibold"
          : "text-gray-600 hover:text-gray-900"
      )}
    >
      {children}
    </Link>
  );
}
