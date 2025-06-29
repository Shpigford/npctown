-- This migration can be used to test the single citizen scenario
-- Run this to delete all NPCs except one:

-- DELETE FROM npcs WHERE name NOT IN (
--   SELECT name FROM npcs ORDER BY created_at LIMIT 1
-- );

-- Or to start with just one specific NPC:
-- DELETE FROM npcs;
-- INSERT INTO npcs (name, x, y, personality, stats, relationships) VALUES
--   ('Lonely Larry', 10, 10, 
--    '{"traits": ["introverted", "creative", "cautious"], "likes": ["quiet time", "building"], "dislikes": ["loneliness", "crowds"]}',
--    '{"health": 100, "energy": 100, "hunger": 0, "social": 20}',
--    '[]');