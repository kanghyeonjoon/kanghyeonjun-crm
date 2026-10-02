import "./landing.css";
import ChatWidget from "@/components/ChatWidget";
import FloatingContact from "@/components/FloatingContact";
export const metadata = {title:"몽PD 병원 유튜브 30분 무료진단",description:"병원 유튜브 채널 설계와 제작, 30분 무료진단",robots:{index:true,follow:true}};
export default function LandingLayout({children}:{children:React.ReactNode}) {return <div className="min-h-screen bg-paper text-ink antialiased">{children}<ChatWidget /><FloatingContact /></div>;}
