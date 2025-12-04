import { useAuth } from "@/contexts/AuthContext";
import { useTickets, useTicketStats } from "@/hooks/useTickets";
import { useAssetStats } from "@/hooks/useAssets";
import { Link } from "react-router-dom";
import { 
  Ticket, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Users,
  ArrowRight,
  Activity,
  Monitor,
  Settings,
  BookOpen,
  ShieldCheck,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const adminActions = [
  { title: "Gestion utilisateurs", icon: Users, url: "/users", description: "Gérer les comptes et rôles" },
  { title: "Paramètres système", icon: Settings, url: "/settings", description: "Configuration ITSM" },
  { title: "Base de connaissances", icon: BookOpen, url: "/knowledge", description: "Articles et documentation" },
  { title: "Inventaire CMDB", icon: Monitor, url: "/inventory", description: "Gestion des actifs" }
];

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: "Critique", className: "bg-red-500/10 text-red-500 border-red-500/20" },
  high: { label: "Haute", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  medium: { label: "Moyenne", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  low: { label: "Basse", className: "bg-slate-500/10 text-slate-500 border-slate-500/20" }
};

export default function AdminHome() {
  const { profile } = useAuth();
  const { data: tickets } = useTickets();
  const { data: ticketStats } = useTicketStats();
  const { data: assetStats } = useAssetStats();

  // Calculate metrics
  const openTickets = ticketStats?.openTickets || 0;
  const totalTickets = ticketStats?.total || 0;
  const criticalTickets = tickets?.filter(t => 
    t.priority === 'critical' && ['new', 'open', 'in_progress'].includes(t.status)
  ).length || 0;
  const unassignedCount = tickets?.filter(t => !t.assigned_to && ['new', 'open'].includes(t.status)).length || 0;

  // Recent tickets for overview
  const recentTickets = tickets?.slice(0, 5) || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Admin'} 👋
          </h1>
          <p className="text-muted-foreground">
            Vue d'ensemble du système ITSM
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Link>
          </Button>
          <Button asChild>
            <Link to="/tickets">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard complet
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminActions.map((action) => (
          <Link key={action.url} to={action.url}>
            <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tickets totaux
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Tous statuts confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tickets ouverts
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{openTickets}</div>
            <Progress value={totalTickets ? (openTickets / totalTickets) * 100 : 0} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critiques
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{criticalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Attention requise
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Non assignés
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{unassignedCount}</div>
            <p className="text-xs text-muted-foreground">
              À distribuer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actifs CMDB
            </CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {assetStats?.byStatus?.active || 0} actifs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Derniers tickets créés</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tickets" className="flex items-center gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={ticket.requester?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {ticket.requester?.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          #{ticket.ticket_number}
                        </span>
                        <Badge variant="outline" className={priorityConfig[ticket.priority]?.className}>
                          {priorityConfig[ticket.priority]?.label}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm truncate max-w-md">{ticket.title}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: fr })}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health / Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              État du système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
              <span className="text-sm">Base de données</span>
              <Badge className="bg-green-500">Opérationnel</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
              <span className="text-sm">Authentification</span>
              <Badge className="bg-green-500">Opérationnel</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
              <span className="text-sm">Stockage</span>
              <Badge className="bg-green-500">Opérationnel</Badge>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Distribution par type</h4>
              <div className="space-y-2">
                {Object.entries(ticketStats?.byType || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{type}</span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
