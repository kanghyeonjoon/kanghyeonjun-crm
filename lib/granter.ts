// Server-only adapter: import only from server pages. Never return credentials or raw provider errors.
import {z} from 'zod';
const object=z.record(z.string(),z.unknown());
export class GranterError extends Error {code:string;status?:number;constructor(code:string,status?:number){super(code);this.code=code;this.status=status;}}
const endpoints=['workspace-profile','assets','tickets'] as const;
export async function granterRead(endpoint:typeof endpoints[number],body?:Record<string,unknown>,fetcher:typeof fetch=fetch):Promise<unknown>{
 throw new GranterError('disconnected');
}

const identifier=z.number().int().nonnegative();
const profileSchema=z.object({workspaceId:identifier,companyName:z.string()});
const assetSchema=z.object({id:identifier,workspaceId:identifier,assetType:z.string(),name:z.string(),nickname:z.string().nullish(),organizationName:z.string().nullish(),number:z.string().nullish(),isActive:z.boolean(),isHidden:z.boolean().optional(),bankAccount:object.nullish(),securitiesAccount:object.nullish(),scrapHistory:object.nullish()});
const ticketSchema=z.object({id:identifier,workspaceId:identifier,ticketType:z.literal('BANK_TRANSACTION_TICKET'),transactAt:z.string(),transactionType:z.string(),amount:z.number().finite(),content:z.string().nullish(),description:z.string().nullish(),bankTransaction:object.nullish(),expenseCategory:object.nullish()});
export function normalizeProfile(data:unknown){const p=profileSchema.safeParse(data);if(!p.success)throw new GranterError('invalid_response');return p.data;}
const str=(v:unknown)=>typeof v==='string'?v:'';
const num=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v:typeof v==='string'&&/^-?\d+(\.\d+)?$/.test(v)&&Number.isFinite(Number(v))?Number(v):null;
export function normalizeAssets(data:unknown,workspaceId:number){
 const p=z.array(assetSchema).safeParse(data);if(!p.success)throw new GranterError('invalid_response');
 if(p.data.some(a=>a.workspaceId!==workspaceId))throw new GranterError('workspace_mismatch');
 return [...new Map(p.data.map(a=>[a.id,a])).values()].map(a=>{const b=a.bankAccount;const sec=a.securitiesAccount;const currency=str(b?.currencyCode);const balance=b?(currency==='KRW'?num(b.accountBalance):num(b.originalBalance)):null;return {id:a.id,type:a.assetType,name:a.nickname||a.name,bank:a.organizationName||'',number:a.number?'••••'+a.number.replace(/\s/g,'').slice(-4):'',active:a.isActive,hidden:a.isHidden||false,currency,balance,accountType:str(b?.accountType),valuation:sec?num(sec.totalValuationAmount):null,completed:str(a.scrapHistory?.lastCompletedAt),failed:str(a.scrapHistory?.lastFailedAt)};});
}
export function normalizeTickets(data:unknown,workspaceId:number){
 const p=z.array(ticketSchema).safeParse(data);if(!p.success)throw new GranterError('invalid_response');
 if(p.data.some(a=>a.workspaceId!==workspaceId))throw new GranterError('workspace_mismatch');
 return [...new Map(p.data.map(t=>[t.id,t])).values()].map(t=>{const b=t.bankTransaction;const a=object.safeParse(b?.bankAccount);const asset=a.success?a.data:{};const currency=str(asset.currencyCode);return {id:t.id,date:t.transactAt,direction:t.transactionType,amount:currency==='KRW'?t.amount:currency?num(b?.originalAmount):null,currency,name:t.content||t.description||'',bank:str(asset.organizationName),account:str(asset.nickname)||str(asset.name),category:str(t.expenseCategory?.name)};}).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
}
export function granterMessage(e:unknown){
 if(!(e instanceof GranterError))return '조회 결과를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.';
 if(e.code==='missing_key')return '서버 API 키 설정이 필요합니다.';
 if(e.status===401)return '그랜터 API 인증에 실패했습니다. LIVE API 키를 확인해 주세요.';
 if(e.status===403)return 'API 접근이 거부되었습니다. 그랜터 요금제와 API 사용 권한을 확인해 주세요.';
 if(e.status===400)return '그랜터에서 조회·입력 조건을 거부했습니다. 대상과 날짜를 확인해 주세요. (400)';
 if(e.status&&e.status>=500)return '그랜터 원본 서비스가 이 요청을 처리하지 못했습니다. 잠시 후 다시 확인해 주세요. ('+e.status+')';
 if(e.status===429)return '그랜터 조회 한도에 도달했습니다. 잠시 후 다시 조회해 주세요.';
 if(e.code==='invalid_response'||e.code==='workspace_mismatch')return '응답 형식 또는 회사 정보가 예상과 달라 표시를 중단했습니다.';
 if(e.status)return '그랜터가 이 요청을 처리하지 못했습니다. (서비스 응답 '+e.status+')';
 return '그랜터 연결이 지연되거나 실패했습니다. 잠시 후 다시 조회해 주세요.';
}
export function granterAmount(v:number|null,currency:string){if(v===null||!currency)return '확인 필요';return v.toLocaleString('ko-KR',{maximumFractionDigits:4})+' '+currency;}
