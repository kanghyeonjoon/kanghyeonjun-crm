import Link from 'next/link';
import {notFound} from 'next/navigation';
import {publicColumns} from '@/lib/public-columns';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
 const p=await searchParams;const category=['병원 마케팅','유튜브 운영'].includes(p.category||'')?p.category!:'';
 const page=Number.isFinite(Number(p.page))?Math.max(1,Math.floor(Number(p.page))||1):1;
 const query=new URLSearchParams();if(category)query.set('category',category);if(page>1)query.set('page',String(page));
 return {title:`${category||'병원 마케팅·유튜브 운영'} 칼럼${page>1?` · ${page}페이지`:''} | 몽PD`,description:'병원 마케팅과 유튜브 채널 운영을 위한 몽PD 칼럼.',alternates:{canonical:'https://mongpd.com/columns'+(query.size?'?'+query:'')}};
}
export default async function Columns({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
 const p=await searchParams;const category=['병원 마케팅','유튜브 운영'].includes(p.category||'')?p.category!:'';
 const requested=Number(p.page);const page=Number.isFinite(requested)?Math.max(1,Math.floor(requested)||1):1;
 let query=publicColumns().from('columns').select('id,title,summary,category,image_url,published_at',{count:'exact'}).eq('status','published');
 if(category)query=query.eq('category',category);
 const {data,error,count}=await query.order('published_at',{ascending:false}).order('id').range((page-1)*12,page*12-1);
 if(error?.code==='PGRST103'||(!error && page>Math.max(1,Math.ceil((count||0)/12))))notFound();
 const href=(n:number)=>'/columns?'+new URLSearchParams({category,page:String(n)});
 return <main className="mx-auto max-w-6xl px-5 py-14 sm:py-20"><p className="text-sm font-bold tracking-widest text-accent">MONGPD COLUMN</p><h1 className="mt-4 text-3xl font-black sm:text-5xl">병원 마케팅을 위한<br/>실무 인사이트</h1><p className="mt-5 text-ink-soft">병원 마케팅부터 유튜브 기획과 운영까지, 필요한 내용을 차근차근 전합니다.</p><nav aria-label="칼럼 분류" className="my-8 flex flex-wrap gap-3">{['','병원 마케팅','유튜브 운영'].map(c=><Link key={c} href={'/columns?'+new URLSearchParams({category:c})} aria-current={category===c?'page':undefined} className={`rounded-full border px-5 py-3 text-sm font-bold ${category===c?'bg-navy text-white':'bg-white'}`}>{c||'전체'}</Link>)}</nav>
 {error?<p role="alert" className="rounded-2xl border p-10">칼럼을 불러오지 못했습니다. 잠시 후 다시 방문해 주세요.</p>:data?.length?<div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{data.map(r=><Link href={`/columns/${r.id}`} key={r.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg">{r.image_url?<img src={r.image_url} alt="" loading="lazy" className="aspect-video w-full object-cover"/>:<div className="flex aspect-video items-center justify-center bg-navy text-2xl font-black text-white">몽PD 칼럼</div>}<div className="p-6"><p className="text-xs font-bold text-accent">{r.category}</p><h2 className="mt-3 text-xl font-extrabold">{r.title}</h2><p className="mt-3 line-clamp-3 text-sm leading-7 text-ink-soft">{r.summary}</p><p className="mt-5 text-xs text-ink-soft">{new Date(r.published_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})}</p></div></Link>)}</div>:<div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center"><h2 className="text-xl font-bold">칼럼을 준비하고 있습니다</h2><p className="mt-3 text-ink-soft">공개된 글이 등록되면 이곳에서 만나보실 수 있습니다.</p></div>}
 <nav aria-label="칼럼 페이지" className="mt-8 flex items-center justify-center gap-5">{page>1&&<Link href={href(page-1)} className="rounded border px-4 py-3">이전</Link>}<span>{page} / {Math.max(1,Math.ceil((count||0)/12))}</span>{page*12<(count||0)&&<Link href={href(page+1)} className="rounded border px-4 py-3">다음</Link>}</nav><section className="mt-14 rounded-2xl bg-navy p-8 text-center text-white"><h2 className="text-xl font-bold">우리 병원 채널은 어디부터 시작할까요?</h2><a href="/diagnosis" className="mt-5 inline-block rounded-full bg-accent px-7 py-4 font-bold text-white">무료진단 신청하기</a></section></main>;
}
