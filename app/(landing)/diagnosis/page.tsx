import Link from 'next/link';
import NativeDiagnosisForm from '@/components/NativeDiagnosisForm';
export default function Diagnosis(){return <main className="mx-auto max-w-2xl px-5 py-12"><Link href="/" className="text-sm font-bold">← 몽PD 병원 유튜브</Link><h1 className="mt-8 text-3xl font-black">30분 무료진단 신청</h1><p className="my-6 leading-7 text-slate-600">어디에서 문의가 막히는지, 제목·썸네일은 어떻게 바꿀지, 다음에는 어떤 소재를 다룰지 함께 살펴봅니다. 진단 후 직접 운영하셔도 됩니다.</p><NativeDiagnosisForm /></main>}
