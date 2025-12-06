import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { useTicket, useTicketComments, useUpdateTicket, useAddComment } from "@/hooks/useTickets";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/useProfiles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  AlertTriangle,
  MessageSquare,
  History,
  Send,
  Loader2,
  Edit,
  UserPlus,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";

const statusLabels: Record<string, string> = {
  new: "Nouveau",
  open: "Ouvert",
  in_progress: "En cours",
  pending: "En attente",
  resolved: "Résolu",
  closed: "Fermé",
};

const priorityLabels: Record<string, string> = {
  critical: "Critique",
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
};

const typeLabels: Record<string, string> = {
  incident: "Incident",
  request: "Demande",
  problem: "Problème",
  change: "Changement",
};

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isAgent } = useAuth();
  const { data: ticket, isLoading: ticketLoading } = useTicket(id || "");
  const { data: comments, isLoading: commentsLoading } = useTicketComments(id || "");
  const { data: profiles } = useProfiles();
  const updateTicket = useUpdateTicket();
  const addComment = useAddComment();

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = isAdmin || isAgent;
  const agents = profiles?.filter(p => true) || []; // In real app, filter by role

  const handleStatusChange = (status: string) => {
    if (!id) return;
    updateTicket.mutate({ id, status });
  };

  const handlePriorityChange = (priority: string) => {
    if (!id) return;
    updateTicket.mutate({ id, priority });
  };

  const handleAssign = (userId: string) => {
    if (!id) return;
    updateTicket.mutate({ id, assigned_to: userId });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;
    setIsSubmitting(true);
    try {
      await addComment.mutateAsync({ ticketId: id, content: newComment });
      setNewComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (ticketLoading) {
    return (
      <div className="min-h-screen">
        <AppHeader title="Chargement..." subtitle="" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-[300px]" />
              <Skeleton className="h-[200px]" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[150px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen">
        <AppHeader title="Ticket non trouvé" subtitle="" />
        <div className="p-6">
          <Card className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Ticket introuvable</h2>
            <p className="text-muted-foreground mb-4">
              Ce ticket n'existe pas ou vous n'avez pas les droits pour y accéder.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        title={`TKT-${ticket.ticket_number}`}
        subtitle={ticket.title}
      />
      <div className="p-6">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant={`status-${ticket.status.replace('_', '-')}` as any}>
                    {statusLabels[ticket.status]}
                  </Badge>
                  <Badge variant={`priority-${ticket.priority}` as any}>
                    {priorityLabels[ticket.priority]}
                  </Badge>
                  <Badge variant={ticket.type as any}>
                    {typeLabels[ticket.type]}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{ticket.title}</CardTitle>
                <CardDescription>
                  Créé {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: fr })}
                  {ticket.category && ` • ${ticket.category}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap">{ticket.description || "Aucune description fournie."}</p>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Commentaires
                  {comments && <Badge variant="secondary">{comments.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {commentsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                ) : comments && comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={comment.author?.avatar_url || undefined} />
                          <AvatarFallback>
                            {comment.author?.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {comment.author?.full_name || "Utilisateur"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                            </span>
                            {comment.is_internal && (
                              <Badge variant="outline" className="text-xs">Interne</Badge>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    Aucun commentaire pour le moment
                  </p>
                )}

                <Separator className="my-4" />

                {/* Add Comment Form */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Envoyer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions (Admin/Agent only) */}
            {canEdit && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Statut</label>
                    <Select value={ticket.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Nouveau</SelectItem>
                        <SelectItem value="open">Ouvert</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="resolved">Résolu</SelectItem>
                        <SelectItem value="closed">Fermé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priorité</label>
                    <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="critical">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assigné à</label>
                    <Select 
                      value={ticket.assigned_to || "unassigned"} 
                      onValueChange={(val) => handleAssign(val === "unassigned" ? "" : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Non assigné" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Non assigné</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.full_name || agent.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requester Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Demandeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={ticket.requester?.avatar_url || undefined} />
                    <AvatarFallback>
                      {ticket.requester?.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ticket.requester?.full_name || "Utilisateur"}</p>
                    <p className="text-sm text-muted-foreground">{ticket.requester?.email}</p>
                    {ticket.requester?.department && (
                      <p className="text-xs text-muted-foreground">{ticket.requester.department}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numéro</span>
                  <span className="font-mono">TKT-{ticket.ticket_number}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Créé le</span>
                  <span>{format(new Date(ticket.created_at), "dd MMM yyyy HH:mm", { locale: fr })}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mis à jour</span>
                  <span>{format(new Date(ticket.updated_at), "dd MMM yyyy HH:mm", { locale: fr })}</span>
                </div>
                {ticket.sla_due_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Échéance SLA</span>
                      <span>{format(new Date(ticket.sla_due_at), "dd MMM yyyy HH:mm", { locale: fr })}</span>
                    </div>
                  </>
                )}
                {ticket.resolved_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Résolu le</span>
                      <span>{format(new Date(ticket.resolved_at), "dd MMM yyyy HH:mm", { locale: fr })}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Assignee Info */}
            {ticket.assignee && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Technicien assigné
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={ticket.assignee.avatar_url || undefined} />
                      <AvatarFallback>
                        {ticket.assignee.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{ticket.assignee.full_name || "Utilisateur"}</p>
                      <p className="text-sm text-muted-foreground">{ticket.assignee.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
