import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AssetWithUser {
  id: string;
  asset_tag: string;
  name: string;
  type: string;
  status: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  assigned_to: string | null;
  location: string | null;
  purchase_date: string | null;
  warranty_expires: string | null;
  purchase_price: number | null;
  specifications: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    department: string | null;
  } | null;
}

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async (): Promise<AssetWithUser[]> => {
      const { data: assets, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!assets) return [];

      const userIds = assets.filter(a => a.assigned_to).map(a => a.assigned_to!);
      if (userIds.length === 0) return assets.map(a => ({ ...a, assigned_user: null }));

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, department')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return assets.map(asset => ({
        ...asset,
        assigned_user: asset.assigned_to ? profileMap.get(asset.assigned_to) || null : null
      }));
    }
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const { data: asset, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;

      if (asset.assigned_to) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, department')
          .eq('id', asset.assigned_to)
          .maybeSingle();

        return { ...asset, assigned_user: profile };
      }

      return { ...asset, assigned_user: null };
    },
    enabled: !!id
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: {
      asset_tag: string;
      name: string;
      type?: string;
      status?: string;
      manufacturer?: string;
      model?: string;
      serial_number?: string;
      assigned_to?: string;
      location?: string;
    }) => {
      const { data, error } = await supabase
        .from('assets')
        .insert({
          asset_tag: asset.asset_tag,
          name: asset.name,
          type: (asset.type || 'other') as any,
          status: (asset.status || 'active') as any,
          manufacturer: asset.manufacturer,
          model: asset.model,
          serial_number: asset.serial_number,
          assigned_to: asset.assigned_to,
          location: asset.location
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
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
    mutationFn: async ({ id, ...updates }: {
      id: string;
      name?: string;
      status?: string;
      assigned_to?: string | null;
      location?: string;
    }) => {
      const { data, error } = await supabase
        .from('assets')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', data.id] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
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
        total: data?.length || 0,
        byStatus: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        active: 0,
        maintenance: 0
      };
      
      (data || []).forEach(asset => {
        stats.byStatus[asset.status] = (stats.byStatus[asset.status] || 0) + 1;
        stats.byType[asset.type] = (stats.byType[asset.type] || 0) + 1;
        
        if (asset.status === 'active') stats.active++;
        if (asset.status === 'maintenance') stats.maintenance++;
      });
      
      return stats;
    }
  });
}
