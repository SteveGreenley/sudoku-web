import { test, expect, Page } from "@playwright/test";

// Device specs: viewportWidth, viewportHeight, name, expectedLayout
const BREAKPOINTS = [
  // 4K
  { width: 3840, height: 2160, name: "4k-desktop" },
  { width: 3840, height: 1600, name: "4k-tall" },
  // Desktop
  { width: 1920, height: 1080, name: "desktop-landscape" },
  { width: 1440, height: 900, name: "desktop-normal" },
  // Tablet landscape
  { width: 1366, height: 1024, name: "ipad-pro-landscape" },
  { width: 1080, height: 810, name: "ipad-air-landscape" },
  { width: 1024, height: 768, name: "ipad-mini-landscape" },
  // Tablet portrait
  { width: 1024, height: 1366, name: "ipad-pro-portrait" },
  { width: 810, height: 1080, name: "ipad-air-portrait" },
  { width: 768, height: 1024, name: "ipad-mini-portrait" },
  // Large phone
  { width: 932, height: 430, name: "large-phone-landscape" },
  { width: 430, height: 932, name: "large-phone-portrait" },
  // Normal phone
  { width: 852, height: 393, name: "normal-phone-landscape" },
  { width: 393, height: 852, name: "normal-phone-portrait" },
  // Small phone
  { width: 568, height: 320, name: "small-phone-landscape" },
  { width: 320, height: 568, name: "small-phone-portrait" },
];

test.describe("Responsive Layout", () => {
  for (const bp of BREAKPOINTS) {
    test(`${bp.name} (${bp.width}x${bp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto("http://localhost:3000");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);

      // Screenshot the full page
      await page.screenshot({ path: `./e2e/screenshots/${bp.name}.png`, fullPage: false });

      // Verify: board should exist and have a reasonable size
      const board = page.locator('[role="grid"]');
      await expect(board).toBeVisible();

      const boardBox = await board.boundingBox();
      expect(boardBox).not.toBeNull();
      if (boardBox) {
        // Board should be at least 200px wide and square
        expect(boardBox.width).toBeGreaterThanOrEqual(200);
        // Board should be square (within 10% tolerance)
        const ratio = boardBox.width / (boardBox.height || 1);
        expect(ratio).toBeGreaterThanOrEqual(0.85);
        expect(ratio).toBeLessThanOrEqual(1.15);

        // Board should not exceed viewport
        expect(boardBox.x).toBeGreaterThanOrEqual(0);
        expect(boardBox.x + boardBox.width).toBeLessThanOrEqual(bp.width + 25); // tolerance for tiny viewports
        expect(boardBox.y).toBeGreaterThanOrEqual(0);
        expect(boardBox.y + boardBox.height).toBeLessThanOrEqual(bp.height + 25);
      }

      // Verify: number buttons exist and don't overlap the board
      const buttons = page.locator('[role="group"] button');
      const buttonsCount = await buttons.count();
      expect(buttonsCount).toBe(9);

      const buttonsBox = await buttons.first().boundingBox();
      if (buttonsBox && boardBox) {
        // In portrait mode: buttons should be below the board
        const boardBottom = boardBox.y + (boardBox.height || 0);
        // In landscape mode: buttons should be to the right of the board
        const boardRight = boardBox.x + (boardBox.width || 0);
        // Check if buttons are either below OR to the right of the board (no overlap)
        const belowBoard = buttonsBox.y >= boardBottom - 20; // 20px gap tolerance
        const rightOfBoard = buttonsBox.x >= boardRight - 30; // 30px gap tolerance
        expect(belowBoard || rightOfBoard).toBe(true);
      }
    });
  }
});
