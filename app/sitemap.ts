import type {MetadataRoute} from 'next';
import {publicColumns} from '@/lib/public-columns';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const entries:MetadataRoute.Sitemap=[{url:'https://mongpd.com/'},{url:'https://mongpd.com/columns'},{url:'https://mongpd.com/diagnosis'},{url:'https://mongpd.com/privacy'}];
 // Deterministic batches avoid Supabase's per-request row limit omitting older articles.
 for(let offset=0;;offset+=500){
  const {data,error}=await publicColumns().from('columns').select('id,updated_at').eq('status','published').order('id').range(offset,offset+499);
  if(error)throw new Error('Sitemap data unavailable');
  entries.push(...(data||[]).map(r=>({url:`https://mongpd.com/columns/${r.id}`,lastModified:r.updated_at})));
  if(!data||data.length<500)break;
 }
 return entries;
}
