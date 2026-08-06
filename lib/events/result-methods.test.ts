import assert from "node:assert/strict";
import test from "node:test";
import { EVENT_RESULT_METHODS, assertValidResultConfiguration, isEventResultMethod, requiresPrivatePublication, suggestedResultFeatures } from "./result-methods";

test("alle resultatmetoder valideres og foreslår en konsistent kerne", () => {
  assert.equal(EVENT_RESULT_METHODS.length, 10);
  for (const method of EVENT_RESULT_METHODS) {
    assert.equal(isEventResultMethod(method), true);
    const features = suggestedResultFeatures(method);
    assert.doesNotThrow(() => assertValidResultConfiguration(method, features));
  }
});

test("ugyldige kritiske kombinationer afvises", () => {
  assert.throws(() => assertValidResultConfiguration("JUDGE_POINTS", { usesResults: false, usesBracket: false }));
  assert.throws(() => assertValidResultConfiguration("NONE", { usesResults: true, usesBracket: false }));
  assert.throws(() => assertValidResultConfiguration("BRACKET", { usesResults: true, usesBracket: false }));
});

test("kun dommer- og stemmemetoder kræver eksplicit publicering", () => {
  assert.equal(requiresPrivatePublication("JUDGE_AND_PUBLIC_VOTE"), true);
  assert.equal(requiresPrivatePublication("TIME_ONLY"), false);
});
