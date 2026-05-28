import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { MessageBubble } from "@/components/chat/message-bubble";

describe("MessageBubble", () => {
  it("renders the assistant message content", () => {
    render(
      <MessageBubble
        message={{ id: "1", role: "assistant", content: "Hello there." }}
      />,
    );
    expect(screen.getByText("Hello there.")).toBeInTheDocument();
  });

  it("shows a pending placeholder instead of content when pending", () => {
    render(
      <MessageBubble
        message={{
          id: "2",
          role: "assistant",
          content: "ignored",
          pending: true,
        }}
      />,
    );
    expect(screen.queryByText("ignored")).not.toBeInTheDocument();
  });

  it("renders inline citation pills for [N] markers in assistant messages", () => {
    const { container } = render(
      <MessageBubble
        message={{
          id: "3",
          role: "assistant",
          content: "ACME pricing is tiered. [1] Starter is free. [2]",
        }}
      />,
    );
    const pills = container.querySelectorAll(".citation-pill");
    expect(pills).toHaveLength(2);
    expect(pills[0]?.textContent).toBe("1");
    expect(pills[1]?.textContent).toBe("2");
  });

  it("does not render citation pills for user messages", () => {
    const { container } = render(
      <MessageBubble
        message={{ id: "4", role: "user", content: "tell me about [1]" }}
      />,
    );
    expect(container.querySelectorAll(".citation-pill")).toHaveLength(0);
  });
});
