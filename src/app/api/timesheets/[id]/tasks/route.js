import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTimesheetById, getTasksByTimesheetId, createTask } from "@/lib/mock-data";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // make sure the parent timesheet actually exists
  const timesheet = getTimesheetById(params.id);
  if (!timesheet) {
    return NextResponse.json({ error: "Timesheet not found" }, { status: 404 });
  }

  const tasks = getTasksByTimesheetId(params.id);
  return NextResponse.json(tasks);
}

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timesheet = getTimesheetById(params.id);
  if (!timesheet) {
    return NextResponse.json({ error: "Timesheet not found" }, { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { date, description, project, typeOfWork, hours } = body;

  if (!date || !description || !project || hours == null) {
    return NextResponse.json({ error: "date, description, project and hours are required" }, { status: 400 });
  }

  if (typeof hours !== "number" || hours <= 0 || hours > 24) {
    return NextResponse.json({ error: "hours must be a number between 0 and 24" }, { status: 400 });
  }

  const task = createTask({ timesheetId: params.id, date, description, project, typeOfWork, hours });
  return NextResponse.json(task, { status: 201 });
}
