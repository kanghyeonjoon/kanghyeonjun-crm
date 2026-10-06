import {notFound} from 'next/navigation';
import Link from 'next/link';
import {cache} from 'react';
import {publicColumns} from '@/lib/public-columns';
import ColumnBody from '@/components/ColumnBody';
import {z} from 'zod';
import {articleSchema,columnBlocks,jsonLd} from '@/lib/column-content';
export const dynamic='force-dynamic';
const getColumn=cache(async(id:string)=>{
 if(!z.uuid().safeParse(id).success)notFound();
 const {data,error}=await publicColumns().from('columns').select('id,title,summary,body,category,image_url,published_at,updated_at').eq('id',id).eq('status','published').maybeSingle();
 if(error)throw new Error('칼럼을 불러오지 못했습니다.');
 if(!data)notFound();return data;
});
export async function generateMetadata({params}:{params:Promise<{id:string}>}){
 const r=await getColumn((await params).id);return {title:`${r.title} | 몽PD 칼럼`,description:r.summary,alternates:{canonical:`https://mongpd.com/columns/${r.id}`},openGraph:{title:r.title,description:r.summary,type:'article',url:`https://mongpd.com/columns/${r.id}`,locale:'ko_KR',publishedTime:r.published_at,modifiedTime:r.updated_at,...(r.image_url?{images:[r.image_url]}:{})}};
}
export default async function Column({params}:{params:Promise<{id:string}>}){
 const r=await getColumn((await params).id);const headings=columnBlocks(r.body).filter(b=>b.type==='h2');return <main className="mx-auto max-w-3xl px-5 py-12 sm:py-20"><Link href="/columns" className="text-sm font-bold text-accent">← 칼럼 목록</Link><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(articleSchema(r))}}/><article className="mt-8"><p className="text-sm font-bold text-accent">{r.category}</p><h1 className="mt-4 break-words text-3xl font-black leading-snug sm:text-4xl">{r.title}</h1><p className="mt-5 text-sm text-ink-soft"><a href="/">몽PD</a> · 게시 <time dateTime={r.published_at}>{new Date(r.published_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}</time> · 수정 <time dateTime={r.updated_at}>{new Date(r.updated_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}</time></p>{r.summary&&<section aria-label="핵심 답변" className="my-7 rounded-xl bg-slate-50 p-6"><h2 className="mb-2 text-sm font-bold text-accent">핵심 답변</h2><p className="text-lg leading-8 text-ink-soft">{r.summary}</p></section>}{r.image_url&&<img src={r.image_url} alt={r.title} className="my-8 w-full rounded-2xl"/>}<nav aria-label="칼럼 목차" className="my-8">{headings.length>0&&<><h2 className="font-bold">이 글에서 다루는 내용</h2><ul className="mt-3 space-y-2">{headings.map(h=><li key={h.id}><a href={`#${h.id}`} className="text-accent underline">{h.text}</a></li>)}</ul></>}</nav><ColumnBody body={r.body}/></article><section className="mt-14 rounded-2xl bg-navy p-8 text-center text-white"><h2 className="text-xl font-bold">병원에 맞는 채널 방향을 확인해 보세요</h2><a href="/diagnosis" className="mt-5 inline-block rounded-full bg-accent px-7 py-4 font-bold">무료진단 신청하기</a></section></main>;
}
