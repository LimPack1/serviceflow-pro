import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type KBArticle = Database['public']['Tables']['kb_articles']['Row'];
type KBArticleInsert = Database['public']['Tables']['kb_articles']['Insert'];
type KBCategory = Database['public']['Tables']['kb_categories']['Row'];

export function useKBCategories() {
  return useQuery({
    queryKey: ['kb-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kb_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useKBArticles(categoryId?: string) {
  return useQuery({
    queryKey: ['kb-articles', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('kb_articles')
        .select(`
          *,
          category:kb_categories(id, name, icon),
          author:profiles!kb_articles_author_id_fkey(id, full_name, avatar_url)
        `)
        .eq('is_published', true)
        .order('view_count', { ascending: false });
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useKBArticle(id: string) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['kb-article', id],
    queryFn: async () => {
      // Increment view count
      await supabase.rpc('increment_article_views', { article_id: id }).catch(() => {});
      
      const { data, error } = await supabase
        .from('kb_articles')
        .select(`
          *,
          category:kb_categories(id, name, icon),
          author:profiles!kb_articles_author_id_fkey(id, full_name, avatar_url)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useSearchKBArticles(query: string) {
  return useQuery({
    queryKey: ['kb-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from('kb_articles')
        .select(`
          id,
          title,
          summary,
          category:kb_categories(id, name)
        `)
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: query.length >= 2
  });
}

export function useCreateKBArticle() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (article: Omit<KBArticleInsert, 'author_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('kb_articles')
        .insert({ ...article, author_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
      toast.success('Article créé avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });
}
