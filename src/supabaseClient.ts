import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uosbethepnjrewxiinsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvc2JldGhlcG5qcmV3eGlpbnNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NzkxNzksImV4cCI6MjA1ODA1NTE3OX0.UsgXqATWW5EN6tRjACEu-QLoFnwlNpQ2depEhvKThT4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
