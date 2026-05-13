import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'sb_publishable_ivzyV2UdvN7hpV6KFOX5_g_Islb5hEU';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cWNlamtvcW1pdmxxZmZqcXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzkwNDksImV4cCI6MjA5NDI1NTA0OX0.oHXgXmjJuM8SqH2nwIOzsJH5HEQnM9ApbRom2SqTwLA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
