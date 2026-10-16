import {requireMember} from '@/lib/access';
import ColumnsAdmin from '@/components/columns-admin';
import type {ColumnRow} from '@/lib/columns';
export const dynamic='force-dynamic';
export default async function ColumnsAdminPage(){
 const {client,user,role}=await requireMember();
 const {data,error}=await client.from('columns').select('*').order('updated_at',{ascending:false}).limit(500);
 return <ColumnsAdmin rows={(data||[]) as ColumnRow[]} email={user.email||''} role={role} failed={Boolean(error)}/>;
}
