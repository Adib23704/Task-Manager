import type { AuditLog } from "@/types";

interface Props {
  logs: AuditLog[];
}

const actionLabels: Record<string, string> = {
  TASK_CREATED: "Task Created",
  TASK_UPDATED: "Task Updated",
  TASK_DELETED: "Task Deleted",
  STATUS_CHANGED: "Status Changed",
  TASK_ASSIGNED: "Task Assigned",
};

function describeAction(action: string, details: Record<string, any>): string {
  switch (action) {
    case "TASK_CREATED":
      return `Created "${details.title}"`;
    case "TASK_DELETED":
      return `Deleted "${details.title}"`;
    case "STATUS_CHANGED":
      return `${details.from} → ${details.to}`;
    case "TASK_ASSIGNED":
      return "Reassigned task";
    case "TASK_UPDATED":
      return `Updated "${details.after?.title || "task"}"`;
    default:
      return JSON.stringify(details);
  }
}

export default function AuditLogTable({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-10 text-center">
        No audit logs recorded yet.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Timestamp
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              User
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Action
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="border-b border-gray-100 last:border-0"
            >
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-gray-900">{log.actor.name}</td>
              <td className="px-4 py-3 text-gray-700">
                {actionLabels[log.action] || log.action}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {describeAction(log.action, log.details)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
