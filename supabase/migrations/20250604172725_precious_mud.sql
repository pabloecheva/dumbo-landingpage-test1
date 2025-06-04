/*
  # Add example files to demonstrate file types and organization

  1. Changes
    - Add example files to demonstrate different file types
    - Show proper file organization within contexts
    - Demonstrate file metadata storage
*/

-- Function to create example files for a new user
CREATE OR REPLACE FUNCTION create_example_files()
RETURNS trigger AS $$
DECLARE
  context_id uuid;
BEGIN
  -- Create a "Getting Started" context
  INSERT INTO contexts (name, user_id)
  VALUES ('Getting Started', NEW.id)
  RETURNING id INTO context_id;

  -- Add example files
  INSERT INTO files (name, context_id, user_id, size, type, path) VALUES
    ('welcome.md', context_id, NEW.id, 1024, 'text/markdown', NEW.id || '/' || context_id || '/welcome.md'),
    ('example.csv', context_id, NEW.id, 2048, 'text/csv', NEW.id || '/' || context_id || '/example.csv'),
    ('data.json', context_id, NEW.id, 512, 'application/json', NEW.id || '/' || context_id || '/data.json'),
    ('notes.txt', context_id, NEW.id, 256, 'text/plain', NEW.id || '/' || context_id || '/notes.txt');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add example files for new users
DROP TRIGGER IF EXISTS create_example_files_trigger ON auth.users;
CREATE TRIGGER create_example_files_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_example_files();