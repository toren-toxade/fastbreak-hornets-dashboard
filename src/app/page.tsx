import DashboardLayout from '@/components/layout/DashboardLayout';
import PlayerLeaderboard from '@/components/widgets/PlayerLeaderboard';
import ShootingEfficiencyChart from '@/components/widgets/ShootingEfficiencyChart';
import PerformanceRadarChart from '@/components/widgets/PerformanceRadarChart';
import PointsDistributionChart from '@/components/widgets/PointsDistributionChart';

import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

export default async function Home() {
  const allowUnauth = process.env.NEXT_PUBLIC_ALLOW_UNAUTH_DASHBOARD === '1';
  const session = await auth0.getSession();
  if (!session && !allowUnauth) redirect('/unauthenticated');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center mb-12">
<h2 className="typ-h2 mb-4">Player Statistics Dashboard</h2>
<p className="text-muted max-w-2xl mx-auto">
            Welcome to the Charlotte Hornets player insights dashboard. Explore comprehensive statistics, 
            performance metrics, and visualizations for the current roster.
          </p>
        </div>
        
        {/* Dashboard widgets */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          <PlayerLeaderboard />
          <ShootingEfficiencyChart />
          <PerformanceRadarChart />
          <PointsDistributionChart />
        </div>
      </div>
    </DashboardLayout>
  );
}
