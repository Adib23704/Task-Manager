"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import UserModal from "@/components/UserModal";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { User } from "@/types";

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiFetch<User[]>("/users");
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }
    fetchUsers();
  }, [user, loading, router, fetchUsers]);

  async function handleDelete(targetUser: User) {
    if (targetUser.id === user?.id) {
      alert("You can't delete yourself");
      return;
    }
    if (!confirm(`Delete user "${targetUser.name}"?`)) return;

    try {
      await apiFetch(`/users/${targetUser.id}`, { method: "DELETE" });
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <button
            type="button"
            onClick={() => {
              setEditingUser(null);
              setModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Create User
          </button>
        </div>

        {users.length === 0 ? (
          <p className="text-gray-500 text-sm py-10 text-center">No users found.</p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${
                          u.role === "ADMIN"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(u);
                          setModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u)}
                        disabled={u.id === user.id}
                        className="text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modalOpen && (
          <UserModal user={editingUser} onClose={() => setModalOpen(false)} onSaved={fetchUsers} />
        )}
      </main>
    </div>
  );
}
