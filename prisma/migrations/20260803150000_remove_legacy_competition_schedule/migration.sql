-- Remove the unused legacy scheduling schema. The legacy tables were verified
-- empty in production before this forward-only cleanup migration was created.
DROP TABLE IF EXISTS "ScheduleEntry";
DROP TABLE IF EXISTS "CompetitionSchedule";

DROP TYPE IF EXISTS "ScheduleEntryStatus";
DROP TYPE IF EXISTS "StartOrderMethod";
DROP TYPE IF EXISTS "BracketRound";
