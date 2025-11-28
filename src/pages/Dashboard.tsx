import { Ticket, Clock, CheckCircle2, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { TicketChart } from "@/components/dashboard/TicketChart";
import { RecentTickets } from "@/components/dashboard/RecentTickets";
import { SLAOverview } from "@/components/dashboard/SLAOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <AppHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de l'activité IT"
      />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tickets ouverts"
            value={42}
            subtitle="12 nouveaux aujourd'hui"
            icon={Ticket}
            trend={{ value: 8, isPositive: false }}
            variant="primary"
          />
          <StatCard
            title="En attente"
            value={15}
            subtitle="Réponse client requise"
            icon={Clock}
            trend={{ value: 3, isPositive: true }}
            variant="warning"
          />
          <StatCard
            title="Résolus cette semaine"
            value={87}
            subtitle="Temps moyen: 4h 32min"
            icon={CheckCircle2}
            trend={{ value: 12, isPositive: true }}
            variant="success"
          />
          <StatCard
            title="SLA en danger"
            value={3}
            subtitle="Action requise"
            icon={AlertTriangle}
            variant="destructive"
          />
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
