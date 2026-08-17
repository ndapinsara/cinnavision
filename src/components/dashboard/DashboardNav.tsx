"use client";

import Link from "next/link";
import { UserButton, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  Sprout,
  ClipboardPenLine,
  LayoutDashboard,
  Microscope,
  TrendingUp,
  Package,
  Search,
} from "lucide-react";
import type { ReactNode } from "react";

interface DashboardNavProps {
  role: "farmer" | "buyer";
  userName?: string;
  onCloseMobile?: () => void;
  isMobileMenuOpen?: boolean;
}

type NavLink = {
  href: string;
  label: string;
  icon: ReactNode;
  divider?: boolean;
};

export default function DashboardNav({
  role,
  userName,
  onCloseMobile,
  isMobileMenuOpen,
}: DashboardNavProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();

  const farmerLinks: NavLink[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "AI Disease Detection",
      href: "/dashboard/disease-detect",
      icon: <Microscope className="h-5 w-5" />,
    },
    {
      label: "Live Market Prices",
      href: "/dashboard/market-prices",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      label: "My Harvest Listings",
      href: "/dashboard/my-listings",
      icon: <Package className="h-5 w-5" />,
    },
  ];

  const buyerLinks: NavLink[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/dashboard/daily-prices",
      label: "Daily Price Board",
      icon: <ClipboardPenLine className="h-5 w-5" />,
    },
    {
      href: "/dashboard/farmer-listings",
      label: "Farmer Listings",
      icon: <Search className="h-5 w-5" />,
    },
  ];

  const links =
    role === "farmer" ? farmerLinks : role === "buyer" ? buyerLinks : [];

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-xl lg:shadow-none">
      {/* Logo/Header */}
      <div className="flex items-center justify-between h-18 px-4 border-b border-gray-200">
        <div className="flex gap-3">
          <div className="flex flex-col overflow-hidden">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-1.5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sprout className="size-5" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                CinnaVision
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Close Button */}
        {isMobileMenuOpen && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-3 px-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main Menu
          </span>
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <div key={link.href}>
              {link.divider && (
                <div className="border-t border-gray-100 my-2" />
              )}
              <Link
                href={link.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className="shrink-0">{link.icon}</span>
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-3">
        <div className="rounded-2xl bg-cream p-3.5">
          <p className="pb-3 text-xs text-muted-foreground">Signed in as</p>
          <div className="flex items-center gap-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">
                {userName || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {role === "farmer" ? "Farmer" : role === "buyer" ? "Buyer" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium text-sm cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}
