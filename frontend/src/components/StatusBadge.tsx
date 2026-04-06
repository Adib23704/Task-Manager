const styles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  DONE: "bg-green-50 text-green-700 border-green-200",
};

const labels: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "In Progress",
  DONE: "Done",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${styles[status] || "bg-gray-50 text-gray-700 border-gray-200"}`}
    >
      {labels[status] || status}
    </span>
  );
}
