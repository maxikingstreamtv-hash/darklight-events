import assert from "node:assert/strict";
import test from "node:test";
import { formatResultTime, getResultDisplayValues, parseResultTime } from "./result-time";

test("parses supported human time formats", () => {
  assert.equal(parseResultTime("45"), 45_000);
  assert.equal(parseResultTime("01:32"), 92_000);
  assert.equal(parseResultTime("12:04.532"), 724_532);
  assert.equal(parseResultTime("01:10:22.450"), 4_222_450);
});

test("accepts empty time and rejects invalid or negative time", () => {
  assert.equal(parseResultTime(""), null);
  assert.throws(() => parseResultTime("1:75"), /Indtast tiden/);
  assert.throws(() => parseResultTime("-1"), /ikke være negativ/);
});

test("formats milliseconds for editing and display", () => {
  assert.equal(formatResultTime(92_000), "01:32");
  assert.equal(formatResultTime(4_222_450), "01:10:22.450");
});

test("display values contain only populated fields", () => {
  assert.deepEqual(getResultDisplayValues({ placement: 0, finishTimeMs: 92_000, points: null }), [{ label: "Tid", value: "01:32" }]);
  assert.deepEqual(getResultDisplayValues({ placement: 1, finishTimeMs: null, points: 250 }), [
    { label: "Placering", value: "1" },
    { label: "Point", value: "250" },
  ]);
});
