// TODO: move date helpers to a shared utils file once this grows
export function formatDateRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const month = s.toLocaleString("en-US", { month: "long" });
  return `${s.getDate()} - ${e.getDate()} ${month}, ${s.getFullYear()}`;
}

// grabbed this from stackoverflow, seems to work fine for our use case
// https://stackoverflow.com/a/6117889
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// In-memory store — resets on server restart, fine for a demo
// TODO: swap this out for a real DB (Prisma + postgres would work well here)
let timesheets = [
  { id: "1", weekNumber: 1, startDate: "2024-01-01", endDate: "2024-01-05", status: "COMPLETED", project: "Homepage Redesign", typeOfWork: "Development", description: "Rebuilt the landing page with updated brand assets.", hours: 40 },
  { id: "2", weekNumber: 2, startDate: "2024-01-08", endDate: "2024-01-12", status: "COMPLETED", project: "Admin Dashboard", typeOfWork: "Development", description: "Added analytics widgets and role-based access.", hours: 38 },
  { id: "3", weekNumber: 3, startDate: "2024-01-15", endDate: "2024-01-19", status: "INCOMPLETE", project: "Mobile App", typeOfWork: "Bug fixes", description: "Fixed login crash on iOS 17.", hours: 22 },
  { id: "4", weekNumber: 4, startDate: "2024-01-22", endDate: "2024-01-26", status: "COMPLETED", project: "API Integration", typeOfWork: "Development", description: "Connected payment gateway endpoints.", hours: 40 },
  { id: "5", weekNumber: 5, startDate: "2024-01-29", endDate: "2024-02-02", status: "MISSING" },
  { id: "6", weekNumber: 6, startDate: "2024-02-05", endDate: "2024-02-09", status: "COMPLETED", project: "Design System", typeOfWork: "Design", description: "Published v2 of the component library.", hours: 36 },
  { id: "7", weekNumber: 7, startDate: "2024-02-12", endDate: "2024-02-16", status: "INCOMPLETE", project: "Homepage Redesign", typeOfWork: "Testing", description: "E2E tests for the checkout flow.", hours: 18 },
  { id: "8", weekNumber: 8, startDate: "2024-02-19", endDate: "2024-02-23", status: "MISSING" },
  { id: "9", weekNumber: 9, startDate: "2024-02-26", endDate: "2024-03-01", status: "COMPLETED", project: "Admin Dashboard", typeOfWork: "Development", description: "Performance optimisation pass.", hours: 40 },
  { id: "10", weekNumber: 10, startDate: "2024-03-04", endDate: "2024-03-08", status: "INCOMPLETE", project: "Mobile App", typeOfWork: "Development", description: "Dark mode implementation.", hours: 28 },
];

export function getAllTimesheets() {
  return timesheets;
}

export function getTimesheetById(id) {
  return timesheets.find((t) => t.id === id);
}

export function createTimesheet(entry) {
  const newEntry = {
    ...entry,
    id: String(Date.now()),
    weekNumber: getISOWeek(new Date(entry.startDate)),
  };
  timesheets = [...timesheets, newEntry];
  return newEntry;
}

export function updateTimesheet(id, patch) {
  const idx = timesheets.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  timesheets = timesheets.map((t) => (t.id === id ? { ...t, ...patch } : t));
  // find again after map — a bit redundant but keeps it readable
  return timesheets.find((t) => t.id === id);
}

export function deleteTimesheet(id) {
  const before = timesheets.length;
  timesheets = timesheets.filter((t) => t.id !== id);
  return timesheets.length < before;
}

// per-day tasks — seeding weeks 1 and 4 so the List View has real data
let tasks = [
  { id: "t1", timesheetId: "1", date: "2024-01-01", description: "Homepage Development", project: "Homepage Redesign", typeOfWork: "Development", hours: 8 },
  { id: "t2", timesheetId: "1", date: "2024-01-01", description: "Design review meeting", project: "Homepage Redesign", typeOfWork: "Meetings", hours: 1 },
  { id: "t3", timesheetId: "1", date: "2024-01-02", description: "Homepage Development", project: "Homepage Redesign", typeOfWork: "Development", hours: 8 },
  { id: "t4", timesheetId: "1", date: "2024-01-03", description: "Homepage Development", project: "Homepage Redesign", typeOfWork: "Development", hours: 7 },
  { id: "t5", timesheetId: "1", date: "2024-01-03", description: "Code review", project: "Homepage Redesign", typeOfWork: "Code review", hours: 1 },
  { id: "t6", timesheetId: "1", date: "2024-01-04", description: "Homepage Development", project: "Homepage Redesign", typeOfWork: "Development", hours: 8 },
  { id: "t7", timesheetId: "1", date: "2024-01-05", description: "Homepage Development", project: "Homepage Redesign", typeOfWork: "Development", hours: 7 },
  { id: "t8", timesheetId: "4", date: "2024-01-22", description: "API Integration", project: "API Integration", typeOfWork: "Development", hours: 8 },
  { id: "t9", timesheetId: "4", date: "2024-01-22", description: "Documentation", project: "API Integration", typeOfWork: "Documentation", hours: 1 },
  { id: "t10", timesheetId: "4", date: "2024-01-23", description: "API Integration", project: "API Integration", typeOfWork: "Development", hours: 8 },
  { id: "t11", timesheetId: "4", date: "2024-01-24", description: "API Integration", project: "API Integration", typeOfWork: "Development", hours: 8 },
  { id: "t12", timesheetId: "4", date: "2024-01-25", description: "Bug fixes", project: "API Integration", typeOfWork: "Bug fixes", hours: 7 },
  { id: "t13", timesheetId: "4", date: "2024-01-26", description: "API Integration", project: "API Integration", typeOfWork: "Development", hours: 8 },
];

export function getTasksByTimesheetId(timesheetId) {
  return tasks.filter((t) => t.timesheetId === timesheetId);
}

export function createTask(task) {
  const newTask = { ...task, id: `t${Date.now()}` };
  tasks = [...tasks, newTask];
  return newTask;
}

export function updateTask(id, patch) {
  const exists = tasks.find((t) => t.id === id);
  if (!exists) return null;
  tasks = tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
  return tasks.find((t) => t.id === id);
}

export function deleteTask(id) {
  const before = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);
  return tasks.length < before;
}

export const PROJECT_OPTIONS = [
  "Homepage Redesign",
  "Admin Dashboard",
  "Mobile App",
  "API Integration",
  "Design System",
  "Marketing Site",
];

// probably want this to come from an API eventually
export const TYPE_OF_WORK_OPTIONS = [
  "Development",
  "Design",
  "Testing",
  "Bug fixes",
  "Code review",
  "Documentation",
  "Meetings",
];
