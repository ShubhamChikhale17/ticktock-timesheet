import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TimesheetModal from "@/components/timesheets/TimesheetModal";

global.fetch = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

const noop = () => {};

describe("TimesheetModal", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <TimesheetModal isOpen={false} onClose={noop} onSaved={noop} editEntry={null} timesheetId="1" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders 'Add New Entry' heading when no editEntry is provided", () => {
    render(<TimesheetModal isOpen={true} onClose={noop} onSaved={noop} editEntry={null} timesheetId="1" />);
    expect(screen.getByText("Add New Entry")).toBeInTheDocument();
  });

  it("renders 'Edit Entry' heading when editEntry is provided", () => {
    const entry = {
      id: "t1",
      timesheetId: "1",
      date: "2024-01-01",
      description: "Homepage Development",
      project: "Homepage Redesign",
      typeOfWork: "Development",
      hours: 8,
    };
    render(<TimesheetModal isOpen={true} onClose={noop} onSaved={noop} editEntry={entry} timesheetId="1" />);
    expect(screen.getByText("Edit Entry")).toBeInTheDocument();
  });

  it("shows validation errors when form is submitted empty", async () => {
    render(<TimesheetModal isOpen={true} onClose={noop} onSaved={noop} editEntry={null} timesheetId="1" />);
    fireEvent.click(screen.getByText("Add entry"));

    await waitFor(() => {
      expect(screen.getByText("Project is required.")).toBeInTheDocument();
      expect(screen.getByText("Task description is required.")).toBeInTheDocument();
    });
  });

  it("renders the hours stepper buttons", () => {
    render(<TimesheetModal isOpen={true} onClose={noop} onSaved={noop} editEntry={null} timesheetId="1" />);
    // should have + and - buttons
    const buttons = screen.getAllByRole("button");
    const minusBtn = buttons.find((b) => b.textContent.trim() === "−");
    const plusBtn = buttons.find((b) => b.textContent.trim() === "+");
    expect(minusBtn).toBeDefined();
    expect(plusBtn).toBeDefined();
  });

  it("increments and decrements hours with stepper buttons", () => {
    render(<TimesheetModal isOpen={true} onClose={noop} onSaved={noop} editEntry={null} timesheetId="1" />);
    const buttons = screen.getAllByRole("button");
    const plusBtn = buttons.find((b) => b.textContent.trim() === "+");
    const minusBtn = buttons.find((b) => b.textContent.trim() === "−");

    fireEvent.click(plusBtn);
    expect(screen.getByText("9")).toBeInTheDocument(); // default 8 + 1

    fireEvent.click(minusBtn);
    expect(screen.getByText("8")).toBeInTheDocument(); // back to 8
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = jest.fn();
    render(<TimesheetModal isOpen={true} onClose={onClose} onSaved={noop} editEntry={null} timesheetId="1" />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits form and calls onSaved on success", async () => {
    const mockTask = { id: "t99", timesheetId: "1", date: "2024-01-08", description: "Sprint planning", project: "Admin Dashboard", typeOfWork: "Meetings", hours: 2 };
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockTask });

    const onSaved = jest.fn();
    const onClose = jest.fn();
    render(<TimesheetModal isOpen={true} onClose={onClose} onSaved={onSaved} editEntry={null} timesheetId="1" />);

    // fill in required fields
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "Admin Dashboard" } });
    fireEvent.change(selects[1], { target: { value: "Meetings" } });

    const textarea = screen.getByPlaceholderText("Write text here ...");
    fireEvent.change(textarea, { target: { value: "Sprint planning" } });

    fireEvent.click(screen.getByText("Add entry"));

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith(mockTask, false);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
