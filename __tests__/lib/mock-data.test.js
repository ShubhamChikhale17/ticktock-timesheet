import {
  getAllTimesheets,
  getTimesheetById,
  createTimesheet,
  updateTimesheet,
  deleteTimesheet,
  getTasksByTimesheetId,
  createTask,
  updateTask,
  deleteTask,
  formatDateRange,
} from "@/lib/mock-data";

describe("formatDateRange", () => {
  it("formats a date range correctly", () => {
    expect(formatDateRange("2024-01-01", "2024-01-05")).toBe("1 - 5 January, 2024");
  });

  it("handles single-digit days", () => {
    const result = formatDateRange("2024-03-04", "2024-03-08");
    expect(result).toBe("4 - 8 March, 2024");
  });
});

describe("Timesheet CRUD", () => {
  it("returns all timesheets", () => {
    const all = getAllTimesheets();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
  });

  it("gets a timesheet by id", () => {
    const ts = getTimesheetById("1");
    expect(ts).toBeDefined();
    expect(ts.id).toBe("1");
  });

  it("returns undefined for a missing id", () => {
    expect(getTimesheetById("999999")).toBeUndefined();
  });

  it("creates a new timesheet entry", () => {
    const before = getAllTimesheets().length;
    const created = createTimesheet({
      startDate: "2024-06-03",
      endDate: "2024-06-07",
      status: "COMPLETED",
      project: "Test Project",
      typeOfWork: "Development",
      hours: 40,
    });
    expect(created.id).toBeDefined();
    expect(created.project).toBe("Test Project");
    expect(getAllTimesheets().length).toBe(before + 1);
  });

  it("updates an existing timesheet", () => {
    const updated = updateTimesheet("1", { hours: 35 });
    expect(updated).toBeDefined();
    expect(updated.hours).toBe(35);
    // id should still be the same
    expect(updated.id).toBe("1");
  });

  it("returns null when updating a non-existent id", () => {
    expect(updateTimesheet("does-not-exist", { hours: 10 })).toBeNull();
  });

  it("deletes a timesheet and returns true", () => {
    const created = createTimesheet({
      startDate: "2024-07-01",
      endDate: "2024-07-05",
      status: "MISSING",
    });
    const result = deleteTimesheet(created.id);
    expect(result).toBe(true);
    expect(getTimesheetById(created.id)).toBeUndefined();
  });

  it("returns false when deleting an id that does not exist", () => {
    expect(deleteTimesheet("ghost-id")).toBe(false);
  });
});

describe("Task CRUD", () => {
  it("gets tasks for a timesheet", () => {
    const tasks = getTasksByTimesheetId("1");
    expect(Array.isArray(tasks)).toBe(true);
    // week 1 is seeded with tasks
    expect(tasks.length).toBeGreaterThan(0);
  });

  it("returns empty array for a timesheet with no tasks", () => {
    expect(getTasksByTimesheetId("5")).toHaveLength(0);
  });

  it("creates a task and adds it to the store", () => {
    const task = createTask({
      timesheetId: "2",
      date: "2024-01-08",
      description: "Sprint planning",
      project: "Admin Dashboard",
      typeOfWork: "Meetings",
      hours: 2,
    });
    expect(task.id).toBeDefined();
    expect(task.description).toBe("Sprint planning");

    const all = getTasksByTimesheetId("2");
    expect(all.find((t) => t.id === task.id)).toBeDefined();
  });

  it("updates a task", () => {
    const task = createTask({
      timesheetId: "2",
      date: "2024-01-09",
      description: "Review PRs",
      project: "Admin Dashboard",
      hours: 1,
    });
    const updated = updateTask(task.id, { hours: 2, description: "Review PRs (extended)" });
    expect(updated.hours).toBe(2);
    expect(updated.description).toBe("Review PRs (extended)");
  });

  it("returns null when updating a non-existent task", () => {
    expect(updateTask("no-such-task", { hours: 1 })).toBeNull();
  });

  it("deletes a task", () => {
    const task = createTask({
      timesheetId: "3",
      date: "2024-01-15",
      description: "Temp task",
      project: "Mobile App",
      hours: 1,
    });
    expect(deleteTask(task.id)).toBe(true);
    expect(getTasksByTimesheetId("3").find((t) => t.id === task.id)).toBeUndefined();
  });
});
