"use client";

import { apiFetch } from "@/lib/api";
import type { Task } from "@/types";
import StatusBadge from "./StatusBadge";

interface Props {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onRefresh: () => void;
}

export default function TaskTable({ tasks, onEdit, onRefresh }: Props) {
  async function handleDelete(taskId: string) {
    if (!confirm("Delete this task?")) return;

    try {
      await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (tasks.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-10 text-center">
        No tasks yet. Create one to get started.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Assignee</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 text-gray-900">{task.title}</td>
              <td className="px-4 py-3 text-gray-500">{task.assignee?.name || "Unassigned"}</td>
              <td className="px-4 py-3">
                <StatusBadge status={task.status} />
              </td>
              <td className="px-4 py-3 text-right space-x-3">
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
