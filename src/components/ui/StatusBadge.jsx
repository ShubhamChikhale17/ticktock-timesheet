const STATUS_STYLES = {
  COMPLETED: "bg-green-100 text-green-600",
  INCOMPLETE: "bg-orange-100 text-orange-500",
  MISSING: "bg-red-100 text-red-500",
};

export default function StatusBadge({ status }) {
  const classes = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold tracking-wide uppercase ${classes}`}>
      {status}
    </span>
  );
}
