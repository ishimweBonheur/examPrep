import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { parseQuestionImport, publishQuestionImport, type ImportPreview } from '@/api/stats';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Loader2, Sparkles, Upload, FileSpreadsheet } from 'lucide-react';
import { ALL_ACADEMIC_LEVELS } from '@/lib/student-level';
import toast from 'react-hot-toast';
import type { Question, Subject } from '@/types';

interface Option {
  label: string;
  text: string;
}

interface QuestionForm {
  subject_id: string;
  topic: string;
  question_text: string;
  correct_answer: string;
  explanation: string;
  difficulty: string;
  level: string;
  options: Option[];
}

interface LLMQuestion {
  question_text: string;
  options: string[] | Option[];
  correct_answer: number | string;
  explanation: string;
}

interface LLMResponse {
  questions: LLMQuestion[];
}

const LABELS = ['A', 'B', 'C', 'D'];

function formToQuestionPayload(form: QuestionForm) {
  const correctIdx = LABELS.indexOf(form.correct_answer)
  return {
    subject_id: form.subject_id,
    topic: form.topic,
    question_text: form.question_text,
    options: form.options.map((o) => o.text),
    correct_answer: correctIdx >= 0 ? correctIdx : 0,
    explanation: form.explanation,
    difficulty: form.difficulty as Question['difficulty'],
    level: form.level || 'S3',
    year: new Date().getFullYear(),
  }
}

export default function AdminQuestions() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importLevel, setImportLevel] = useState('S3');
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [form, setForm] = useState<QuestionForm>({
    subject_id: '', topic: '', question_text: '', correct_answer: 'A',
    explanation: '', difficulty: 'medium', level: 'S3',
    options: [
      { label: 'A', text: '' }, { label: 'B', text: '' },
      { label: 'C', text: '' }, { label: 'D', text: '' },
    ],
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list(),
  });

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['admin-questions', subjectFilter],
    queryFn: () => subjectFilter
      ? base44.entities.Question.filter({ subject_id: subjectFilter }, '-created_date', 100)
      : base44.entities.Question.list('-created_date', 100),
  });

  const handleSave = async (): Promise<void> => {
    if (!form.question_text.trim() || !form.subject_id) return;
    await base44.entities.Question.create(formToQuestionPayload(form));
    setOpen(false);
    setForm({
      subject_id: '', topic: '', question_text: '', correct_answer: 'A',
      explanation: '', difficulty: 'medium', level: 'S3',
      options: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }],
    });
    queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
  };

  const handleDelete = async (id: string): Promise<void> => {
    await base44.entities.Question.delete(id);
    queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
  };

  const aiGenerate = async (): Promise<void> => {
    if (!form.subject_id) return;
    setGenerating(true);
    const subjectName = subjects.find((s: Subject) => s.id === form.subject_id)?.name || 'General';
    const topicName = form.topic || 'various topics';
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 5 multiple choice questions for Rwandan S3 students studying ${subjectName} on ${topicName}. Each with 4 options (A-D), one correct answer, and explanation. Format for national exam style.`,
      response_json_schema: {
        type: "object",
        properties: {
          questions: { type: "array", items: { type: "object", properties: {
            question_text: { type: "string" },
            options: { type: "array", items: { type: "object", properties: { label: { type: "string" }, text: { type: "string" } } } },
            correct_answer: { type: "string" },
            explanation: { type: "string" }
          }}}
        }
      }
    }) as LLMResponse;
    const qs = result.questions || [];
    for (const q of qs) {
      const options = Array.isArray(q.options) && typeof q.options[0] === 'string'
        ? (q.options as string[])
        : (q.options as Option[]).map((o) => o.text)
      const correctIdx = typeof q.correct_answer === 'number'
        ? q.correct_answer
        : LABELS.indexOf(String(q.correct_answer))
      await base44.entities.Question.create({
        subject_id: form.subject_id,
        topic: form.topic,
        level: 'S3',
        year: new Date().getFullYear(),
        question_text: q.question_text,
        options,
        correct_answer: correctIdx >= 0 ? correctIdx : 0,
        explanation: q.explanation,
        difficulty: 'medium',
      });
    }
    setGenerating(false);
    queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
  };

  const handleImportFile = async (file: File) => {
    setImporting(true);
    try {
      const preview = await parseQuestionImport(file, importLevel);
      setImportPreview(preview);
      toast.success(`Parsed ${preview.total} rows — ${preview.valid} valid`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handlePublishImport = async () => {
    if (!importPreview) return;
    setPublishing(true);
    try {
      const valid = importPreview.questions.filter((q) => q.errors.length === 0 && !q.is_duplicate);
      const result = await publishQuestionImport(importPreview.batch_id, valid);
      toast.success(`Published ${result.created_count} questions`);
      if (result.failed.length > 0) toast.error(`${result.failed.length} rows failed`);
      setImportOpen(false);
      setImportPreview(null);
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
    } catch {
      toast.error('Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const updateOption = (idx: number, text: string): void => {
    const newOptions = [...form.options];
    newOptions[idx] = { ...newOptions[idx], text };
    setForm({ ...form, options: newOptions });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground">Question Bank</h1>
          <p className="text-muted-foreground mt-1">{questions.length} questions in bank.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2"><FileSpreadsheet className="w-4 h-4" /> Bulk Upload</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Bulk Question Upload</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload Excel (.xlsx) or CSV with columns: subject, topic, question_text, option_a–d, correct_answer (A-D), explanation, difficulty, year.
                </p>
                <Select value={importLevel} onValueChange={setImportLevel}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Level" /></SelectTrigger>
                  <SelectContent>
                    {ALL_ACADEMIC_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="border-2 border-dashed rounded-xl p-6 text-center relative">
                  {importing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <Upload className="w-6 h-6 mx-auto text-muted-foreground" />}
                  <p className="text-sm text-muted-foreground mt-2">Select .xlsx or .csv file</p>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleImportFile(f);
                  }} />
                </div>
                {importPreview && (
                  <>
                    <div className="flex gap-3 text-sm flex-wrap">
                      <Badge>{importPreview.total} total</Badge>
                      <Badge className="bg-green-100 text-green-800">{importPreview.valid} valid</Badge>
                      <Badge variant="secondary">{importPreview.duplicates} duplicates</Badge>
                      <Badge variant="destructive">{importPreview.errors} errors</Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Question</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importPreview.questions.slice(0, 50).map((q) => (
                          <TableRow key={q.row_number}>
                            <TableCell>{q.row_number}</TableCell>
                            <TableCell>{q.subject_name}</TableCell>
                            <TableCell className="max-w-xs truncate">{q.question_text}</TableCell>
                            <TableCell className="capitalize">{q.difficulty}</TableCell>
                            <TableCell>
                              {q.is_duplicate ? <Badge variant="secondary">Duplicate</Badge>
                                : q.errors.length ? <Badge variant="destructive">{q.errors[0]}</Badge>
                                : <Badge>Ready</Badge>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button onClick={() => void handlePublishImport()} disabled={publishing || importPreview.valid === 0} className="w-full">
                      {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Publish ${importPreview.valid} questions`}
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary rounded-xl gap-2"><Plus className="w-4 h-4" /> Add Question</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={form.subject_id} onValueChange={(v: string) => setForm({ ...form, subject_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>{subjects.map((s: Subject) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
                <Textarea placeholder="Question text" value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} rows={3} />
                {form.options.map((opt: Option, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Badge variant="outline" className="shrink-0">{opt.label}</Badge>
                    <Input placeholder={`Option ${opt.label}`} value={opt.text} onChange={(e) => updateOption(i, e.target.value)} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.level} onValueChange={(v: string) => setForm({ ...form, level: v })}>
                    <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                    <SelectContent>
                      {ALL_ACADEMIC_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={form.difficulty} onValueChange={(v: string) => setForm({ ...form, difficulty: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.correct_answer} onValueChange={(v: string) => setForm({ ...form, correct_answer: v })}>
                    <SelectTrigger><SelectValue placeholder="Correct answer" /></SelectTrigger>
                    <SelectContent>
                      {['A','B','C','D'].map((l: string) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Explanation" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} />
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1 bg-primary">Save Question</Button>
                  <Button onClick={aiGenerate} disabled={generating || !form.subject_id} variant="outline" className="gap-2">
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    AI Generate 5
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={!subjectFilter ? 'default' : 'outline'} size="sm" className="rounded-full" onClick={() => setSubjectFilter('')}>All</Button>
        {subjects.map((s: Subject) => (
          <Button key={s.id} variant={subjectFilter === s.id ? 'default' : 'outline'} size="sm" className="rounded-full" onClick={() => setSubjectFilter(s.id)}>
            {s.name}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i: number) => <Card key={i} className="animate-pulse border border-border"><CardContent className="p-4 h-20" /></Card>)}</div>
      ) : (
        <div className="space-y-3">
          {questions.map((q: Question) => (
            <Card key={q.id} className="border border-border">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className="text-xs capitalize">{q.difficulty}</Badge>
                    <Badge variant="outline" className="text-xs">{q.level}</Badge>
                    {q.topic && <Badge variant="secondary" className="text-xs">{q.topic}</Badge>}
                  </div>
                  <p className="text-sm font-medium text-foreground">{q.question_text}</p>
                  <p className="text-xs text-muted-foreground mt-1">Answer: {LABELS[q.correct_answer] ?? q.correct_answer}</p>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => handleDelete(q.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}