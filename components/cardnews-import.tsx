'use client';
import {createBrowserClient} from '@supabase/ssr';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {registerCardAsset} from '@/app/(crm)/workspace/cardnews/actions';
import {assetInput,cardBucket,cardId} from '@/lib/cardnews';
export default function CardnewsImport(){
 const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const router=useRouter();
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage('파일 대조 중…');try{
 const form=new FormData(e.currentTarget);const manifestFile=form.get('manifest') as File;const manifest=JSON.parse(await manifestFile.text());
 if(!Array.isArray(manifest.files)||manifest.files.length!==9)throw new Error('manifest에 PNG 8장과 ZIP 1개가 필요합니다.');
 const inputs=manifest.files.map((f:Record<string,unknown>)=>assetInput({...f,result_id:cardId}));
 if(new Set(inputs.map((a:{kind:string;position:number})=>`${a.kind}:${a.position}`)).size!==9||inputs.filter((a:{kind:string})=>a.kind==='image').length!==8)throw new Error('이미지 순서 1~8과 ZIP 순서 0을 확인해주세요.');
 const files=form.getAll('files') as File[];const client=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
 for(const a of inputs){const file=files.find(f=>f.name===a.name);if(!file||file.size!==a.bytes)throw new Error(`${a.name}: 파일 누락 또는 크기 불일치`);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer())),v=>v.toString(16).padStart(2,'0')).join('');if(hash!==a.sha256)throw new Error(`${a.name}: SHA256 불일치`);
 setMessage(`${a.name} 저장·재조회 중…`);const {error}=await client.storage.from(cardBucket).upload(a.storage_path,file,{contentType:a.kind==='image'?'image/png':'application/zip',upsert:false});
 if(error&&error.message!=='The resource already exists')throw new Error(`${a.name}: 업로드 실패 (${error.message})`);
 await registerCardAsset(a);
 }setMessage('8장과 ZIP의 저장·해시 검증을 마쳤습니다.');router.refresh();
 }catch(error){setMessage(error instanceof Error?error.message:'가져오기 실패');}finally{setBusy(false);}}
 return <details><summary>완성된 결과 가져오기</summary><p>원본 PNG 8장·ZIP과 전달받은 검증 목록을 선택하세요. 기존 파일은 덮어쓰지 않습니다.</p><form onSubmit={submit} className="stack"><label>검증 목록(JSON)<input type="file" name="manifest" accept=".json" required disabled={busy}/></label><label>PNG 8장 및 전체 ZIP<input type="file" name="files" accept=".png,.zip" multiple required disabled={busy}/></label><button className="erp-button" disabled={busy}>결과 가져오기</button></form><p role="status">{message}</p></details>;
}
