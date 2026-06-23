// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Subscribe</Button>);
    expect(
      screen.getByRole("button", { name: "Subscribe" })
    ).toBeInTheDocument();
  });

  it("applies the brand variant classes", () => {
    render(<Button variant="brand">Pay</Button>);
    const btn = screen.getByRole("button", { name: "Pay" });
    expect(btn.className).toContain("bg-brand");
  });

  it("respects the disabled prop", () => {
    render(<Button disabled>Nope</Button>);
    expect(screen.getByRole("button", { name: "Nope" })).toBeDisabled();
  });

  it("renders as a child anchor when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/learn">Go</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toHaveAttribute("href", "/learn");
  });
});
