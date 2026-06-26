-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant all privileges on all tables in public to anon and authenticated
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Enable RLS and add open policies for now (since we don't have user accounts yet)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for anon on trips" ON trips FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for anon on itinerary_days" ON itinerary_days FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE itinerary_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for anon on itinerary_activities" ON itinerary_activities FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for anon on checklists" ON checklists FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for anon on checklist_items" ON checklist_items FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE flight_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for anon on flight_alerts" ON flight_alerts FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE flight_price_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for anon on flight_price_snapshots" ON flight_price_snapshots FOR ALL TO anon USING (true) WITH CHECK (true);
