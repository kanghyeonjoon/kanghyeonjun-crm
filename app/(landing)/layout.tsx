import "./landing.css";
import ChatWidget from "@/components/ChatWidget";
import FloatingContact from "@/components/FloatingContact";
export const metadata = {title:"몽PD 병원 유튜브 30분 무료진단",description:"병원 유튜브 채널 설계와 제작, 30분 무료진단",robots:{index:true,follow:true}};
export default function LandingLayout({children}:{children:React.ReactNode}) {return <div className="min-h-screen bg-paper text-ink antialiased"><header className="border-b border-slate-200 bg-white"><nav aria-label="몽PD 메뉴" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4"><a href="/" className="text-xl font-black text-navy">몽PD</a><div className="flex items-center gap-5 text-sm font-bold"><a href="/columns" className="py-3">칼럼</a><a href="/diagnosis" className="rounded-full bg-accent px-4 py-3 text-white">무료진단</a></div></nav></header>{children}<ChatWidget /><FloatingContact /></div>;}
