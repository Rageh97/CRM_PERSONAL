import { getMonthlyData } from '@/features/dashboard/actions';
import { ComparisonsClient } from './client';

export default async function ComparisonsPage() {
  const monthlyData = await getMonthlyData();
  return <ComparisonsClient monthlyData={monthlyData} />;
}
