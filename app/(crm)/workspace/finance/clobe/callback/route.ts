import {NextRequest,NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {clobeOwner} from '@/lib/clobe-access';
import {finishClobe} from '@/lib/clobe';
export async function GET(req:NextRequest){const {user}=await clobeOwner();const state=req.nextUrl.searchParams.get('state'),code=req.nextUrl.searchParams.get('code');const jar=await cookies();const saved=jar.get('clobe_oauth_state')?.value;jar.delete({name:'clobe_oauth_state',path:'/workspace/finance/clobe/callback'});let success=false;if(state&&state===saved&&code&&!req.nextUrl.searchParams.has('error'))try{await finishClobe(user.id,state,code);success=true;}catch{/* Never expose OAuth response or credentials. */}const res=NextResponse.redirect('https://crm.mongpd.com/workspace/finance/clobe?connection='+(success?'success':'failed'));res.headers.set('Cache-Control','no-store');res.headers.set('Referrer-Policy','no-referrer');return res;}
