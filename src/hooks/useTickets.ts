import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Ticket = Database['public']['Tables']['tickets']['Row'];
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];
type TicketUpdate = Database['public']['Tables']['tickets']['Update'];

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          requester:profiles!tickets_requester_id_fkey(id, full_name, email, avatar_url),
          assignee:profiles!tickets_assigned_to_fkey(id, full_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          requester:profiles!tickets_requester_id_fkey(id, full_name, email, avatar_url, department),
          assignee:profiles!tickets_assigned_to_fkey(id, full_name, email, avatar_url)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useTicketComments(ticketId: string) {
  return useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select(`
          *,
          author:profiles!ticket_comments_author_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!ticketId
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (ticket: Omit<TicketInsert, 'requester_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tickets')
        .insert({ ...ticket, requester_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
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
    mutationFn: async ({ id, ...updates }: TicketUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', data.id] });
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
        total: data.length,
        byStatus: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        openTickets: 0,
        resolvedToday: 0
      };
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      data.forEach(ticket => {
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
