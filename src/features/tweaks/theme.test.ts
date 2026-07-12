import { describe, expect, it, beforeEach } from "vitest";
import {
  ACCENTS,
  applyAccent,
  applyTheme,
  DEFAULT_ACCENT_ID,
  DEFAULT_THEME,
  getAccentById,
  getSavedAccentId,
  getSavedTheme,
  resolveAccentId,
} from "./theme";

describe("theme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("style");
  });

  describe("resolveAccentId", () => {
    it("returns the default when nothing is stored", () => {
      expect(resolveAccentId(null)).toBe(DEFAULT_ACCENT_ID);
    });

    it("passes through a current accent id unchanged", () => {
      expect(resolveAccentId("hazard-yellow")).toBe("hazard-yellow");
    });

    it("maps a legacy 'Ink & Paper' id onto its brutalist replacement", () => {
      expect(resolveAccentId("vermilion")).toBe("safety-orange");
      expect(resolveAccentId("moss")).toBe("toxic-green");
    });

    it("maps a legacy hex value onto its brutalist replacement", () => {
      expect(resolveAccentId("#3f56b5")).toBe("signal-blue");
    });

    it("maps an original neon-era id onto its brutalist replacement", () => {
      expect(resolveAccentId("chartreuse")).toBe("hazard-yellow");
    });

    it("falls back to the default for a totally unknown value", () => {
      expect(resolveAccentId("nonsense-color")).toBe(DEFAULT_ACCENT_ID);
    });
  });

  describe("getAccentById", () => {
    it("finds an accent by id", () => {
      expect(getAccentById("toxic-green").label).toBe("Toxic green");
    });

    it("falls back to the first accent for an unknown id", () => {
      expect(getAccentById("nope")).toBe(ACCENTS[0]);
    });
  });

  describe("applyAccent / applyTheme", () => {
    it("persists the accent and paints the day variant on :root", () => {
      applyAccent("signal-blue");
      expect(getSavedAccentId()).toBe("signal-blue");
      expect(document.documentElement.style.getPropertyValue("--acc")).toBe("#1a56ff");
    });

    it("paints the night variant when the night theme is active", () => {
      applyTheme("night");
      applyAccent("signal-blue");
      expect(document.documentElement.style.getPropertyValue("--acc")).toBe("#4d7aff");
    });

    it("applyTheme persists the theme and sets data-theme", () => {
      applyTheme("night");
      expect(getSavedTheme()).toBe("night");
      expect(document.documentElement.dataset.theme).toBe("night");

      applyTheme("paper");
      expect(getSavedTheme()).toBe(DEFAULT_THEME);
      expect(document.documentElement.dataset.theme).toBe("paper");
    });

    it("getSavedTheme defaults to paper for garbage input", () => {
      localStorage.setItem("lifeos.theme", "midnight-oil");
      expect(getSavedTheme()).toBe("paper");
    });
  });
});
