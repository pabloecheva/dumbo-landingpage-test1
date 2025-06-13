/*
  # Fix contexts table RLS configuration

  1. Security Changes
    - Enable RLS on `contexts` table to match existing policies
    - Ensure policies are properly enforced for authenticated users

  The contexts table has RLS policies defined but RLS is not enabled, 
  which can cause fetch operations to fail. This migration enables RLS
  to match the existing policy configuration.
*/

-- Enable RLS on contexts table
ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;