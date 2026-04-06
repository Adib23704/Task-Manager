"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TaskModal from "@/components/TaskModal";
import TaskTable from "@/components/TaskTable";
import UserTaskList from "@/components/UserTaskList";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Task, User } from "@/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await apiFetch<Task[]>("/tasks");
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  }, []);

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
    if (!user) {
      router.replace("/login");
      return;
    }

    fetchTasks();

    if (user.role === "ADMIN") {
      fetchUsers();
    }
  }, [user, loading, router, fetchTasks, fetchUsers]);

  if (loading || !user) return null;

  function openCreate() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            {isAdmin ? "Task Management" : "My Tasks"}
          </h1>
          {isAdmin && (
            <button
              type="button"
              onClick={openCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Create Task
            </button>
          )}
        </div>

        {isAdmin ? (
          <TaskTable tasks={tasks} onEdit={openEdit} onRefresh={fetchTasks} />
        ) : (
          <UserTaskList tasks={tasks} onRefresh={fetchTasks} />
        )}

        {modalOpen && (
          <TaskModal
            task={editingTask}
            users={users}
            onClose={() => setModalOpen(false)}
            onSaved={fetchTasks}
          />
        )}
      </main>
    </div>
  );
}
