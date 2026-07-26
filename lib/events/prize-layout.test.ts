import assert from "node:assert/strict";
import test from "node:test";
import {
  getPrizeFieldVisibility,
  PRIZE_COMMAND_CENTER_GRID_CLASS,
  PRIZE_FIELD_CLASS,
  PRIZE_FORM_GRID_CLASS,
  PRIZE_LABEL_CLASS,
} from "./prize-layout";

test("prize form layout uses responsive columns with shrink-safe full-width fields", () => {
  assert.match(PRIZE_FORM_GRID_CLASS, /grid-cols-1/);
  assert.match(PRIZE_FORM_GRID_CLASS, /sm:grid-cols-2/);
  assert.match(PRIZE_FORM_GRID_CLASS, /min-w-0/);
  assert.match(PRIZE_FIELD_CLASS, /w-full/);
  assert.match(PRIZE_FIELD_CLASS, /min-w-0/);
  assert.match(PRIZE_LABEL_CLASS, /min-w-0/);
});

test("prize form and list columns cannot overflow each other", () => {
  assert.match(PRIZE_COMMAND_CENTER_GRID_CLASS, /grid-cols-1/);
  assert.match(PRIZE_COMMAND_CENTER_GRID_CLASS, /minmax\(0,520px\)/);
  assert.match(PRIZE_COMMAND_CENTER_GRID_CLASS, /minmax\(0,1fr\)/);
});

test("prize type only exposes relevant optional fields", () => {
  assert.deepEqual(getPrizeFieldVisibility("CASH"), { amount: true, item: false, sponsor: false, award: false });
  assert.deepEqual(getPrizeFieldVisibility("TROPHY"), { amount: false, item: true, sponsor: true, award: false });
  assert.deepEqual(getPrizeFieldVisibility("SPECIAL"), { amount: false, item: false, sponsor: true, award: true });
});
