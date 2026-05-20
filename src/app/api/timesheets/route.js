import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllTimesheets, createTimesheet } from "@/lib/mock-data";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timesheets = getAllTimesheets();
  return NextResponse.json(timesheets);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { startDate, endDate, status, project, typeOfWork, description, hours } = body;

  // basic validation — could definitely make this stricter
  if (!startDate || !endDate || !status) {
    return NextResponse.json({ error: "startDate, endDate and status are required" }, { status: 400 });
  }

  const entry = createTimesheet({ startDate, endDate, status, project, typeOfWork, description, hours });
  return NextResponse.json(entry, { status: 201 });
}
