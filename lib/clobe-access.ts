import 'server-only';
import {requireMember} from './access';
export async function clobeOwner(){const a=await requireMember();if(a.role!=='owner'||a.user.email?.toLowerCase()!=='dkwk302@naver.com')throw new Error('연결 소유자만 이용할 수 있습니다.');return a;}
