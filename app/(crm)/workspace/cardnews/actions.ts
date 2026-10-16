'use server';
import {createHash} from 'node:crypto';
import {revalidatePath} from 'next/cache';
import {requireMember} from '@/lib/access';
import {assetInput,cardBucket} from '@/lib/cardnews';
export async function registerCardAsset(input:unknown){
 const {client}=await requireMember(true);const a=assetInput(input);
 const {data,error}=await client.storage.from(cardBucket).download(a.storage_path);
 if(error||!data)throw new Error('업로드 파일을 다시 읽지 못했습니다.');
 const b=Buffer.from(await data.arrayBuffer());
 if(b.length!==a.bytes||createHash('sha256').update(b).digest('hex')!==a.sha256)throw new Error('파일 크기 또는 SHA256 불일치');
 if(a.kind==='image'&&(b.length<24||b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||b.readUInt32BE(16)!==1080||b.readUInt32BE(20)!==1350))throw new Error('1080×1350 PNG가 아닙니다.');
 if(a.kind==='zip'&&b.subarray(0,4).toString('hex')!=='504b0304')throw new Error('ZIP 형식이 아닙니다.');
 const {error:insertError}=await client.from('cardnews_assets').insert({result_id:a.result_id,name:a.name,kind:a.kind,position:a.position,sha256:a.sha256,bytes:a.bytes,storage_path:a.storage_path});
 if(insertError){const {data:old}=await client.from('cardnews_assets').select('sha256').eq('result_id',a.result_id).eq('position',a.position).eq('kind',a.kind).maybeSingle();if(old?.sha256!==a.sha256)throw new Error('등록 실패: 기존 파일을 덮어쓰지 않습니다.');}
 revalidatePath('/workspace/cardnews');return {ok:true};
}
