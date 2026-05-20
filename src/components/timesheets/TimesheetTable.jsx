"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import TimesheetModal from "@/components/timesheets/TimesheetModal";
import { formatDateRange } from "@/lib/mock-data";

const STATUS_FILTER_OPTIONS = ["All Status", "COMPLETED", "INCOMPLETE", "MISSING"];
const PAGE_SIZE = 5;

// build date range options from actual data
function buildDateRangeOptions(timesheets) {
  const seen = new Set();
  const options = [{ label: "Date Range", value: "ALL" }];
  timesheets.forEach((ts) => {
    if (ts.startDate && ts.endDate) {
      const val = `${ts.startDate}|${ts.endDate}`;
      if (!seen.has(val)) {
        seen.add(val);
        options.push({ label: formatDateRange(ts.startDate, ts.endDate), value: val });
      }
    }
  });
  return options;
}

// label and behaviour changes based on status
function getActionLabel(status) {
  if (status === "COMPLETED") return "View";
  if (status === "INCOMPLETE") return "Update";
  return "Create";
}

export default function TimesheetTable({ initialData }) {
  const router = useRouter();
  const [timesheets, setTimesheets] = useState(initialData);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTimesheetId, setActiveTimesheetId] = useState(null);

  const dateRangeOptions = useMemo(() => buildDateRangeOptions(timesheets), [timesheets]);

  const filtered = useMemo(() => {
    return timesheets.filter((ts) => {
      const statusMatch = statusFilter === "All Status" || ts.status === statusFilter;
      const rangeMatch =
        dateFilter === "ALL" ||
        `${ts.startDate}|${ts.endDate}` === dateFilter;
      return statusMatch && rangeMatch;
    });
  }, [timesheets, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleAction(ts) {
    if (ts.status === "COMPLETED") {
      router.push(`/dashboard/${ts.id}`);
    } else if (ts.status === "INCOMPLETE") {
      // go to list view to add/update tasks
      router.push(`/dashboard/${ts.id}`);
    } else {
      // MISSING — open the modal to create an entry
      setActiveTimesheetId(ts.id);
      setModalOpen(true);
    }
  }

  function handleSaved(saved) {
    // mark the timesheet as completed once an entry is added
    setTimesheets((prev) =>
      prev.map((ts) => (ts.id === saved.timesheetId ? { ...ts, status: "INCOMPLETE" } : ts))
    );
    setModalOpen(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Your Timesheets</h1>

      {/* filters */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {dateRangeOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {STATUS_FILTER_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "All Status" ? "Status" : s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {/* table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Week #
                <span className="ml-1 text-gray-300">↓</span>
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Date
                <span className="ml-1 text-gray-300">↓</span>
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
                <span className="ml-1 text-gray-300">↓</span>
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">
                  No timesheets match the current filters.
                </td>
              </tr>
            ) : (
              paginated.map((ts) => (
                <tr key={ts.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">{ts.weekNumber}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {ts.startDate && ts.endDate
                      ? formatDateRange(ts.startDate, ts.endDate)
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={ts.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleAction(ts)}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {getActionLabel(ts.status)}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>{PAGE_SIZE} per page</span>
            <svg className="w-3 h-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-7 h-7 rounded text-xs font-medium ${
                  n === page
                    ? "bg-primary text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">© 2024 tentwenty. All rights reserved.</p>

      {/* modal for creating entry on MISSING weeks */}
      <TimesheetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        editEntry={null}
        timesheetId={activeTimesheetId}
      />
    </div>
  );
}
