-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE npcs;
ALTER PUBLICATION supabase_realtime ADD TABLE buildings;
ALTER PUBLICATION supabase_realtime ADD TABLE world_state;
ALTER PUBLICATION supabase_realtime ADD TABLE events;