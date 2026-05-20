import { render, screen } from "@testing-library/react";
import StatusBadge from "@/components/ui/StatusBadge";

describe("StatusBadge", () => {
  it("renders 'COMPLETED' for COMPLETED status", () => {
    render(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });

  it("renders 'INCOMPLETE' for INCOMPLETE status", () => {
    render(<StatusBadge status="INCOMPLETE" />);
    expect(screen.getByText("INCOMPLETE")).toBeInTheDocument();
  });

  it("renders 'MISSING' for MISSING status", () => {
    render(<StatusBadge status="MISSING" />);
    expect(screen.getByText("MISSING")).toBeInTheDocument();
  });

  it("applies green styles for COMPLETED", () => {
    const { container } = render(<StatusBadge status="COMPLETED" />);
    const badge = container.firstChild;
    expect(badge.className).toMatch(/green/);
  });

  it("applies orange styles for INCOMPLETE", () => {
    const { container } = render(<StatusBadge status="INCOMPLETE" />);
    const badge = container.firstChild;
    expect(badge.className).toMatch(/orange/);
  });

  it("applies red styles for MISSING", () => {
    const { container } = render(<StatusBadge status="MISSING" />);
    const badge = container.firstChild;
    expect(badge.className).toMatch(/red/);
  });

  it("handles an unknown status gracefully", () => {
    render(<StatusBadge status="UNKNOWN" />);
    expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
  });
});
