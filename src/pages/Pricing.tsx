import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Shield, Zap, Crown, ArrowRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import type { SubscriptionPlan } from '@/types';
interface ColorScheme {
  bg: string;
  text: string;
  border: string;
}

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');

  const { data: plans = [], isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ is_active: true }, 'sort_order', 10),
  });

  const iconMap: Record<string, LucideIcon> = { Shield: Shield, Zap: Zap, Crown: Crown };
  const colorMap: ColorScheme[] = [
    { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
    { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  ];

  const handleBillingToggle = (): void => {
    setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly');
  };

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-primary/10 text-primary border-0">Pricing Plans</Badge>
            <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-foreground">
              Choose Your Learning Plan
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Start with a 7-day free trial. No credit card required. Upgrade anytime to unlock full access.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <button
              onClick={handleBillingToggle}
              className="w-14 h-7 bg-primary rounded-full relative transition-colors"
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly <Badge className="ml-1 bg-green-100 text-green-700 border-0 text-xs">Save 20%</Badge>
            </span>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-8 h-96" /></Card>)}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan: SubscriptionPlan, i: number) => {
                const price = billingCycle === 'yearly' ? (plan.price_yearly || plan.price_monthly * 10) : plan.price_monthly;
                const IconComp = iconMap[plan.name] || Shield;
                const colors = colorMap[i] || colorMap[0];
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`border-2 transition-all hover:shadow-xl relative ${plan.recommended ? 'border-primary shadow-lg scale-[1.02]' : 'border-border'}`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-white border-0 px-4 py-1">Most Popular</Badge>
                      </div>
                    )}
                    <CardContent className={`p-8 text-center ${plan.recommended ? 'pt-10' : ''}`}>
                      <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                        <IconComp className={`w-8 h-8 ${colors.text}`} />
                      </div>
                      
                      <h3 className="font-heading font-bold text-xl text-foreground">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>

                      <div className="mt-6 mb-6">
                        <span className="font-heading font-extrabold text-4xl text-foreground">
                          ${price}
                        </span>
                        <span className="text-muted-foreground">/{billingCycle === 'yearly' ? 'year' : 'mo'}</span>
                      </div>

                      <ul className="space-y-3 text-left mb-8">
                        {(plan.features || []).map((f: string, j: number) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-foreground">{f}</span>
                          </li>
                        ))}
                      </ul>

                      <Link to="/register">
                        <Button 
                          className={`w-full rounded-xl h-12 gap-2 font-semibold ${
                            plan.recommended 
                              ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25' 
                              : 'bg-foreground hover:bg-foreground/90'
                          }`}
                        >
                          Start Free Trial <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-2">7-day free trial, cancel anytime</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
  )
}