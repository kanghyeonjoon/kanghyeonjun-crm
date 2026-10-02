import { z } from 'zod';
export const columnSchema = z.object({
 title:z.string().trim().min(1,'제목을 입력해 주세요.').max(160),
 summary:z.string().trim().max(500), body:z.string().trim().min(1,'본문을 입력해 주세요.').max(50000),
 category:z.enum(['병원 마케팅','유튜브 운영']),
 image_url:z.string().max(2000).refine(v=>!v || /^https:\/\//.test(v) && URL.canParse(v),'이미지 주소를 확인해 주세요.'),
 status:z.enum(['draft','published','archived']),
});
export type ColumnRow = z.infer<typeof columnSchema> & {id:string;version:number;created_at:string;updated_at:string;published_at:string|null};
export const columnStates = {draft:'임시저장',published:'공개',archived:'삭제됨'};
