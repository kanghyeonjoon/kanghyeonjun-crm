import {createClient} from '@supabase/supabase-js';
export function diagnosisStore(){
 const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!key)throw new Error('diagnosis_storage_not_configured');
 return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
