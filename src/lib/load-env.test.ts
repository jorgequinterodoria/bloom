import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadEnv } from "./load-env";

const KEYS = [
  "BLOOM_TEST_QUOTED",
  "BLOOM_TEST_EXPORT",
  "BLOOM_TEST_EXISTING",
] as const;

let dir: string;
let file: string;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "bloom-load-env-"));
  file = path.join(dir, ".env");
  for (const key of KEYS) saved[key] = process.env[key];
});

afterEach(() => {
  for (const key of KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
  rmSync(dir, { recursive: true, force: true });
});

describe("loadEnv", () => {
  it('parsea KEY="value" y quita las comillas', () => {
    writeFileSync(file, 'BLOOM_TEST_QUOTED="hello world"\n');
    loadEnv(file);
    expect(process.env.BLOOM_TEST_QUOTED).toBe("hello world");
  });

  it("soporta el prefijo export", () => {
    writeFileSync(file, "export BLOOM_TEST_EXPORT=bar\n");
    loadEnv(file);
    expect(process.env.BLOOM_TEST_EXPORT).toBe("bar");
  });

  it("no sobreescribe una clave ya existente en process.env", () => {
    process.env.BLOOM_TEST_EXISTING = "original";
    writeFileSync(file, "BLOOM_TEST_EXISTING=cambiado\n");
    loadEnv(file);
    expect(process.env.BLOOM_TEST_EXISTING).toBe("original");
  });

  it("archivo inexistente no lanza", () => {
    expect(() => loadEnv("/nonexistent/.env")).not.toThrow();
  });
});
