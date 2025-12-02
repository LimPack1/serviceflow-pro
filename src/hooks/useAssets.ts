import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];
type AssetInsert = Database['public']['Tables']['assets']['Insert'];
type AssetUpdate = Database['public']['Tables']['assets']['Update'];

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          assigned_user:profiles!assets_assigned_to_fkey(id, full_name, email, avatar_url, department)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          assigned_user:profiles!assets_assigned_to_fkey(id, full_name, email, avatar_url, department)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: AssetInsert) => {
      const { data, error } = await supabase
        .from('assets')
        .insert(asset)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Équipement créé avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AssetUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', data.id] });
      toast.success('Équipement mis à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });
}

export function useAssetStats() {
  return useQuery({
    queryKey: ['asset-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('status, type');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        byStatus: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        active: 0,
        maintenance: 0
      };
      
      data.forEach(asset => {
        stats.byStatus[asset.status] = (stats.byStatus[asset.status] || 0) + 1;
        stats.byType[asset.type] = (stats.byType[asset.type] || 0) + 1;
        
        if (asset.status === 'active') stats.active++;
        if (asset.status === 'maintenance') stats.maintenance++;
      });
      
      return stats;
    }
  });
}
