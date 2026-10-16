export type ColumnBlock = {type:'h2'|'h3'|'paragraph'|'ul'|'ol';text:string;items?:string[];id?:string};
export function columnBlocks(body:string):ColumnBlock[]{
 const blocks:ColumnBlock[]=[];let paragraph:string[]=[];let heading=0;
 const flush=()=>{if(paragraph.length){blocks.push({type:'paragraph',text:paragraph.join('\n')});paragraph=[];}};
 for(const line of body.replace(/\r\n?/g,'\n').split('\n')){
  const h=line.match(/^(#{2,3})\s+(.+)$/);const ul=line.match(/^[-*]\s+(.+)$/);const ol=line.match(/^\d+\.\s+(.+)$/);
  if(h){flush();blocks.push({type:h[1].length===2?'h2':'h3',text:h[2],id:`section-${++heading}`});}
  else if(ul||ol){flush();const type=ul?'ul':'ol';const text=(ul||ol)![1];const previous=blocks.at(-1);if(previous?.type===type)previous.items!.push(text);else blocks.push({type,text:'',items:[text]});}
  else if(!line.trim())flush();else paragraph.push(line);
 }
 flush();return blocks;
}
export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
export function articleSchema(r:{id:string;title:string;summary:string;category:string;image_url:string;published_at:string;updated_at:string}){
 const url=`https://mongpd.com/columns/${r.id}`;
 return {'@context':'https://schema.org','@graph':[
  {'@type':'BlogPosting','@id':`${url}#article`,url,mainEntityOfPage:url,headline:r.title,description:r.summary,inLanguage:'ko-KR',articleSection:r.category,datePublished:r.published_at,dateModified:r.updated_at,author:{'@type':'Organization',name:'몽PD',url:'https://mongpd.com/'},publisher:{'@type':'Organization',name:'몽PD',url:'https://mongpd.com/'},...(r.image_url?{image:[r.image_url]}:{})},
  {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'몽PD',item:'https://mongpd.com/'},{'@type':'ListItem',position:2,name:'칼럼',item:'https://mongpd.com/columns'},{'@type':'ListItem',position:3,name:r.title,item:url}]}
 ]};
}
