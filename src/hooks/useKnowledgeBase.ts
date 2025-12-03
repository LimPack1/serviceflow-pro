import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface KBArticleWithRelations {
  id: string;
  category_id: string | null;
  title: string;
  content: string;
  summary: string | null;
  author_id: string | null;
  view_count: number;
  is_published: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
  author?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useKBCategories() {
  return useQuery({
    queryKey: ['kb-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kb_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useKBArticles(categoryId?: string) {
  return useQuery({
    queryKey: ['kb-articles', categoryId],
    queryFn: async (): Promise<KBArticleWithRelations[]> => {
      let query = supabase
        .from('kb_articles')
        .select('*')
        .eq('is_published', true)
        .order('view_count', { ascending: false });
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data: articles, error } = await query;
      if (error) throw error;
      if (!articles || articles.length === 0) return [];

      // Fetch categories and authors
      const categoryIds = [...new Set(articles.filter(a => a.category_id).map(a => a.category_id!))];
      const authorIds = [...new Set(articles.filter(a => a.author_id).map(a => a.author_id!))];

      const [categoriesRes, authorsRes] = await Promise.all([
        categoryIds.length > 0 
          ? supabase.from('kb_categories').select('id, name, icon').in('id', categoryIds)
          : { data: [] },
        authorIds.length > 0
          ? supabase.from('profiles').select('id, full_name, avatar_url').in('id', authorIds)
          : { data: [] }
      ]);

      const categoryMap = new Map<string, { id: string; name: string; icon: string | null }>();
      categoriesRes.data?.forEach(c => categoryMap.set(c.id, c));
      
      const authorMap = new Map<string, { id: string; full_name: string | null; avatar_url: string | null }>();
      authorsRes.data?.forEach(a => authorMap.set(a.id, a));

      return articles.map(article => ({
        ...article,
        category: article.category_id ? categoryMap.get(article.category_id) || null : null,
        author: article.author_id ? authorMap.get(article.author_id) || null : null
      }));
    }
  });
}

export function useKBArticle(id: string) {
  return useQuery({
    queryKey: ['kb-article', id],
    queryFn: async () => {
      const { data: article, error } = await supabase
        .from('kb_articles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;

      let category = null;
      let author = null;

      if (article.category_id) {
        const { data } = await supabase
          .from('kb_categories')
          .select('id, name, icon')
          .eq('id', article.category_id)
          .maybeSingle();
        category = data;
      }

      if (article.author_id) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', article.author_id)
          .maybeSingle();
        author = data;
      }

      return { ...article, category, author };
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
        .select('id, title, summary, category_id')
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2
  });
}

export function useCreateKBArticle() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (article: {
      title: string;
      content: string;
      summary?: string;
      category_id?: string;
      is_published?: boolean;
      tags?: string[];
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('kb_articles')
        .insert({
          title: article.title,
          content: article.content,
          summary: article.summary,
          category_id: article.category_id,
          is_published: article.is_published ?? false,
          tags: article.tags,
          author_id: user.id
        })
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
