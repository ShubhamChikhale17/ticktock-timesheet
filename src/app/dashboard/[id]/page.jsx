import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTimesheetById, getTasksByTimesheetId } from "@/lib/mock-data";
import Navbar from "@/components/layout/Navbar";
import WeeklyView from "@/components/timesheets/WeeklyView";

export async function generateMetadata({ params }) {
  const ts = getTimesheetById(params.id);
  return { title: ts ? `Week ${ts.weekNumber} — Ticktock` : "Ticktock" };
}

export default async function TimesheetDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const timesheet = getTimesheetById(params.id);
  if (!timesheet) notFound();

  const tasks = getTasksByTimesheetId(params.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <WeeklyView timesheet={timesheet} initialTasks={tasks} />
    </div>
  );
}
