export const cardId='card-4907aaca';
export const cardTitle='가격을 낮추기 전에 확인할 3가지';
export const cardBucket='crm-cardnews';
export type CardAsset={id:string;result_id:string;name:string;kind:'image'|'zip';position:number;sha256:string;bytes:number;storage_path:string};
export function assetInput(v:unknown){
 const a=v as Partial<CardAsset>;
 if(!a||a.result_id!==cardId||typeof a.name!=='string'||!/^[-a-zA-Z0-9_가-힣. ]{1,120}$/.test(a.name)||a.name.includes('..')||!['image','zip'].includes(a.kind||'')||!Number.isInteger(a.position)||!a.sha256||! /^[a-f0-9]{64}$/.test(a.sha256)||!Number.isInteger(a.bytes)||a.bytes!<=0||a.bytes!>32*1024*1024)throw new Error('파일 정보가 올바르지 않습니다.');
 if(a.kind==='image'&&(!a.name.endsWith('.png')||a.position!<1||a.position!>8)||a.kind==='zip'&&(!a.name.endsWith('.zip')||a.position!==0))throw new Error('PNG 1~8장과 ZIP만 지원합니다.');
 return {...a,storage_path:`${cardId}/${a.sha256}.${a.kind==='image'?'png':'zip'}`} as CardAsset;
}
