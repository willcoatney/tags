-- Add photo_type to project_photos to distinguish pre-work vs completion photos
ALTER TABLE project_photos
  ADD COLUMN IF NOT EXISTS photo_type TEXT NOT NULL DEFAULT 'pre_work'
  CHECK (photo_type IN ('pre_work', 'completion'));
