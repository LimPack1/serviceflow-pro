import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets } from "@/hooks/useTickets";
import { 
  PlusCircle, 
  List, 
  ShoppingBag, 
  BookOpen, 
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const quickActions = [
  {
    title: "Nouveau ticket",
    description: "Signaler un incident ou faire une demande",
    icon: PlusCircle,
    url: "/portal/tickets/new",
    variant: "default" as const
  },
  {
    title: "Mes tickets",
    description: "Voir l'état de mes demandes",
    icon: List,
    url: "/portal/tickets",
    variant: "outline" as const
  },
  {
    title: "Catalogue",
    description: "Parcourir les services disponibles",
    icon: ShoppingBag,
    url: "/portal/catalog",
    variant: "outline" as const
  },
  {
    title: "Base de connaissances",
    description: "Trouver des réponses rapides",
    icon: BookOpen,
    url: "/portal/knowledge",
    variant: "outline" as const
  }
];

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  new: { label: "Nouveau", icon: AlertCircle, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  open: { label: "Ouvert", icon: Clock, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  in_progress: { label: "En cours", icon: Clock, className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  pending: { label: "En attente", icon: Clock, className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  resolved: { label: "Résolu", icon: CheckCircle, className: "bg-green-500/10 text-green-500 border-green-500/20" },
  closed: { label: "Fermé", icon: CheckCircle, className: "bg-muted text-muted-foreground border-border" }
};

export default function UserHome() {
  const { profile, user } = useAuth();
  const { data: tickets, isLoading } = useTickets();

  // Filter user's own tickets
  const myTickets = tickets?.filter(t => t.requester_id === user?.id) || [];
  const recentTickets = myTickets.slice(0, 3);
  const openTicketsCount = myTickets.filter(t => 
    ['new', 'open', 'in_progress', 'pending'].includes(t.status)
  ).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Utilisateur'} 👋
        </h1>
        <p className="text-muted-foreground">
          Comment pouvons-nous vous aider aujourd'hui ?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.url} to={action.url}>
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
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

      {/* Stats & Recent Tickets */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Tickets ouverts</span>
              <span className="text-2xl font-bold text-primary">{openTicketsCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Total tickets</span>
              <span className="text-2xl font-bold">{myTickets.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Mes tickets récents</CardTitle>
              <CardDescription>Vos dernières demandes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/portal/tickets" className="flex items-center gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <List className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Vous n'avez pas encore de tickets</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/portal/tickets/new">Créer votre premier ticket</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => {
                  const status = statusConfig[ticket.status] || statusConfig.new;
                  return (
                    <Link
                      key={ticket.id}
                      to={`/portal/tickets/${ticket.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            #{ticket.ticket_number}
                          </span>
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                        </div>
                        <p className="font-medium truncate">{ticket.title}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
