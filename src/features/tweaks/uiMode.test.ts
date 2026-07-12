import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { applyUIMode, DEFAULT_UI_MODE, getSavedUIMode, initUIMode, useUIMode } from "./uiMode";

describe("uiMode", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-ui");
  });

  it("defaults to brutalist when nothing is saved", () => {
    expect(getSavedUIMode()).toBe(DEFAULT_UI_MODE);
    expect(getSavedUIMode()).toBe("brutalist");
  });

  it("applyUIMode persists to localStorage and sets the data-ui attribute", () => {
    applyUIMode("classic");
    expect(localStorage.getItem("lifeos.uiMode")).toBe("classic");
    expect(document.documentElement.dataset.ui).toBe("classic");
    expect(getSavedUIMode()).toBe("classic");
  });

  it("ignores a corrupted localStorage value and falls back to the default", () => {
    localStorage.setItem("lifeos.uiMode", "not-a-real-mode");
    expect(getSavedUIMode()).toBe("brutalist");
  });

  it("initUIMode restores the previously saved mode on the root element", () => {
    localStorage.setItem("lifeos.uiMode", "classic");
    initUIMode();
    expect(document.documentElement.dataset.ui).toBe("classic");
  });

  it("useUIMode re-renders subscribers when the mode changes", () => {
    const { result } = renderHook(() => useUIMode());
    expect(result.current).toBe("brutalist");

    act(() => {
      applyUIMode("classic");
    });

    expect(result.current).toBe("classic");
  });
});
