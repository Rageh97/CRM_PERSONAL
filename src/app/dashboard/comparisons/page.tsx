import { getMonthlyData } from '@/features/dashboard/actions';
import { ComparisonsClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ComparisonsPage() {
  const monthlyData = await getMonthlyData();
  return <ComparisonsClient monthlyData={monthlyData} />;
}
