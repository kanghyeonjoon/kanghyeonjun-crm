import {createHmac,randomBytes} from 'node:crypto';
export function solapiHeaders(){
 const key=process.env.SOLAPI_API_KEY?.trim(),secret=process.env.SOLAPI_API_SECRET?.trim();
 if(!key||!secret)throw Error('solapi_not_configured');
 const date=new Date().toISOString(),salt=randomBytes(16).toString('hex');
 const signature=createHmac('sha256',secret).update(date+salt).digest('hex');
 return {Authorization:`HMAC-SHA256 apiKey=${key}, date=${date}, salt=${salt}, signature=${signature}`,'Content-Type':'application/json'};
}
export function solapiReceipt(result:unknown):string{
 const r=result as {failedMessageList?:unknown[];groupInfo?:{groupId?:string;count?:{registeredSuccess?:number}}};
 if(!Array.isArray(r?.failedMessageList)||r.failedMessageList.length||r.groupInfo?.count?.registeredSuccess!==1||!r.groupInfo.groupId)throw Error('solapi_acceptance_unconfirmed');
 return r.groupInfo.groupId;
}
export async function sendSolapi(message:Record<string,unknown>){
 const response=await fetch('https://api.solapi.com/messages/v4/send-many/detail',{method:'POST',signal:AbortSignal.timeout(10000),headers:solapiHeaders(),body:JSON.stringify({messages:[message],allowDuplicates:false,showMessageList:false})});
 if(!response.ok)throw Error('solapi_request_failed');
 return solapiReceipt(await response.json());
}
