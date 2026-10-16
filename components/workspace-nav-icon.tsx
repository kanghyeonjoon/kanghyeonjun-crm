import {Building2,FileText,ChartNoAxesCombined,Newspaper,Wallet,ClipboardCheck} from 'lucide-react';
const icons={'병원 관리':Building2,'제안서':FileText,'영업 진행':ChartNoAxesCombined,'칼럼 관리':Newspaper,'재무 관리':Wallet,'무료진단 신청':ClipboardCheck};
export default function WorkspaceNavIcon({label}:{label:string}){const Icon=icons[label as keyof typeof icons]??FileText;return <Icon size={18} strokeWidth={1.7} aria-hidden="true"/>;}
