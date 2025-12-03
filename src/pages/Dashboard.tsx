import { Ticket, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { TicketChart } from "@/components/dashboard/TicketChart";
import { RecentTickets } from "@/components/dashboard/RecentTickets";
import { SLAOverview } from "@/components/dashboard/SLAOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useTicketStats } from "@/hooks/useTickets";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useTicketStats();

  const openTickets = stats?.byStatus?.new || 0 + (stats?.byStatus?.open || 0) + (stats?.byStatus?.in_progress || 0);
  const pendingTickets = stats?.byStatus?.pending || 0;
  const resolvedTickets = stats?.byStatus?.resolved || 0;
  const criticalTickets = stats?.byPriority?.critical || 0;

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de l'activité IT"
      />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[140px] rounded-xl" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Tickets ouverts"
                value={openTickets}
                subtitle={`${stats?.total || 0} tickets au total`}
                icon={Ticket}
                variant="primary"
              />
              <StatCard
                title="En attente"
                value={pendingTickets}
                subtitle="Réponse client requise"
                icon={Clock}
                variant="warning"
              />
              <StatCard
                title="Résolus"
                value={resolvedTickets}
                subtitle="Tickets fermés"
                icon={CheckCircle2}
                variant="success"
              />
              <StatCard
                title="Tickets critiques"
                value={criticalTickets}
                subtitle="Action requise"
                icon={AlertTriangle}
                variant="destructive"
              />
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <TicketChart />
          </div>

          {/* Quick Actions & SLA */}
          <div className="space-y-6">
            <QuickActions />
            <SLAOverview />
          </div>
        </div>

        {/* Recent Tickets */}
        <RecentTickets />
      </div>
    </div>
  );
}
