'use client';
export default function WorkspaceError({reset}:{reset:()=>void}){return <main className="login"><h1>업무 화면을 불러오지 못했습니다.</h1><p>잠시 후 다시 시도해 주세요. 입력 중이던 내용은 저장되지 않았을 수 있습니다.</p><button onClick={reset}>다시 시도</button></main>;}
