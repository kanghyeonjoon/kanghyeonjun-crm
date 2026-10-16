"use client";
import Link from 'next/link';
import {usePathname,useSearchParams} from 'next/navigation';
import {Building2,FileText,ChartNoAxesCombined,ClipboardList,BookOpen,Clapperboard,Images,LayoutDashboard,CalendarDays,Landmark,Wallet} from 'lucide-react';
import {activeWorkspaceItem,workspaceGroups} from '@/lib/workspace-navigation';
const icons={columns:BookOpen,shorts:Clapperboard,cardnews:Images,hospitals:Building2,proposals:FileText,opportunities:ChartNoAxesCombined,diagnoses:ClipboardList,overview:LayoutDashboard,plans:CalendarDays,assets:Landmark,mindset:BookOpen,ledger:Wallet};
export default function WorkspaceNavigation({role,counts}:{role:string;counts?:readonly number[]}){
 const path=usePathname();const params=useSearchParams();const active=activeWorkspaceItem(path,params.get('tab'));
 return <nav className="workspace-navigation" aria-label="워크스페이스 메뉴">{workspaceGroups.filter(g=>g.id!=='finance'||role==='owner').map(group=><section key={group.id} className="workspace-nav-section" data-active={group.items.some(i=>i.id===active)||undefined} aria-label={group.label}>
 <h2 className="workspace-nav-heading">{group.label}</h2>{group.items.map(item=>{const Icon=icons[item.id];const countIndex=['hospitals','proposals','opportunities'].indexOf(item.id);const body=<><Icon size={18} aria-hidden="true"/><span className="erp-nav-label">{item.label}</span>{counts&&countIndex>=0&&<span className="erp-nav-count">{counts[countIndex]?.toLocaleString('ko-KR')}</span>}</>;return 'external' in item?<a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" title="쇼츠 제작: 이 기기에서 로컬 앱을 실행한 후 이용">{body}</a>:<Link key={item.id} href={item.href} title={item.label} aria-label={item.label} aria-current={active===item.id?'page':undefined}>{body}</Link>;})}</section>)}</nav>;
}
