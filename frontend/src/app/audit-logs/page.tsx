"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AuditLogTable from "@/components/AuditLogTable";
import Sidebar from "@/components/Sidebar";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AuditLog, PaginatedResponse } from "@/types";

export default function AuditLogsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async (p: number) => {
    try {
      const res = await apiFetch<PaginatedResponse<AuditLog>>(`/audit-logs?page=${p}&limit=20`);
      setLogs(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }
    fetchLogs(page);
  }, [user, loading, router, page, fetchLogs]);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Audit Logs</h1>

        <AuditLogTable logs={logs} />

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
