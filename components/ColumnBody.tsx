export default function ColumnBody({body}:{body:string}) {
 return <div className="column-prose">{body.split(/\n\s*\n/).filter(Boolean).map((text,i)=>text.startsWith('## ') ? <h2 key={i}>{text.slice(3)}</h2> : <p key={i}>{text}</p>)}</div>;
}
