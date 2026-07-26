import assert from "node:assert/strict";
import test from "node:test";
import { formatPrizeCurrency, normalizePrizeCurrency, normalizePrizeCurrencyForType, requirePrizeCurrency } from "./prize-currency";

test("supported ISO prize currencies are accepted", () => {
  for (const currency of ["DKK", "USD", "EUR", "GBP"] as const) {
    assert.equal(normalizePrizeCurrency(currency), currency);
  }
});

test("legacy currency labels are normalized", () => {
  assert.equal(normalizePrizeCurrency("Dollars"), "USD");
  assert.equal(normalizePrizeCurrency("Dollar"), "USD");
  assert.equal(normalizePrizeCurrency("US Dollars"), "USD");
  assert.equal(normalizePrizeCurrency("Kroner"), "DKK");
  assert.equal(normalizePrizeCurrency("DKK kr"), "DKK");
  assert.equal(normalizePrizeCurrency("Euro"), "EUR");
  assert.equal(normalizePrizeCurrency("Euros"), "EUR");
  assert.equal(normalizePrizeCurrency("Pund"), "GBP");
});

test("unknown legacy data never crashes currency formatting", () => {
  assert.doesNotThrow(() => formatPrizeCurrency(100000, "Dollars from elsewhere"));
  assert.match(formatPrizeCurrency(100000, "Dollars from elsewhere"), /100\.000/);
});

test("cash currency validation rejects unknown or empty values", () => {
  assert.throws(() => requirePrizeCurrency("Credits"), /Vælg en gyldig valuta/);
  assert.throws(() => requirePrizeCurrency(""), /Vælg en gyldig valuta/);
});

test("currency formatting uses Danish number formatting", () => {
  assert.match(formatPrizeCurrency(100000, "USD"), /100\.000/);
});

test("non-cash prizes ignore submitted currency values", () => {
  assert.equal(normalizePrizeCurrencyForType("ITEM", "Dollars"), null);
  assert.equal(normalizePrizeCurrencyForType("CASH", "Dollars"), "USD");
});
