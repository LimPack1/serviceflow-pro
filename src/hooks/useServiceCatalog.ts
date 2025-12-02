import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ServiceCatalogCategory = Database['public']['Tables']['service_catalog_categories']['Row'];
type ServiceCatalogItem = Database['public']['Tables']['service_catalog_items']['Row'];

export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_catalog_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useServiceItems(categoryId?: string) {
  return useQuery({
    queryKey: ['service-items', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('service_catalog_items')
        .select(`
          *,
          category:service_catalog_categories(id, name, icon)
        `)
        .order('name', { ascending: true });
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function usePopularServices() {
  return useQuery({
    queryKey: ['popular-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_catalog_items')
        .select(`
          *,
          category:service_catalog_categories(id, name, icon)
        `)
        .eq('is_popular', true)
        .limit(6);
      
      if (error) throw error;
      return data;
    }
  });
}

export function useServiceItem(id: string) {
  return useQuery({
    queryKey: ['service-item', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_catalog_items')
        .select(`
          *,
          category:service_catalog_categories(id, name, icon)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}
