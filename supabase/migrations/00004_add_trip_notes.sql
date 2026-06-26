-- 00004_add_trip_notes.sql

-- Add a new column to store large free-form planning notes (scratchpad)
ALTER TABLE public.trips ADD COLUMN notes text;

COMMENT ON COLUMN public.trips.notes IS 'Free-form rich-text scratchpad for planning hotels, flights, and ideas';
