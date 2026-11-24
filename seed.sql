-- Made-up starting records. db.js runs this file only when the records table is empty
-- the very first time the database is created.
INSERT INTO records (title, category, description, status) VALUES
  ('Broken classroom light', 'Electrical', 'The light in Room B12 does not switch on.', 'Pending'),
  ('Leaking tap in hostel bathroom', 'Plumbing', 'The hot water tap in Block C bathroom drips all day and night.', 'In progress'),
  ('Broken chair in lecture theatre', 'Furniture', 'Seat 14 in Lecture Theatre 2 has a cracked backrest and is unsafe.', 'Pending'),
  ('Flickering corridor lights', 'Electrical', 'Lights along the ground floor corridor of the Science block keep flickering.', 'Completed'),
  ('Blocked sink in staff kitchen', 'Plumbing', 'Water drains very slowly from the sink in the Admin block kitchen.', 'In progress'),
  ('Loose door handle on Lab 3', 'Carpentry', 'The door handle on Computer Lab 3 is loose and falls off when pulled.', 'Pending'),
  ('Overgrown grass near library', 'Grounds', 'The grass along the path to the library is very long and hides the path edge.', 'Completed'),
  ('Wobbly desk in Room A04', 'Furniture', 'The front desk in Room A04 wobbles because one leg is shorter than the others.', 'Pending'),
  ('No power at socket in library', 'Electrical', 'The wall socket beside study table 6 on the library first floor has no power.', 'In progress');
