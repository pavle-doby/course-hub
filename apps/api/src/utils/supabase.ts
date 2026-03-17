import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

export const supabase = createClient(
  env.SUPABASE_URL as string,
  env.SUPABASE_API_KEY as string
);
