"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import TimesheetModal from "@/components/timesheets/TimesheetModal";

function groupByDate(tasks) {
  return tasks.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {});
}

function getDatesInRange(startDate, endDate) {
  const dates = [];
  const cur = new Date(startDate);
  const end = new Date(endDate);
  while (cur <= end) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function formatDay(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatWeekRange(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  return `${s.getDate()} – ${e.getDate()} ${s.toLocaleString("en-US", { month: "long" })}, ${s.getFullYear()}`;
}

// three-dot menu for each task row
function TaskMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-1 text-gray-400 hover:text-gray-600 rounded"
        aria-label="Task options"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function WeeklyView({ timesheet, initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [addingDate, setAddingDate] = useState(null);

  const grouped = groupByDate(tasks);
  const dates = getDatesInRange(timesheet.startDate, timesheet.endDate);

  const totalHours = tasks.reduce((sum, t) => sum + (t.hours ?? 0), 0);
  const progressPct = Math.min((totalHours / 40) * 100, 100);

  function openAdd(date) {
    setEditTask(null);
    setAddingDate(date);
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditTask(task);
    setAddingDate(null);
    setModalOpen(true);
  }

  function handleSaved(saved, isEdit) {
    if (isEdit) {
      setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    } else {
      setTasks((prev) => [...prev, saved]);
    }
  }

  function handleDelete(taskId) {
    // optimistic — remove immediately, fire API in background
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    fetch(`/api/timesheets/${timesheet.id}/tasks/${taskId}`, { method: "DELETE" }).catch((err) =>
      console.error("Delete failed:", err)
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* week header card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-lg font-bold text-gray-900">This week&apos;s timesheet</h1>
            <p className="text-xs text-gray-400 mt-0.5">{formatWeekRange(timesheet.startDate, timesheet.endDate)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{totalHours}/40 hrs</p>
            <p className="text-xs text-gray-400">{Math.round(progressPct)}%</p>
          </div>
        </div>

        {/* orange progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%`, backgroundColor: "#F97316" }}
          />
        </div>
      </div>

      {/* day-by-day tasks */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {dates.map((date, idx) => {
          const dayTasks = grouped[date] ?? [];

          return (
            <div key={date} className={idx !== 0 ? "border-t border-gray-100" : ""}>
              {/* day label */}
              <div className="px-6 pt-4 pb-1">
                <span className="text-sm font-semibold text-gray-700">{formatDay(date)}</span>
              </div>

              {/* tasks */}
              {dayTasks.map((task) => (
                <div key={task.id} className="flex items-center px-6 py-2.5 hover:bg-gray-50 group">
                  <span className="flex-1 text-sm text-gray-800">{task.description}</span>
                  <span className="text-sm text-gray-500 mr-3">{task.hours} hrs</span>
                  <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full mr-2">
                    {task.project}
                  </span>
                  <TaskMenu
                    onEdit={() => openEdit(task)}
                    onDelete={() => handleDelete(task.id)}
                  />
                </div>
              ))}

              {/* add new task row */}
              <div className="px-6 pb-4 mt-1">
                <button
                  onClick={() => openAdd(date)}
                  className="w-full border border-dashed border-gray-200 rounded-lg py-2 text-sm text-gray-400 hover:border-primary hover:text-primary transition-colors"
                >
                  + Add new task
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">© 2024 tentwenty. All rights reserved.</p>

      {/* add/edit task modal */}
      <TimesheetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        editEntry={editTask}
        timesheetId={timesheet.id}
      />
    </div>
  );
}
