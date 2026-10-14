import { describe, expect, it } from "vitest";
import { detectDeviceCategory, detectLayoutMode } from "./useLayout";

const PHONE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)";
const IPAD_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const DESKTOP_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const ANDROID_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

describe("detectDeviceCategory", () => {
  it("classifies small phone viewport (320px wide)", () => {
    expect(detectDeviceCategory(320, 568, false, PHONE_UA, 1)).toBe("smallPhone");
  });

  it("classifies normal phone viewport (393px wide)", () => {
    expect(detectDeviceCategory(393, 852, false, PHONE_UA, 1)).toBe("normalPhone");
  });

  it("classifies large phone viewport (430px wide)", () => {
    expect(detectDeviceCategory(430, 932, false, PHONE_UA, 1)).toBe("largePhone");
  });

  it("classifies iPad mini viewport (768px wide)", () => {
    expect(detectDeviceCategory(768, 1024, false, IPAD_UA, 4)).toBe("ipadMini");
  });

  it("classifies iPad Air viewport (810px wide)", () => {
    expect(detectDeviceCategory(810, 1080, false, IPAD_UA, 4)).toBe("ipadAir");
  });

  it("classifies iPad Pro 12.9 viewport (1024px wide)", () => {
    expect(detectDeviceCategory(1024, 1366, false, IPAD_UA, 4)).toBe("ipadPro");
  });

  it("classifies desktop (no touch)", () => {
    expect(detectDeviceCategory(1440, 900, false, DESKTOP_UA, 0)).toBe("desktop");
  });

  it("classifies Android phone viewport (430px wide)", () => {
    expect(detectDeviceCategory(430, 932, false, ANDROID_UA, 1)).toBe("largePhone");
  });

  it("identifies landscape mode for touch devices (iPad landscape detected by width + touch)", () => {
    // iPad in landscape with width >= 768 and touch = iPad category
    expect(detectDeviceCategory(1024, 768, true, IPAD_UA, 4)).toBe("ipadMini");
    expect(detectDeviceCategory(1080, 810, true, IPAD_UA, 4)).toBe("ipadAir");
    expect(detectDeviceCategory(1366, 1024, true, IPAD_UA, 4)).toBe("ipadPro");
  });

  it("identifies landscape mode for phone (width < 768 + touch = phone category)", () => {
    expect(detectDeviceCategory(568, 320, true, PHONE_UA, 1)).toBe("smallPhone");
    expect(detectDeviceCategory(852, 393, true, PHONE_UA, 1)).toBe("normalPhone");
    expect(detectDeviceCategory(932, 430, true, PHONE_UA, 1)).toBe("largePhone");
  });

  it("defaults to desktop when no user agent provided", () => {
    expect(detectDeviceCategory(1440, 900, false, undefined, 0)).toBe("desktop");
  });

  it("defaults to phone when no user agent but viewport < 768 and touch present", () => {
    expect(detectDeviceCategory(400, 800, false, undefined, 1)).toBe("normalPhone");
  });

  it("defaults to desktop when no user agent, no touch, large viewport", () => {
    expect(detectDeviceCategory(1440, 900, false, undefined, 0)).toBe("desktop");
  });
});

describe("detectLayoutMode", () => {
  it("narrow portrait for phone (width < 375)", () => {
    expect(detectLayoutMode("smallPhone", 320, 568, false)).toBe("narrowPortrait");
    expect(detectLayoutMode("normalPhone", 393, 852, false)).toBe("narrowPortrait");
  });

  it("wide portrait for tablet (width >= 768)", () => {
    expect(detectLayoutMode("ipadMini", 768, 1024, false)).toBe("widePortrait");
    expect(detectLayoutMode("ipadAir", 810, 1080, false)).toBe("widePortrait");
    expect(detectLayoutMode("ipadPro", 1024, 1366, false)).toBe("widePortrait");
  });

  it("wide portrait for desktop (width >= 768)", () => {
    expect(detectLayoutMode("desktop", 1440, 900, false)).toBe("widePortrait");
  });

  it("narrow portrait for desktop (width < 375)", () => {
    expect(detectLayoutMode("desktop", 320, 568, false)).toBe("narrowPortrait");
  });

  it("phone landscape for all phone categories", () => {
    expect(detectLayoutMode("smallPhone", 568, 320, true)).toBe("phoneLandscape");
    expect(detectLayoutMode("normalPhone", 852, 393, true)).toBe("phoneLandscape");
    expect(detectLayoutMode("largePhone", 932, 430, true)).toBe("phoneLandscape");
  });

  it("tablet landscape for all tablet categories", () => {
    expect(detectLayoutMode("ipadMini", 1024, 768, true)).toBe("tabletLandscape");
    expect(detectLayoutMode("ipadAir", 1080, 810, true)).toBe("tabletLandscape");
    expect(detectLayoutMode("ipadPro", 1366, 1024, true)).toBe("tabletLandscape");
  });

  it("desktop landscape for desktop category", () => {
    expect(detectLayoutMode("desktop", 1920, 1080, true)).toBe("desktopLandscape");
  });
});
