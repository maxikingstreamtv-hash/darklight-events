import assert from "node:assert/strict";
import test from "node:test";
import { serializeEventPrizeForClient } from "./prize-serialization";

class DecimalLike {
  constructor(private readonly value: string) {}
  toString() { return this.value; }
}

test("prize DTO converts Decimal amount to a string and normalizes currency", () => {
  const dto = serializeEventPrizeForClient({
    id: "prize-1",
    title: "Kontant",
    description: null,
    prizeType: "CASH",
    placement: 1,
    amount: new DecimalLike("10000.50"),
    currency: "Dollars",
    itemName: null,
    sponsorName: null,
    awardLabel: null,
    sortOrder: 10,
    active: true,
    winners: [],
  });
  assert.equal(dto.amount, "10000.50");
  assert.equal(dto.currency, "USD");
  assert.equal(Object.getPrototypeOf(dto), Object.prototype);
});

test("prize DTO omits Date fields and serializes winner relations as plain objects", () => {
  const source = {
    id: "prize-2",
    title: "Trofæ",
    description: "Champion",
    prizeType: "TROPHY",
    placement: 1,
    amount: null,
    currency: null,
    itemName: "Champion Trophy",
    sponsorName: null,
    awardLabel: null,
    sortOrder: 20,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    winners: [{
      id: "winner-1",
      participant: { id: "participant-1", name: "Spiller", userId: "user-1" },
      user: { id: "user-1", displayName: "Spiller", darklightId: "DL-1" },
      note: null,
    }],
  };
  const dto = serializeEventPrizeForClient(source);
  assert.equal("createdAt" in dto, false);
  assert.equal("updatedAt" in dto, false);
  assert.equal(Object.getPrototypeOf(dto.winners[0]), Object.prototype);
  assert.equal(Object.getPrototypeOf(dto.winners[0].participant!), Object.prototype);
});
