import React, { useState, KeyboardEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DollarSign, CreditCard, Users, TrendingUp,
  Plus, Pencil, Trash2, Crown, Shield, Zap, LucideIcon
} from 'lucide-react';
import { formatDate } from '@/lib/format-date';
import type { SubscriptionPlan, Subscription, Payment, User } from '@/types';

const defaultFeatures: Record<string, string[]> = {
  Shield: ['Access to practice questions', 'Basic progress tracking', 'Community access'],
  Zap: ['All Basic features', 'AI Tutor access', 'Mock exams', 'Priority support'],
  Crown: ['All Premium features', 'Unlimited questions', 'Personalized learning path', 'Teacher consultations'],
};

const iconMap: Record<string, LucideIcon> = { Shield, Zap, Crown };

interface PlanForm {
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  recommended: boolean;
  sort_order: number;
}

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}

export default function AdminBilling() {
  const queryClient = useQueryClient();
  const [planOpen, setPlanOpen] = useState<boolean>(false);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState<PlanForm>({ 
    name: '', description: '', price_monthly: 0, price_yearly: 0, 
    features: [], recommended: false, sort_order: 0 
  });
  const [featureInput, setFeatureInput] = useState<string>('');

  const { data: plans = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: () => base44.entities.SubscriptionPlan.list('sort_order', 10),
  });

  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ['all-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 200),
  });

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ['all-payments'],
    queryFn: () => base44.entities.Payment.list('-created_date', 200),
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['admin-students'],
    queryFn: () => base44.entities.User.list(),
  });

  const totalRevenue = payments
    .filter((p: Payment) => p.status === 'completed')
    .reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0);
    
  const activeSubs = subscriptions.filter((s: Subscription) => s.status === 'active').length;
  const trialSubs = subscriptions.filter((s: Subscription) => s.status === 'trial').length;
  const students = users.filter((u: User) => u.role !== 'admin').length;

  const stats: StatItem[] = [
    { icon: DollarSign, label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Users, label: 'Active Subscribers', value: activeSubs, color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: TrendingUp, label: 'Trial Users', value: trialSubs, color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: CreditCard, label: 'Total Students', value: students, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const openPlanDialog = (plan: SubscriptionPlan | null): void => {
    if (plan) {
      setEditPlan(plan);
      setPlanForm({ 
        name: plan.name, 
        description: plan.description || '', 
        price_monthly: plan.price_monthly ?? plan.price,
        price_yearly: plan.price_yearly ?? (plan.price_monthly ?? plan.price) * 10,
        features: plan.features || [],
        recommended: plan.recommended ?? false, 
        sort_order: plan.sort_order 
      });
    } else {
      setEditPlan(null);
      const name = plans.length === 0 ? 'Basic' : plans.length === 1 ? 'Premium' : 'Ultimate';
      setPlanForm({ 
        name, description: '', price_monthly: 0, price_yearly: 0, 
        features: defaultFeatures['Shield'] || ['Access to platform'], 
        recommended: false, sort_order: plans.length 
      });
    }
    setPlanOpen(true);
  };

  const savePlan = async (): Promise<void> => {
    if (!planForm.name.trim()) return;
    if (editPlan) {
      await base44.entities.SubscriptionPlan.update(editPlan.id, { ...planForm, is_active: true });
    } else {
      await base44.entities.SubscriptionPlan.create({ ...planForm, is_active: true });
    }
    setPlanOpen(false);
    queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
  };

  const deletePlan = async (id: string): Promise<void> => {
    await base44.entities.SubscriptionPlan.delete(id);
    queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
  };

  const togglePlanStatus = async (plan: SubscriptionPlan): Promise<void> => {
    await base44.entities.SubscriptionPlan.update(plan.id, { is_active: !plan.is_active });
    queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
  };

  const addFeature = (): void => {
    if (!featureInput.trim()) return;
    setPlanForm({ ...planForm, features: [...planForm.features, featureInput.trim()] });
    setFeatureInput('');
  };

  const removeFeature = (index: number): void => {
    setPlanForm({ ...planForm, features: planForm.features.filter((_: string, j: number) => j !== index) });
  };

  const handleFeatureKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  const getStudentName = (studentId: string): string => {
    const u = users.find((u: User) => u.id === studentId);
    return u?.full_name || u?.email || 'Unknown';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Billing & Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Manage plans, subscriptions, and payments.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s: StatItem, i: number) => (
          <Card key={i} className="border border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <p className="font-heading font-bold text-2xl text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans Management */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg">Subscription Plans</h2>
        <Dialog open={planOpen} onOpenChange={setPlanOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary rounded-xl gap-2" onClick={() => openPlanDialog(null)}>
              <Plus className="w-4 h-4" /> Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editPlan ? 'Edit Plan' : 'New Plan'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input 
                placeholder="Plan name" 
                value={planForm.name} 
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} 
              />
              <Textarea 
                placeholder="Description" 
                value={planForm.description} 
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} 
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Monthly Price ($)</label>
                  <Input 
                    type="number" 
                    value={planForm.price_monthly} 
                    onChange={(e) => setPlanForm({ ...planForm, price_monthly: parseFloat(e.target.value) || 0 })} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Yearly Price ($)</label>
                  <Input 
                    type="number" 
                    value={planForm.price_yearly} 
                    onChange={(e) => setPlanForm({ ...planForm, price_yearly: parseFloat(e.target.value) || 0 })} 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Features</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add feature" 
                    value={featureInput} 
                    onChange={(e) => setFeatureInput(e.target.value)} 
                    onKeyDown={handleFeatureKeyDown} 
                  />
                  <Button variant="outline" onClick={addFeature}>Add</Button>
                </div>
                <div className="space-y-1 mt-2">
                  {planForm.features.map((f: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-sm">{f}</span>
                      <button onClick={() => removeFeature(i)} className="text-destructive text-sm">×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Recommended</span>
                <Switch checked={planForm.recommended} onCheckedChange={(v: boolean) => setPlanForm({ ...planForm, recommended: v })} />
              </div>
              <Button onClick={savePlan} className="w-full bg-primary">
                {editPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan: SubscriptionPlan) => {
          const IconComp = iconMap[plan.name] || Shield;
          const subsForPlan = subscriptions.filter((s: Subscription) => s.plan_id === plan.id && s.status === 'active').length;
          return (
            <Card 
              key={plan.id} 
              className={`border-2 ${plan.recommended ? 'border-primary' : plan.is_active ? 'border-border' : 'border-muted opacity-60'}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <IconComp className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openPlanDialog(plan)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deletePlan(plan.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading font-bold text-foreground">{plan.name}</h3>
                  {plan.recommended && <Badge className="bg-primary text-white border-0 text-xs">Popular</Badge>}
                </div>
                <p className="text-2xl font-heading font-extrabold text-foreground">
                  ${plan.price_monthly ?? plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{subsForPlan} active subscribers</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{plan.is_active ? 'Active' : 'Inactive'}</span>
                  <Switch checked={plan.is_active} onCheckedChange={() => togglePlanStatus(plan)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subscriptions Table */}
      <Card className="border border-border">
        <CardHeader><CardTitle className="font-heading text-lg">Recent Subscriptions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.slice(0, 20).map((s: Subscription) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-sm">{getStudentName(s.student_id)}</TableCell>
                  <TableCell>{s.plan_name || '—'}</TableCell>
                  <TableCell>
                    <Badge className={
                      s.status === 'active' ? 'bg-green-100 text-green-700 border-0' : 
                      s.status === 'trial' ? 'bg-amber-100 text-amber-700 border-0' :
                      'bg-red-100 text-red-700 border-0'
                    }>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.start_date ? formatDate(s.start_date, 'short') : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.end_date ? formatDate(s.end_date, 'short') : '—'}
                  </TableCell>
                  <TableCell className="font-medium">${s.amount_paid || 0}</TableCell>
                  <TableCell className="capitalize text-sm text-muted-foreground">{(s as Subscription & { payment_method?: string }).payment_method || '—'}</TableCell>
                </TableRow>
              ))}
              {subscriptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No subscriptions yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border border-border">
        <CardHeader><CardTitle className="font-heading text-lg">Recent Payments</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.slice(0, 20).map((p: Payment) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-sm">{getStudentName(p.student_id)}</TableCell>
                  <TableCell>{p.plan_name || '—'}</TableCell>
                  <TableCell className="font-medium">${p.amount}</TableCell>
                  <TableCell className="capitalize text-sm text-muted-foreground">{p.method || '—'}</TableCell>
                  <TableCell>
                    <Badge className={
                      p.status === 'completed' ? 'bg-green-100 text-green-700 border-0' : 
                      p.status === 'pending' ? 'bg-amber-100 text-amber-700 border-0' : 
                      'bg-red-100 text-red-700 border-0'
                    }>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(p.created_date, 'short')}
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payments yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}