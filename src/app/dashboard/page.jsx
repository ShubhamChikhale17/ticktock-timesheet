import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllTimesheets } from "@/lib/mock-data";
import Navbar from "@/components/layout/Navbar";
import TimesheetTable from "@/components/timesheets/TimesheetTable";

export const metadata = {
  title: "Dashboard — Ticktock",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const timesheets = getAllTimesheets();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <TimesheetTable initialData={timesheets} />
    </div>
  );
}
