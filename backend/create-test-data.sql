-- Create historical snapshots for momentum calculation
INSERT INTO snapshots (artist_id, snapshot_date, popularity, followers)
VALUES 
-- Taylor Swift - 14 days ago
('06HL4z0CvFAxyc27GXpf02', CURRENT_DATE - INTERVAL '14 days', 97, 140000000),
-- Taylor Swift - 7 days ago
('06HL4z0CvFAxyc27GXpf02', CURRENT_DATE - INTERVAL '7 days', 98, 140500000),
-- The Weeknd - 14 days ago  
('1Xyo4u8uXC1ZmMpatF05PJ', CURRENT_DATE - INTERVAL '14 days', 95, 108000000),
-- The Weeknd - 7 days ago
('1Xyo4u8uXC1ZmMpatF05PJ', CURRENT_DATE - INTERVAL '7 days', 96, 108500000),
-- Bad Bunny - 14 days ago
('4q3ewBCX7sLwd24euuV69X', CURRENT_DATE - INTERVAL '14 days', 99, 97000000),
-- Bad Bunny - 7 days ago
('4q3ewBCX7sLwd24euuV69X', CURRENT_DATE - INTERVAL '7 days', 100, 98000000),
-- Drake - 14 days ago
('3TVXtAsR1Inumwj472S9r4', CURRENT_DATE - INTERVAL '14 days', 98, 99500000),
-- Drake - 7 days ago
('3TVXtAsR1Inumwj472S9r4', CURRENT_DATE - INTERVAL '7 days', 99, 100000000),
-- Ariana Grande - 14 days ago
('66CXWjxzNUsdJxJ2JdwvnR', CURRENT_DATE - INTERVAL '14 days', 91, 105000000),
-- Ariana Grande - 7 days ago
('66CXWjxzNUsdJxJ2JdwvnR', CURRENT_DATE - INTERVAL '7 days', 92, 105800000),
-- Justin Bieber - 14 days ago
('1uNFoZAHBGtllmzznpCI3s', CURRENT_DATE - INTERVAL '14 days', 96, 83000000),
-- Justin Bieber - 7 days ago
('1uNFoZAHBGtllmzznpCI3s', CURRENT_DATE - INTERVAL '7 days', 96, 83400000);
