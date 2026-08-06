import assert from "node:assert/strict";
import test from "node:test";
import { normalizePostgresConnectionString } from "./connection-string";

const base = "postgresql://example-user:example-password@ep-development.example.neon.tech/example-db";

for (const mode of ["require", "prefer", "verify-ca"]) {
  test(`normalizes warning-producing sslmode=${mode}`, () => {
    const normalized = new URL(normalizePostgresConnectionString(`${base}?sslmode=${mode}`));
    assert.equal(normalized.searchParams.get("sslmode"), "verify-full");
  });
}

test("preserves explicit verify-full", () => {
  assert.equal(normalizePostgresConnectionString(`${base}?sslmode=verify-full`), `${base}?sslmode=verify-full`);
});

test("adds secure verification when sslmode is absent", () => {
  const normalized = new URL(normalizePostgresConnectionString(`${base}?channel_binding=require`));
  assert.equal(normalized.searchParams.get("sslmode"), "verify-full");
  assert.equal(normalized.searchParams.get("channel_binding"), "require");
});

test("preserves existing uselibpqcompat while making TLS mode explicit", () => {
  const normalized = new URL(normalizePostgresConnectionString(`${base}?uselibpqcompat=true&sslmode=require`));
  assert.equal(normalized.searchParams.get("uselibpqcompat"), "true");
  assert.equal(normalized.searchParams.get("sslmode"), "verify-full");
});

test("does not change endpoint, credentials or database and does not log the connection string", () => {
  const original = new URL(`${base}?sslmode=require`);
  const calls: unknown[][] = [];
  const previous = console.log;
  console.log = (...args: unknown[]) => { calls.push(args); };
  try {
    const normalized = new URL(normalizePostgresConnectionString(original.toString()));
    assert.equal(normalized.host, original.host);
    assert.equal(normalized.username, original.username);
    assert.equal(normalized.password, original.password);
    assert.equal(normalized.pathname, original.pathname);
  } finally { console.log = previous; }
  assert.deepEqual(calls, []);
});
