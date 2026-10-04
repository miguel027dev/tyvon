-- An unreported effort is unknown, not a measured RIR of 2 or 0.
-- Preserve historical values because their provenance cannot be inferred.
ALTER TABLE tyvon_workout_sets ALTER COLUMN rir DROP NOT NULL;
ALTER TABLE tyvon_workout_sets ALTER COLUMN rir DROP DEFAULT;
ALTER TABLE tyvon_workout_sets ALTER COLUMN target_rir DROP NOT NULL;
ALTER TABLE tyvon_workout_sets ALTER COLUMN target_rir DROP DEFAULT;
