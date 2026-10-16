import type {MetadataRoute} from 'next';
import {headers} from 'next/headers';
export const dynamic='force-dynamic';
export default async function robots():Promise<MetadataRoute.Robots>{
 const host=(await headers()).get('host')?.split(':')[0];
 if(host!=='mongpd.com'&&host!=='www.mongpd.com')return {rules:{userAgent:'*',disallow:'/'}};
 const disallow=['/workspace','/login','/pending','/api/','/thanks'];
 return {rules:[{userAgent:'*',allow:'/',disallow},{userAgent:'OAI-SearchBot',allow:'/',disallow}],sitemap:'https://mongpd.com/sitemap.xml'};
}
