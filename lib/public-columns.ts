import 'server-only';
import { createClient } from '@supabase/supabase-js';
// A cookie-free anonymous client keeps CRM draft access out of public routes.
export function publicColumns() {
 return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
}
