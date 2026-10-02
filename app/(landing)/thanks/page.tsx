import Link from 'next/link';
export const metadata={title:'무료진단 신청 완료 | 몽PD',robots:{index:false,follow:false}};
export default function Thanks(){return <main className="mx-auto max-w-xl px-6 py-24 text-center"><h1 className="text-3xl font-black">무료진단 신청이 접수되었습니다</h1><p className="my-8 leading-8">신청 내용을 검토한 뒤 연락드리겠습니다.<br/>접수만으로 진단 일정이 확정되는 것은 아닙니다.</p><Link href="/" className="rounded-xl bg-blue-700 px-6 py-4 font-bold text-white">몽PD 홈으로</Link><p className="mt-8 text-sm">문의: ekrk5614@gmail.com</p></main>}
