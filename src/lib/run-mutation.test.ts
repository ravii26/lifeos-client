import { describe, expect, it, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { runMutation } from "./run-mutation";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("runMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the unwrapped result and calls onSuccess when the mutation succeeds", async () => {
    const trigger = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve({ id: "1" }) });
    const onSuccess = vi.fn();

    const result = await runMutation(trigger, { title: "x" }, { onSuccess });

    expect(result).toEqual({ id: "1" });
    expect(onSuccess).toHaveBeenCalledWith({ id: "1" });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows an error toast and returns undefined when the mutation rejects", async () => {
    const trigger = vi.fn().mockReturnValue({ unwrap: () => Promise.reject(new Error("network")) });
    const onSuccess = vi.fn();

    const result = await runMutation(trigger, { title: "x" }, { onSuccess, errorMessage: "Could not save" });

    expect(result).toBeUndefined();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Could not save");
  });

  it("falls back to a generic error message when none is provided", async () => {
    const trigger = vi.fn().mockReturnValue({ unwrap: () => Promise.reject(new Error("boom")) });

    await runMutation(trigger, {});

    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });

  it("passes the given argument through to the trigger", async () => {
    const trigger = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve(true) });

    await runMutation(trigger, { id: "42" });

    expect(trigger).toHaveBeenCalledWith({ id: "42" });
  });
});
