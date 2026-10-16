import {columnBlocks} from '@/lib/column-content';
function Inline({text}:{text:string}){
 const parts=[];const re=/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;let start=0;let match;
 while((match=re.exec(text))!==null){parts.push(text.slice(start,match.index));if(URL.canParse(match[2]))parts.push(<a key={match.index} href={match[2]} rel="noopener noreferrer">{match[1]}</a>);else parts.push(match[0]);start=re.lastIndex;}
 parts.push(text.slice(start));return <>{parts}</>;
}
export default function ColumnBody({body}:{body:string}) {
 return <div className="column-prose">{columnBlocks(body).map((b,i)=>b.type==='h2'?<h2 id={b.id} key={i}><Inline text={b.text}/></h2>:b.type==='h3'?<h3 id={b.id} key={i}><Inline text={b.text}/></h3>:b.type==='ul'?<ul key={i}>{b.items?.map((text,j)=><li key={j}><Inline text={text}/></li>)}</ul>:b.type==='ol'?<ol key={i}>{b.items?.map((text,j)=><li key={j}><Inline text={text}/></li>)}</ol>:<p key={i}><Inline text={b.text}/></p>)}</div>;
}
