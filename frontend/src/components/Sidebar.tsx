"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", adminOnly: false },
  { href: "/users", label: "Users", adminOnly: true },
  { href: "/audit-logs", label: "Audit Logs", adminOnly: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const visibleLinks = navLinks.filter((link) => !link.adminOnly || user.role === "ADMIN");

  return (
    <aside className="w-56 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="px-4 py-5 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">
          {user.role === "ADMIN" ? "Admin" : "User"} Panel
        </h2>
      </div>

      <nav className="flex-1 py-3 px-2">
        {visibleLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-sm mb-0.5 ${
                active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2 truncate">{user.email}</p>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-700 cursor-pointer"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
