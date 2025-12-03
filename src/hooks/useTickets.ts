import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface TicketWithRelations {
  id: string;
  ticket_number: number;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string | null;
  requester_id: string;
  assigned_to: string | null;
  category: string | null;
  subcategory: string | null;
  sla_due_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  requester?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
  assignee?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async (): Promise<TicketWithRelations[]> => {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!tickets) return [];

      // Fetch profiles separately
      const userIds = [...new Set([
        ...tickets.map(t => t.requester_id),
        ...tickets.filter(t => t.assigned_to).map(t => t.assigned_to!)
      ])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return tickets.map(ticket => ({
        ...ticket,
        requester: profileMap.get(ticket.requester_id) || null,
        assignee: ticket.assigned_to ? profileMap.get(ticket.assigned_to) || null : null
      }));
    }
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;

      const userIds = [ticket.requester_id, ticket.assigned_to].filter(Boolean) as string[];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, department')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return {
        ...ticket,
        requester: profileMap.get(ticket.requester_id) || null,
        assignee: ticket.assigned_to ? profileMap.get(ticket.assigned_to) || null : null
      };
    },
    enabled: !!id
  });
}

export function useTicketComments(ticketId: string) {
  return useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (!comments || comments.length === 0) return [];

      const authorIds = [...new Set(comments.map(c => c.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', authorIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return comments.map(comment => ({
        ...comment,
        author: profileMap.get(comment.author_id) || null
      }));
    },
    enabled: !!ticketId
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (ticket: {
      title: string;
      description?: string;
      type?: string;
      priority?: string;
      category?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          title: ticket.title,
          description: ticket.description,
          type: (ticket.type || 'incident') as any,
          priority: (ticket.priority || 'medium') as any,
          category: ticket.category,
          requester_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      toast.success('Ticket créé avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      status?: string;
      priority?: string;
      assigned_to?: string;
      title?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', data.id] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      toast.success('Ticket mis à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ ticketId, content, isInternal = false }: { ticketId: string; content: string; isInternal?: boolean }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          author_id: user.id,
          content,
          is_internal: isInternal
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', variables.ticketId] });
      toast.success('Commentaire ajouté');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });
}

export function useTicketStats() {
  return useQuery({
    queryKey: ['ticket-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('status, priority, type, created_at');
      
      if (error) throw error;
      
      const stats = {
        total: data?.length || 0,
        byStatus: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        openTickets: 0,
        resolvedToday: 0
      };
      
      (data || []).forEach(ticket => {
        stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
        stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
        stats.byType[ticket.type] = (stats.byType[ticket.type] || 0) + 1;
        
        if (['new', 'open', 'in_progress', 'pending'].includes(ticket.status)) {
          stats.openTickets++;
        }
      });
      
      return stats;
    }
  });
}
