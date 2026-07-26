import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const commandCenterSource = readFileSync("app/competition/events/[id]/page.tsx", "utf8");
const actionsSource = readFileSync("app/competition/eventos-actions.ts", "utf8");

test("single-result function formAction does not put business data on the submit button", () => {
  const formActionIndex = commandCenterSource.indexOf("formAction={saveOneAction}");
  const buttonStart = commandCenterSource.lastIndexOf("<button", formActionIndex);
  const buttonEnd = commandCenterSource.indexOf("</button>", formActionIndex);
  const button = commandCenterSource.slice(buttonStart, buttonEnd + "</button>".length);
  assert.ok(button);
  assert.doesNotMatch(button, /\bname=/);
  assert.doesNotMatch(button, /\bvalue=/);
});

test("result rows submit stable identifiers outside the submit button", () => {
  assert.match(commandCenterSource, /name="competitionId" value=\{competition\.id\}/);
  assert.match(commandCenterSource, /name="participantId" value=\{participant\.id\}/);
  assert.match(commandCenterSource, /saveResultAction\.bind\(null, competition\.id, participant\.id\)/);
});

test("single-result action still saves time, points and preserves the results tab", () => {
  assert.match(actionsSource, /finishTimeMs: row\.finishTimeMs/);
  assert.match(actionsSource, /points: row\.points/);
  assert.match(actionsSource, /\?tab=results&saved=results#resultater/);
  assert.match(actionsSource, /Resultatet er låst og kan ikke ændres/);
});
