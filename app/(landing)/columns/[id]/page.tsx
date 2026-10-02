import {notFound} from 'next/navigation';
import Link from 'next/link';
import {cache} from 'react';
import {publicColumns} from '@/lib/public-columns';
import ColumnBody from '@/components/ColumnBody';
import {z} from 'zod';
export const dynamic='force-dynamic';
const getColumn=cache(async(id:string)=>{
 if(!z.uuid().safeParse(id).success)notFound();
 const {data,error}=await publicColumns().from('columns').select('id,title,summary,body,category,image_url,published_at').eq('id',id).eq('status','published').maybeSingle();
 if(error)throw new Error('칼럼을 불러오지 못했습니다.');
 if(!data)notFound();return data;
});
export async function generateMetadata({params}:{params:Promise<{id:string}>}){
 const r=await getColumn((await params).id);return {title:`${r.title} | 몽PD 칼럼`,description:r.summary,alternates:{canonical:`https://mongpd.com/columns/${r.id}`},openGraph:{title:r.title,description:r.summary,type:'article',publishedTime:r.published_at,...(r.image_url?{images:[r.image_url]}:{})}};
}
export default async function Column({params}:{params:Promise<{id:string}>}){
 const r=await getColumn((await params).id);return <main className="mx-auto max-w-3xl px-5 py-12 sm:py-20"><Link href="/columns" className="text-sm font-bold text-accent">← 칼럼 목록</Link><article className="mt-8"><p className="text-sm font-bold text-accent">{r.category}</p><h1 className="mt-4 break-words text-3xl font-black leading-snug sm:text-4xl">{r.title}</h1><p className="mt-5 text-sm text-ink-soft">몽PD · {new Date(r.published_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}</p>{r.summary&&<p className="my-7 border-l-4 border-accent pl-5 text-lg leading-8 text-ink-soft">{r.summary}</p>}{r.image_url&&<img src={r.image_url} alt={r.title} className="my-8 w-full rounded-2xl"/>}<ColumnBody body={r.body}/></article><section className="mt-14 rounded-2xl bg-navy p-8 text-center text-white"><h2 className="text-xl font-bold">병원에 맞는 채널 방향을 확인해 보세요</h2><a href="/diagnosis" className="mt-5 inline-block rounded-full bg-accent px-7 py-4 font-bold">무료진단 신청하기</a></section></main>;
}
