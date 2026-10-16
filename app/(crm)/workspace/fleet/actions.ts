'use server';
import {requireMember} from '@/lib/access';
import snapshot from '@/lib/fleet-snapshot.json';
export async function readFleetStatus(){
 const {role}=await requireMember();
 if(role!=='owner')throw new Error('소유자만 장비 현황을 조회할 수 있습니다.');
 return snapshot;
}
