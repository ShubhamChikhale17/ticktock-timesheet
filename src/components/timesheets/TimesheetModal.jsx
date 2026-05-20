"use client";

import { useState, useEffect } from "react";
import { PROJECT_OPTIONS, TYPE_OF_WORK_OPTIONS } from "@/lib/mock-data";

const EMPTY_FORM = {
  project: "",
  typeOfWork: "",
  description: "",
  hours: 8,
};

export default function TimesheetModal({ isOpen, onClose, onSaved, editEntry, timesheetId }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editEntry) {
      setForm({
        project: editEntry.project ?? "",
        typeOfWork: editEntry.typeOfWork ?? "",
        description: editEntry.description ?? "",
        hours: editEntry.hours ?? 8,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editEntry, isOpen]);

  function validate() {
    const errs = {};
    if (!form.project) errs.project = "Project is required.";
    if (!form.typeOfWork) errs.typeOfWork = "Type of work is required.";
    if (!form.description.trim()) errs.description = "Task description is required.";
    if (!form.hours || form.hours <= 0) errs.hours = "Hours must be greater than 0.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const url = editEntry
        ? `/api/timesheets/${timesheetId}/tasks/${editEntry.id}`
        : `/api/timesheets/${timesheetId}/tasks`;
      const method = editEntry ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: form.project,
          typeOfWork: form.typeOfWork,
          description: form.description,
          hours: Number(form.hours),
          // use today's date as default if not editing
          date: editEntry?.date ?? new Date().toISOString().split("T")[0],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }

      const saved = await res.json();
      onSaved(saved, !!editEntry);
      onClose();
    } catch (err) {
      console.error("Failed to save entry:", err);
      setErrors({ form: err.message });
    } finally {
      setSaving(false);
    }
  }

  function set(field, val) {
    setForm((p) => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function adjustHours(delta) {
    setForm((p) => ({ ...p, hours: Math.max(1, Math.min(24, (p.hours || 0) + delta)) }));
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-gray-600/60" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-base font-semibold text-gray-900">
            {editEntry ? "Edit Entry" : "Add New Entry"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {errors.form && (
            <p className="text-xs text-red-500 bg-red-50 rounded px-3 py-2">{errors.form}</p>
          )}

          {/* select project */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              Select Project <span className="text-red-500">*</span>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-xs cursor-help" title="Select the project this work belongs to">?</span>
            </label>
            <select
              value={form.project}
              onChange={(e) => set("project", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Project Name</option>
              {PROJECT_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.project && <p className="text-xs text-red-500 mt-1">{errors.project}</p>}
          </div>

          {/* type of work */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              Type of Work <span className="text-red-500">*</span>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-xs cursor-help" title="What kind of work did you do?">?</span>
            </label>
            <select
              value={form.typeOfWork}
              onChange={(e) => set("typeOfWork", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Bug fixes</option>
              {TYPE_OF_WORK_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.typeOfWork && <p className="text-xs text-red-500 mt-1">{errors.typeOfWork}</p>}
          </div>

          {/* task description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Write text here ..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-0.5">A note for extra info</p>
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* hours — stepper */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustHours(-1)}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-lg"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium text-gray-900">
                {form.hours}
              </span>
              <button
                type="button"
                onClick={() => adjustHours(1)}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-lg"
              >
                +
              </button>
            </div>
            {errors.hours && <p className="text-xs text-red-500 mt-1">{errors.hours}</p>}
          </div>

          {/* actions */}
          <div className="flex items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? "Saving…" : editEntry ? "Save changes" : "Add entry"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
