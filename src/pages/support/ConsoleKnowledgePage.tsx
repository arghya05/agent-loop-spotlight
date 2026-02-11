import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import knowledgeData from '@/data/support/knowledge.json';
import { BookOpen, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const ConsoleKnowledgePage = () => {
  const [search, setSearch] = useState('');
  const articles = (knowledgeData as any[]).filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some((t: string) => t.includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
          </div>
          <p className="text-sm text-muted-foreground">Articles and SOPs used by the support agent (RAG)</p>
        </div>
        <Button onClick={() => toast.success('Article editor opened')}>
          <Plus className="w-4 h-4 mr-2" />Add Article
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search articles..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {articles.map(article => (
          <Card key={article.id} className="card-elevated hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{article.title}</CardTitle>
              <div className="flex gap-1 flex-wrap">
                {article.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground line-clamp-3">{article.snippet}</p>
              <Button size="sm" variant="ghost" className="mt-2 text-xs p-0 h-auto" onClick={() => toast.success('Test answer sandbox opened')}>
                Test Answer →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
