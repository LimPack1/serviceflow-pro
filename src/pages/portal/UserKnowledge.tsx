import { useState } from "react";
import { useKBCategories, useKBArticles, useSearchKBArticles } from "@/hooks/useKnowledgeBase";
import { Search, BookOpen, Eye, ArrowRight, ChevronRight, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function UserKnowledge() {
  const { data: categories, isLoading: loadingCategories } = useKBCategories();
  const { data: articles, isLoading: loadingArticles } = useKBArticles();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: searchResults } = useSearchKBArticles(search);

  const displayedArticles = search && searchResults ? searchResults : articles?.filter(
    article => !selectedCategory || article.category_id === selectedCategory
  );

  const popularArticles = articles?.sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Base de connaissances</h1>
        <p className="text-muted-foreground">Trouvez des réponses à vos questions</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article, une solution..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Categories Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Catégories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingCategories ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span>Tous les articles</span>
                    <Badge variant="secondary" className="ml-2">
                      {articles?.length || 0}
                    </Badge>
                  </button>
                  {categories?.map((category) => {
                    const count = articles?.filter(a => a.category_id === category.id).length || 0;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Articles */}
          {!search && popularArticles && popularArticles.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Articles populaires
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {popularArticles.map((article) => (
                    <button
                      key={article.id}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-muted transition-colors"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{article.title}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Articles List */}
        <div className="lg:col-span-3 space-y-4">
          {loadingArticles ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : displayedArticles?.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Aucun article trouvé</p>
                <p className="text-sm">
                  {search ? "Essayez d'autres mots-clés" : "Aucun article dans cette catégorie"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayedArticles?.map((article) => (
                <Card key={article.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {article.summary && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {article.summary}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
