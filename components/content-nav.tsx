import Link from 'next/link';
import {Clapperboard, Images} from 'lucide-react';
export default function ContentNav(){return <><a href="http://127.0.0.1:4177/" target="_blank" rel="noopener noreferrer" title="이 맥북에서 쇼츠 앱을 실행한 후 열어주세요"><Clapperboard size={18} aria-hidden="true"/><span className="erp-nav-label">쇼츠 제작 ↗</span></a><Link href="/workspace/cardnews" title="카드뉴스"><Images size={18} aria-hidden="true"/><span className="erp-nav-label">카드뉴스</span></Link></>;}
