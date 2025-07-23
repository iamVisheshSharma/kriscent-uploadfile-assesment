import { SUPABASE_ANNON_KEY, SUPABASE_URL } from '@env';
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANNON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
