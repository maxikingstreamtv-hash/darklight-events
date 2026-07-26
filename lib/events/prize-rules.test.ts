import assert from "node:assert/strict";
import test from "node:test";
import {
  assertPrizePartLimit,
  canAddPrizePart,
  canDeletePrize,
  getPublicPrizes,
  getPublicPrizeGroups,
  groupPrizesByPlacement,
  hasPrizeAssignment,
  prizeIdentity,
} from "./prize-rules";

test("hidden prizes are not public", () => assert.deepEqual(getPublicPrizes([{ id: "visible", active: true }, { id: "hidden", active: false }]).map((prize) => prize.id), ["visible"]));
test("the same prize assignment is detected before duplication", () => assert.equal(hasPrizeAssignment([{ participantId: "p1" }], "p1"), true));
test("prize deletion respects RBAC", () => {
  assert.equal(canDeletePrize("ADMIN"), true);
  assert.equal(canDeletePrize("EVENT_MANAGER"), false);
});
test("multiple prize types can share the same placement and remain separately sorted", () => {
  const prizes = [
    { id: "cash", placement: 1, sortOrder: 20, title: "Kontant" },
    { id: "trophy", placement: 1, sortOrder: 10, title: "Trofæ" },
    { id: "vip", placement: 1, sortOrder: 30, title: "VIP" },
    { id: "special", placement: null, sortOrder: 5, title: "Fair Play" },
  ];
  const groups = groupPrizesByPlacement(prizes);
  assert.deepEqual(groups.map((group) => group.label), ["1. plads", "Særpræmier"]);
  assert.deepEqual(groups[0].prizes.map((prize) => prize.id), ["trophy", "cash", "vip"]);
  assert.deepEqual(groups[1].prizes.map((prize) => prize.id), ["special"]);
});
test("the same participant may receive different prizes but not the same prize twice", () => {
  assert.equal(hasPrizeAssignment([{ participantId: "p1" }], "p1"), true);
  assert.equal(hasPrizeAssignment([], "p1"), false);
});
test("placements 1, 2 and 6 each allow up to five independent prize parts", () => {
  for (const placement of [1, 2, 6]) {
    for (let count = 0; count < 5; count += 1) assert.equal(canAddPrizePart(count, placement), true);
    assert.equal(canAddPrizePart(5, placement), false);
    assert.throws(() => assertPrizePartLimit(5, placement), /maksimale antal på 5 præmiedele/);
  }
});
test("special prizes without placement are not subject to the shared five-part limit", () => {
  assert.equal(canAddPrizePart(50, null), true);
});
test("individual prize operations identify the record by prizeId, not placement", () => {
  assert.deepEqual(prizeIdentity("prize-2"), { id: "prize-2" });
});
test("editing or deleting one prize part leaves siblings on the same placement intact", () => {
  const prizes = [
    { id: "cash", placement: 1, title: "Kontant" },
    { id: "trophy", placement: 1, title: "Trofæ" },
    { id: "vip", placement: 1, title: "VIP" },
  ];
  const edited = prizes.map((prize) => prize.id === "trophy" ? { ...prize, title: "Champion Trophy" } : prize);
  assert.deepEqual(edited.map((prize) => prize.title), ["Kontant", "Champion Trophy", "VIP"]);
  assert.deepEqual(edited.filter((prize) => prize.id !== "trophy").map((prize) => prize.id), ["cash", "vip"]);
});
test("public prize filtering keeps every active part on the same placement", () => {
  const prizes = [
    { id: "cash", placement: 1, active: true },
    { id: "trophy", placement: 1, active: true },
    { id: "hidden", placement: 1, active: false },
  ];
  assert.deepEqual(getPublicPrizes(prizes).map((prize) => prize.id), ["cash", "trophy"]);
});
test("public groups show active prizes for placements 1, 2 and 6 plus special prizes", () => {
  const prizes = [
    { id: "p1-a", placement: 1, active: true, sortOrder: 10, title: "Kontant" },
    { id: "p1-b", placement: 1, active: true, sortOrder: 20, title: "Trofæ" },
    { id: "p2", placement: 2, active: true, sortOrder: 10, title: "Item" },
    { id: "p6", placement: 6, active: true, sortOrder: 10, title: "VIP" },
    { id: "special", placement: null, active: true, sortOrder: 10, title: "Fair Play" },
    { id: "hidden", placement: 1, active: false, sortOrder: 30, title: "Skjult" },
  ];
  const groups = getPublicPrizeGroups(prizes, true);
  assert.deepEqual(groups.map((group) => group.label), ["1. plads", "2. plads", "6. plads", "Særpræmier"]);
  assert.deepEqual(groups[0].prizes.map((prize) => prize.id), ["p1-a", "p1-b"]);
});
test("public groups are hidden when the prize module is disabled and cap numeric placements at five", () => {
  const prizes = Array.from({ length: 6 }, (_, index) => ({ id: `p${index}`, placement: 1, active: true, sortOrder: index, title: `Prize ${index}` }));
  assert.equal(getPublicPrizeGroups(prizes, true)[0].prizes.length, 5);
  assert.deepEqual(getPublicPrizeGroups(prizes, false), []);
});
