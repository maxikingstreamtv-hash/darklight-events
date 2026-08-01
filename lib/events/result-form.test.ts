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

test("existing results are visibly editable with prefilled time and notes", () => {
  assert.match(commandCenterSource, /defaultValue=\{formatResultTime\(result\?\.finishTimeMs\)\}/);
  assert.match(commandCenterSource, /label="Noter" name="notes" defaultValue=\{result\?\.notes/);
  assert.match(commandCenterSource, /result \? "Gem ændringer" : "Gem resultat"/);
});

test("individual updates audit previous and next values without duplicating results", () => {
  assert.match(actionsSource, /where: \{ competitionId_participantId: \{ competitionId, participantId: row\.participantId \} \}/);
  assert.match(actionsSource, /action: existingResult \? "RESULT_UPDATED" : "RESULT_CREATED"/);
  assert.match(actionsSource, /previous: resultHistorySnapshot\(existingResult\)/);
  assert.match(actionsSource, /next: nextSnapshot/);
  assert.match(actionsSource, /prizeAssignmentsPreserved: true/);
});

test("result updates revalidate public ranking, podium, live and event pages", () => {
  for (const route of ["/rangliste", "/hall-of-fame", "/live-resultater", "/competition/live-center", "/events/[id]"]) {
    assert.match(actionsSource, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
