import {createHash} from 'node:crypto';
import type {CardAsset} from './cardnews';
export function verifyCardBytes(a:CardAsset,b:Buffer){
 if(b.length!==a.bytes||createHash('sha256').update(b).digest('hex')!==a.sha256)throw new Error('파일 크기 또는 SHA256 불일치');
 if(a.kind==='image'&&(b.length<24||b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||b.readUInt32BE(16)!==1080||b.readUInt32BE(20)!==1350))throw new Error('1080×1350 PNG가 아닙니다.');
 if(a.kind==='zip'&&b.subarray(0,4).toString('hex')!=='504b0304')throw new Error('ZIP 형식이 아닙니다.');
}
