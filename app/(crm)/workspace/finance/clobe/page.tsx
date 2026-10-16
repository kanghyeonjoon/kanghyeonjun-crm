import {clobeOwner} from '@/lib/clobe-access';
import ClobeFinance from '@/components/clobe-finance';
export const dynamic='force-dynamic';
export const maxDuration=60;
export default async function Page(){await clobeOwner();return <ClobeFinance/>;}
