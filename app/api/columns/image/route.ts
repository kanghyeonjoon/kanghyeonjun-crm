import {NextRequest,NextResponse} from 'next/server';
import {requireMember} from '@/lib/access';
export async function POST(req:NextRequest) {
 if(req.headers.get('origin')!==req.nextUrl.origin)return NextResponse.json({error:'잘못된 요청입니다.'},{status:403});
 const {client,role}=await requireMember();
 if(!['owner','operator'].includes(role))return NextResponse.json({error:'업로드 권한이 없습니다.'},{status:403});
 if(Number(req.headers.get('content-length')||0)>3500000)return NextResponse.json({error:'이미지는 3MB 이하로 선택해 주세요.'},{status:413});
 const form=await req.formData();const file=form.get('image');
 if(!(file instanceof File)||file.size>3145728||!file.size)return NextResponse.json({error:'이미지는 3MB 이하로 선택해 주세요.'},{status:400});
 const bytes=new Uint8Array(await file.arrayBuffer());
 const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;
 const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 const ext=png?'png':jpg?'jpg':webp?'webp':'';
 if(!ext)return NextResponse.json({error:'JPG, PNG, WebP 이미지를 선택해 주세요.'},{status:400});
 const path=`${crypto.randomUUID()}.${ext}`;
 const {error}=await client.storage.from('column-images').upload(path,bytes,{contentType:ext==='jpg'?'image/jpeg':`image/${ext}`,upsert:false});
 if(error)return NextResponse.json({error:'이미지를 업로드하지 못했습니다.'},{status:500});
 return NextResponse.json({url:client.storage.from('column-images').getPublicUrl(path).data.publicUrl});
}
