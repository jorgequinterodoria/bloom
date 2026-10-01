import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("manifest", () => {
  it("campos mínimos de instalación", () => {
    const m = manifest();
    expect(m.name).toContain("Bloom");
    expect(m.short_name).toBe("Bloom");
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
    expect(m.lang).toBe("es");
    expect(m.icons?.[0]?.src).toBe("/icons/icon.svg");
    expect(m.icons?.[0]?.sizes).toBe("any");
  });
});
