import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jxkbupsmbujlotleyfwt.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4a2J1cHNtYnVqbG90bGV5Znd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNjQ4NTcsImV4cCI6MjA2ODc0MDg1N30.MWZMB13ljEM9145UwV12l3CElBy-ePspX0uXHHAiaJQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
