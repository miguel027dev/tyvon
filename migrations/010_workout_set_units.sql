-- Keep timed exercises distinct from repetition counts.
ALTER TABLE tyvon_workout_sets ADD COLUMN unit TEXT NOT NULL DEFAULT 'reps'
    CHECK (unit IN ('reps', 'seconds'));
-- Existing plank entries were recorded in seconds by the session UI.
UPDATE tyvon_workout_sets SET unit = 'seconds'
    WHERE exercise_id = 'plank' OR lower(exercise_name) LIKE '%prancha%';
