"use client";

import { apiFetch } from "@/lib/api";
import type { Task } from "@/types";
import StatusBadge from "./StatusBadge";

interface Props {
  tasks: Task[];
  onRefresh: () => void;
}

export default function UserTaskList({ tasks, onRefresh }: Props) {
  async function handleStatusChange(taskId: string, newStatus: string) {
    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  if (tasks.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-10 text-center">
        No tasks assigned to you yet.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Title
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Description
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-gray-100 last:border-0"
            >
              <td className="px-4 py-3 text-gray-900">{task.title}</td>
              <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                {task.description}
              </td>
              <td className="px-4 py-3">
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(task.id, e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
