import Link from 'next/link';
import {requireMember} from '@/lib/access';
import {monthBounds} from '@/lib/finance';
import {connections} from '@/lib/granter-api';
import {readFinance} from './actions';
import GranterDashboard from '@/components/granter-dashboard';
export const dynamic='force-dynamic';
export const maxDuration=60;
export default async function Page(){const {user,role}=await requireMember();if(role!=='owner'||user.email?.toLowerCase()!=='dkwk302@naver.com')return <main><h1>재무 대시보드</h1><p>연결 소유자만 접근할 수 있습니다.</p><Link href="/workspace">CRM으로 돌아가기</Link></main>;const {month}=monthBounds();const initial=await readFinance({view:'overview',month,connection:'primary'});return <GranterDashboard initial={initial} month={month} companies={connections().map(({id,label})=>({id,label}))}/>;}
