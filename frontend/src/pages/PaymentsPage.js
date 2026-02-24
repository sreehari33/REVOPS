import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { paymentAPI, settlementAPI } from '@/services/api';
import { CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, settlementsRes] = await Promise.all([
        paymentAPI.getAll(),
        settlementAPI.getAll()
      ]);
      setPayments(paymentsRes.data);
      setSettlements(settlementsRes.data);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (id) => {
    try {
      await paymentAPI.confirm(id);
      toast.success('Payment confirmed!');
      fetchData();
    } catch (error) {
      toast.error('Failed to confirm payment');
    }
  };

  const confirmSettlement = async (id) => {
    try {
      await settlementAPI.confirm(id);
      toast.success('Settlement confirmed!');
      fetchData();
    } catch (error) {
      toast.error('Failed to confirm settlement');
    }
  };

  if (loading) {
    return <div className="text-center py-12" data-testid="loading">Loading...</div>;
  }

  const pendingPayments = payments.filter(p => !p.confirmed_by_owner);
  const confirmedPayments = payments.filter(p => p.confirmed_by_owner);
  const pendingSettlements = settlements.filter(s => !s.confirmed_by_owner);

  return (
    <div data-testid="payments-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
          Payments
        </h1>
        <p className="text-muted-foreground mt-2">
          {payments.length} total payments | {pendingPayments.length} pending confirmation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments */}
        {user?.role === 'owner' && pendingPayments.length > 0 && (
          <Card className="border-border border-yellow-600" data-testid="pending-payments-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight uppercase flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Pending Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-xl font-bold text-primary">
                        ₹{payment.amount.toLocaleString('en-IN')}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => confirmPayment(payment.id)}
                        className="bg-primary hover:bg-red-700"
                        data-testid={`confirm-payment-${payment.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                    </div>
                    <p className="text-sm">{payment.job?.customer_name} - {payment.job?.vehicle_number}</p>
                    <p className="text-xs text-muted-foreground">
                      Collected by {payment.manager_name} on {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Settlements */}
        {user?.role === 'owner' && pendingSettlements.length > 0 && (
          <Card className="border-border border-yellow-600" data-testid="pending-settlements-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight uppercase flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Pending Settlements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingSettlements.map((settlement) => (
                  <div key={settlement.id} className="p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-xl font-bold text-primary">
                        ₹{settlement.amount.toLocaleString('en-IN')}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => confirmSettlement(settlement.id)}
                        className="bg-primary hover:bg-red-700"
                        data-testid={`confirm-settlement-${settlement.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                    </div>
                    <p className="text-sm">From {settlement.manager_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {settlement.job_ids?.length || 0} jobs - {new Date(settlement.submitted_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Payments */}
        <Card className="border-border lg:col-span-2" data-testid="all-payments-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight uppercase">All Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{payment.job?.customer_name} - {payment.job?.vehicle_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.manager_name} | {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold">₹{payment.amount.toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-1 rounded ${payment.confirmed_by_owner ? 'bg-green-600 text-white' : 'bg-yellow-600 text-black'}`}>
                      {payment.confirmed_by_owner ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No payments yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsPage;
