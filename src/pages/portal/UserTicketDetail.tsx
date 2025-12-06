import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTicket, useTicketComments, useAddComment } from "@/hooks/useTickets";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  MessageSquare,
  Send,
  Loader2,
  Tag,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  new: { label: "Nouveau", icon: AlertTriangle, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  open: { label: "Ouvert", icon: Clock, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  in_progress: { label: "En cours", icon: Clock, className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  pending: { label: "En attente", icon: Clock, className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  resolved: { label: "Résolu", icon: CheckCircle, className: "bg-green-500/10 text-green-500 border-green-500/20" },
  closed: { label: "Fermé", icon: CheckCircle, className: "bg-muted text-muted-foreground border-border" }
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Basse", className: "bg-slate-500/10 text-slate-500" },
  medium: { label: "Moyenne", className: "bg-blue-500/10 text-blue-500" },
  high: { label: "Haute", className: "bg-orange-500/10 text-orange-500" },
  critical: { label: "Critique", className: "bg-red-500/10 text-red-500" }
};

export default function UserTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: ticket, isLoading: ticketLoading } = useTicket(id || "");
  const { data: comments, isLoading: commentsLoading } = useTicketComments(id || "");
  const addComment = useAddComment();

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  // Security check: user can only view their own tickets
  if (!ticket || ticket.requester_id !== user?.id) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/portal/tickets")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Card className="p-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
          <p className="text-muted-foreground">
            Ce ticket n'existe pas ou vous n'avez pas les droits pour y accéder.
          </p>
        </Card>
      </div>
    );
  }

  const status = statusConfig[ticket.status] || statusConfig.new;
  const priority = priorityConfig[ticket.priority] || priorityConfig.medium;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/portal/tickets")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span className="text-muted-foreground font-normal">#{ticket.ticket_number}</span>
            {ticket.title}
          </h1>
          <p className="text-muted-foreground">
            Créé {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: fr })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Details */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={status.className}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
                <Badge variant="outline" className={priority.className}>
                  {priority.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap text-foreground">
                  {ticket.description || "Aucune description fournie."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Échanges
                {comments && <Badge variant="secondary">{comments.length}</Badge>}
              </CardTitle>
              <CardDescription>
                Communiquez avec l'équipe support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {commentsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments
                    .filter(c => !c.is_internal) // Users don't see internal comments
                    .map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={comment.author?.avatar_url || undefined} />
                        <AvatarFallback>
                          {comment.author?.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.author?.full_name || "Support"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucun message pour le moment</p>
                  <p className="text-sm">Envoyez un message pour communiquer avec le support</p>
                </div>
              )}

              <Separator className="my-4" />

              {/* Add Comment Form */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Écrire un message..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="resize-none"
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
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Détails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Numéro</span>
                <span className="font-mono">#{ticket.ticket_number}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize">{ticket.type === 'incident' ? 'Incident' : 'Demande'}</span>
              </div>
              {ticket.category && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catégorie</span>
                    <span className="capitalize">{ticket.category}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le</span>
                <span>{format(new Date(ticket.created_at), "dd/MM/yyyy", { locale: fr })}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dernière mise à jour</span>
                <span>{format(new Date(ticket.updated_at), "dd/MM/yyyy", { locale: fr })}</span>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Tech */}
          {ticket.assignee && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pris en charge par
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
                    <p className="font-medium">{ticket.assignee.full_name}</p>
                    <p className="text-sm text-muted-foreground">Support technique</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Suivi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Ticket créé</span>
                </div>
                {['open', 'in_progress', 'pending', 'resolved', 'closed'].includes(ticket.status) && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">Pris en charge</span>
                  </div>
                )}
                {['resolved', 'closed'].includes(ticket.status) && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">Résolu</span>
                  </div>
                )}
                {!['resolved', 'closed'].includes(ticket.status) && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    <span className="text-sm text-muted-foreground">En attente de résolution</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
