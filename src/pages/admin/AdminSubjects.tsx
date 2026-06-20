import React, { useState, KeyboardEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { generateSubjectCover } from '@/api/http';
import { resolveMediaUrl } from '@/lib/media-url';
import toast from 'react-hot-toast';
import type { Subject } from '@/types';

interface Topic {
  name: string;
  description?: string;
}

interface SubjectForm {
  name: string;
  description: string;
  level: string;
  topics: Topic[];
}

export default function AdminSubjects() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [form, setForm] = useState<SubjectForm>({ name: '', description: '', level: 'S3', topics: [] });
  const [topicInput, setTopicInput] = useState<string>('');

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list(),
  });

  const handleSave = async (): Promise<void> => {
    if (!form.name.trim()) return;
    if (editId) {
      await base44.entities.Subject.update(editId, { ...form });
      toast.success('Subject updated');
    } else {
      const created = await base44.entities.Subject.create({ ...form }) as Subject;
      toast.success('Subject created — generating cover image for landing page…');
      void generateSubjectCover(created.id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
        queryClient.invalidateQueries({ queryKey: ['public-stats'] });
      }).catch(() => undefined);
    }
    setOpen(false);
    setEditId(null);
    setForm({ name: '', description: '', level: 'S3', topics: [] });
    queryClient.invalidateQueries({ queryKey: ['subjects'] });
    queryClient.invalidateQueries({ queryKey: ['public-stats'] });
  };

  const handleGenerateCover = async (id: string): Promise<void> => {
    setGeneratingId(id);
    try {
      await generateSubjectCover(id);
      toast.success('Cover image generated');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['public-stats'] });
    } catch {
      toast.error('Could not generate cover image');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleEdit = (s: Subject): void => {
    setEditId(s.id);
    setForm({ name: s.name, description: s.description || '', level: s.level, topics: s.topics || [] });
    setOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    await base44.entities.Subject.delete(id);
    queryClient.invalidateQueries({ queryKey: ['subjects'] });
  };

  const addTopic = (): void => {
    if (!topicInput.trim()) return;
    setForm({ ...form, topics: [...form.topics, { name: topicInput.trim(), description: '' }] });
    setTopicInput('');
  };

  const removeTopic = (idx: number): void => {
    setForm({ ...form, topics: form.topics.filter((_: Topic, i: number) => i !== idx) });
  };

  const handleTopicKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTopic();
    }
  };

  const handleDialogChange = (v: boolean): void => {
    setOpen(v);
    if (!v) {
      setEditId(null);
      setForm({ name: '', description: '', level: 'S3', topics: [] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Manage Subjects</h1>
          <p className="text-body-sm text-muted-foreground mt-1">Add subjects — AI generates a landing page cover image automatically.</p>
        </div>
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="bg-primary rounded-xl gap-2"><Plus className="w-4 h-4" /> Add Subject</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Subject name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Select value={form.level} onValueChange={(v: string) => setForm({ ...form, level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="S1">S1</SelectItem>
                  <SelectItem value="S2">S2</SelectItem>
                  <SelectItem value="S3">S3</SelectItem>
                  <SelectItem value="S6">S6</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Topics</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Topic name" 
                    value={topicInput} 
                    onChange={(e) => setTopicInput(e.target.value)} 
                    onKeyDown={handleTopicKeyDown}
                  />
                  <Button type="button" onClick={addTopic} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.topics.map((t: Topic, i: number) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {t.name}
                      <button onClick={() => removeTopic(i)} className="ml-1 text-destructive hover:text-destructive">×</button>
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleSave} className="w-full bg-primary">{editId ? 'Update' : 'Create'} Subject</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {subjects.map((s: Subject) => (
          <Card key={s.id} className="border border-border overflow-hidden">
            {s.cover_image_url && (
              <div className="h-32 overflow-hidden">
                <img src={resolveMediaUrl(s.cover_image_url)} alt={s.name} className="w-full h-full object-cover" />
              </div>
            )}
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
                  {!s.cover_image_url && <BookOpen className="w-6 h-6 text-primary" />}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" title="Regenerate cover" disabled={generatingId === s.id} onClick={() => void handleGenerateCover(s.id)}>
                    {generatingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(s)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <Badge variant="outline" className="mb-2">{s.level}</Badge>
              <h3 className="font-heading font-bold text-foreground">{s.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {(s.topics || []).slice(0, 5).map((t: Topic, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">{t.name}</Badge>
                ))}
                {(s.topics || []).length > 5 && <Badge variant="secondary" className="text-xs">+{(s.topics || []).length - 5}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}