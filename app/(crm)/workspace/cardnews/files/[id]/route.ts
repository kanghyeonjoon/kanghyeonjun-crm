import {requireMember} from '@/lib/access';
import {cardBucket} from '@/lib/cardnews';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const {client}=await requireMember();const {id}=await params;
 if(!/^[0-9a-f-]{36}$/.test(id))return new Response('Not found',{status:404});
 const {data:a}=await client.from('cardnews_assets').select('*').eq('id',id).maybeSingle();
 if(!a)return new Response('Not found',{status:404});
 const {data,error}=await client.storage.from(cardBucket).createSignedUrl(a.storage_path,60,{download:new URL(request.url).searchParams.has('download')?a.name:undefined});
 if(error||!data)return new Response('파일을 불러오지 못했습니다.',{status:503});
 return new Response(null,{status:302,headers:{Location:data.signedUrl,'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}});
}
