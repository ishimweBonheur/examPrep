import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CreditCard, Smartphone, CheckCircle, Clock, AlertCircle, 
  Crown, Shield, Zap, Loader2, ArrowRight, LucideIcon 
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'
import { formatDate, daysUntil } from '@/lib/format-date';
import { startSubscriptionTrial } from '@/api/http';
import type { SubscriptionPlan, Subscription, Payment } from '@/types';

export default function Billing() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<string>('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const { data: plans = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ is_active: true }, 'sort_order', 10),
  });

  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ['my-subscription'],
    queryFn: () => base44.entities.Subscription.filter({ student_id: user?.id }, '-created_date', 5),
    enabled: !!user?.id,
  });

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ['my-payments'],
    queryFn: () => base44.entities.Payment.filter({ student_id: user?.id }, '-created_date', 20),
    enabled: !!user?.id,
  });

  const currentSub = subscriptions[0];
  const isTrial = currentSub?.status === 'trial';
  const isActive = currentSub?.status === 'active';
  const isExpired = currentSub?.status === 'expired' || currentSub?.status === 'cancelled';
  const hasNoSub = !currentSub;

  const trialDaysLeft = currentSub?.trial_end_date ? daysUntil(currentSub.trial_end_date) : 0;

  const startTrial = async (): Promise<void> => {
    await startSubscriptionTrial();
    queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
    queryClient.invalidateQueries({ queryKey: ['access-status'] });
  };

  const openPayment = (plan: SubscriptionPlan): void => {
    setSelectedPlan(plan);
    setShowPayment(true);
    setSuccess(false);
  };

  const processPayment = async (): Promise<void> => {
    if (!selectedPlan) return;
    setProcessing(true);

    const price = billingCycle === 'yearly'
      ? (selectedPlan.price_yearly || (selectedPlan.price_monthly ?? selectedPlan.price) * 10)
      : (selectedPlan.price_monthly ?? selectedPlan.price);

    // Create payment record
    await base44.entities.Payment.create({
      student_id: user?.id,
      plan_id: selectedPlan.id,
      plan_name: selectedPlan.name,
      amount: price,
      payment_method: paymentMethod,
      status: 'completed',
      billing_cycle: billingCycle,
      transaction_ref: 'PAY-' + Date.now(),
      phone_number: paymentMethod === 'mobile_money' ? phoneNumber : undefined,
    });

    queryClient.invalidateQueries({ queryKey: ['my-payments', 'my-subscription', 'access-status'] });

    setProcessing(false);
    setSuccess(true);
  };

  const handleBillingToggle = (): void => {
    setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly');
  };

  const iconMap: Record<string, LucideIcon> = { Shield, Zap, Crown };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your plan and payments.</p>
      </div>

      {/* Current status */}
      <Card className={`border-2 ${isActive ? 'border-green-200' : isTrial ? 'border-amber-200' : 'border-border'}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {isActive && <Badge className="bg-green-100 text-green-700 border-0 gap-1"><CheckCircle className="w-3 h-3" /> Active</Badge>}
                {isTrial && <Badge className="bg-amber-100 text-amber-700 border-0 gap-1"><Clock className="w-3 h-3" /> Trial</Badge>}
                {isExpired && <Badge className="bg-red-100 text-red-700 border-0 gap-1"><AlertCircle className="w-3 h-3" /> Inactive</Badge>}
                {hasNoSub && <Badge className="bg-muted text-muted-foreground border-0 gap-1"><Clock className="w-3 h-3" /> No Plan</Badge>}
              </div>
              
              {currentSub?.plan_name ? (
                <>
                  <h3 className="font-heading font-bold text-lg text-foreground">{currentSub.plan_name} Plan</h3>
                  {isTrial ? (
                    <p className="text-sm text-amber-600 mt-1">
                      Trial ends {currentSub.trial_end_date ? formatDate(currentSub.trial_end_date, 'short') : 'soon'} ({Math.max(0, trialDaysLeft)} days left)
                    </p>
                  ) : isActive ? (
                    <p className="text-sm text-green-600 mt-1">
                      Active until {formatDate(currentSub.end_date, 'short')}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">Expired on {formatDate(currentSub.end_date, 'short')}</p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="font-heading font-bold text-lg text-foreground">No active plan</h3>
                  <p className="text-sm text-muted-foreground mt-1">Start your 7-day free trial to access all features.</p>
                  <Button onClick={startTrial} className="mt-3 bg-primary rounded-xl gap-2">
                    Start Free Trial <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            
            {currentSub?.payment_method && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {currentSub.payment_method === 'stripe' ? <CreditCard className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                {currentSub.payment_method === 'mobile_money' ? 'Mobile Money' : 'Card'}
                {currentSub.auto_renew && <Badge variant="outline" className="text-xs">Auto-renew</Badge>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="font-heading font-bold text-lg mb-4">
          {currentSub ? 'Upgrade Your Plan' : 'Choose a Plan'}
        </h2>

        <div className="flex items-center gap-3 mb-6">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <button onClick={handleBillingToggle} className="w-11 h-6 bg-primary rounded-full relative">
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
            Yearly <Badge className="ml-1 bg-green-100 text-green-700 border-0 text-xs">Save 20%</Badge>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan: SubscriptionPlan) => {
            const price = billingCycle === 'yearly' ? (plan.price_yearly || (plan.price_monthly ?? plan.price) * 10) : (plan.price_monthly ?? plan.price);
            const isCurrent = currentSub?.plan_id === plan.id;
            const IconComp = iconMap[plan.name] || Shield;
            return (
              <Card key={plan.id} className={`border-2 ${plan.recommended ? 'border-primary' : isCurrent ? 'border-green-300 bg-green-50/30' : 'border-border'}`}>
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <IconComp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground">{plan.name}</h3>
                  <p className="font-heading font-extrabold text-2xl text-foreground mt-2">${price}<span className="text-sm font-normal text-muted-foreground">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span></p>
                  <ul className="text-left space-y-1.5 mt-4 mb-4">
                    {(plan.features || []).slice(0, 4).map((f: string, j: number) => (
                      <li key={j} className="flex items-start gap-1.5 text-xs"><CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => isCurrent ? null : openPayment(plan)}
                    disabled={isCurrent}
                    variant={plan.recommended ? 'default' : 'outline'}
                    className="w-full rounded-xl"
                  >
                    {isCurrent ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card className="border border-border">
          <CardHeader><CardTitle className="font-heading text-lg">Payment History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payments.map((p: Payment) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    {p.payment_method === 'stripe' ? <CreditCard className="w-4 h-4 text-muted-foreground" /> : <Smartphone className="w-4 h-4 text-muted-foreground" />}
                    <div>
                      <p className="font-medium text-sm">{p.plan_name} - {p.billing_cycle}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(p.created_date, 'short')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">${p.amount}</p>
                    <Badge className={p.status === 'completed' ? 'bg-green-100 text-green-700 border-0 text-xs' : 'bg-amber-100 text-amber-700 border-0 text-xs'}>{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{success ? 'Payment Successful!' : 'Complete Payment'}</DialogTitle>
          </DialogHeader>

          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-lg text-foreground">Thank You!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your subscription to {selectedPlan?.name} is now active. Happy learning!
              </p>
              <Button onClick={() => setShowPayment(false)} className="mt-6 bg-primary rounded-xl">Continue Learning</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{selectedPlan?.name} ({billingCycle})</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-foreground">
                    ${billingCycle === 'yearly' ? (selectedPlan?.price_yearly || (selectedPlan?.price_monthly ?? selectedPlan?.price ?? 0) * 10) : (selectedPlan?.price_monthly ?? selectedPlan?.price ?? 0)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('mobile_money')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === 'mobile_money' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  >
                    <Smartphone className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                    <span className="text-xs font-medium">Mobile Money</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                    <span className="text-xs font-medium">Credit Card</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'mobile_money' ? (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                  <Input 
                    placeholder="+250 7XX XXX XXX" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">You'll receive a payment prompt on your phone.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Card Number</label>
                    <Input placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Expiry</label>
                      <Input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">CVC</label>
                      <Input placeholder="123" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} className="rounded-xl" />
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={processPayment} 
                disabled={processing || (paymentMethod === 'mobile_money' && !phoneNumber.trim())} 
                className="w-full bg-primary rounded-xl h-12 gap-2"
              >
                {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <>Pay Now <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}