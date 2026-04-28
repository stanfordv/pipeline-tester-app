-- Enable RLS on shapes table (if not already enabled)
ALTER TABLE shapes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts for anon role
CREATE POLICY "Allow inserts on shapes" ON shapes
FOR INSERT TO anon
WITH CHECK (true);

-- Also allow selects for anon role
CREATE POLICY "Allow selects on shapes" ON shapes
FOR SELECT TO anon
USING (true);

-- Allow updates for anon role
CREATE POLICY "Allow updates on shapes" ON shapes
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);

-- Allow deletes for anon role
CREATE POLICY "Allow deletes on shapes" ON shapes
FOR DELETE TO anon
USING (true);