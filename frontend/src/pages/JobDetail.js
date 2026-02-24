import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { jobAPI, paymentAPI, documentAPI } from '@/services/api';
import { ArrowLeft, Download, CreditCard, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_type: 'partial',
    notes: ''
  });
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await jobAPI.getById(id);
      setJob(response.data);
      setNewStatus(response.data.status);
    } catch (error) {
      toast.error('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentAPI.create({
        job_id: id,
        amount: parseFloat(paymentData.amount),
        payment_type: paymentData.payment_type,
        notes: paymentData.notes
      });
      toast.success('Payment recorded successfully');
      setPaymentDialogOpen(false);
      setPaymentData({ amount: '', payment_type: 'partial', notes: '' });
      fetchJob();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await jobAPI.update(id, { status: newStatus });
      toast.success('Status updated successfully');
      setStatusUpdateOpen(false);
      fetchJob();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const downloadDocument = async (type) => {
    try {
      const response = type === 'jobcard' 
        ? await documentAPI.getJobCard(id)
        : await documentAPI.getInvoice(id);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${id.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${type === 'jobcard' ? 'Job card' : 'Invoice'} downloaded`);
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  if (loading) {
    return <div className="text-center py-12" data-testid="loading">Loading job...</div>;
  }

  if (!job) {
    return <div className="text-center py-12">Job not found</div>;
  }

  return (
    <div data-testid="job-detail-page">
      <Button
        variant="ghost"
        onClick={() => navigate('/jobs')}
        className="mb-4"
        data-testid="back-btn"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
            {job.customer_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            <span className="font-mono font-semibold">{job.vehicle_number}</span> - {job.car_model}
          </p>
        </div>
        <span className={`status-badge status-${job.status}`}>
          {job.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border" data-testid="job-details-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight uppercase">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Work Description</Label>
                <p className="mt-1">{job.work_description}</p>
              </div>
              {job.parts_required && (
                <div>
                  <Label className="text-xs text-muted-foreground">Parts Required</Label>
                  <p className="mt-1">{job.parts_required}</p>
                </div>
              )}
              {job.worker_assigned && (
                <div>
                  <Label className="text-xs text-muted-foreground">Worker Assigned</Label>
                  <p className="mt-1">{job.worker_assigned}</p>
                </div>
              )}
              {job.internal_notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Internal Notes</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{job.internal_notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="mt-1">{job.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Completion Days</Label>
                  <p className="mt-1">{job.planned_completion_days} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="border-border" data-testid="payment-history-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight uppercase">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {job.payments?.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-semibold">₹{payment.amount.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${payment.confirmed_by_owner ? 'bg-green-600 text-white' : 'bg-yellow-600 text-black'}`}>
                        {payment.confirmed_by_owner ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
                {(!job.payments || job.payments.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">No payments recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card className="border-border border-primary/50" data-testid="financial-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight uppercase">Financial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Estimated Amount</Label>
                <p className="text-2xl font-black font-mono text-primary">
                  ₹{job.estimated_amount.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Total Paid</Label>
                <p className="text-xl font-bold font-mono text-green-500">
                  ₹{job.total_paid.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="pt-3 border-t border-border">
                <Label className="text-xs text-muted-foreground">Remaining</Label>
                <p className="text-xl font-bold font-mono text-yellow-500">
                  ₹{job.remaining_amount.toLocaleString('en-IN')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {user?.role === 'manager' && (
            <Card className="border-border" data-testid="actions-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold tracking-tight uppercase">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-red-700 rounded-sm" data-testid="record-payment-btn">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Record Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Record Payment</DialogTitle>
                      <DialogDescription>Add a new payment for this job</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePaymentSubmit}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (₹)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={paymentData.amount}
                            onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                            required
                            className="bg-background font-mono"
                            data-testid="payment-amount-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment_type">Payment Type</Label>
                          <Select value={paymentData.payment_type} onValueChange={(value) => setPaymentData({ ...paymentData, payment_type: value })}>
                            <SelectTrigger className="bg-background" data-testid="payment-type-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="advance">Advance</SelectItem>
                              <SelectItem value="partial">Partial</SelectItem>
                              <SelectItem value="final">Final</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="bg-primary hover:bg-red-700" data-testid="submit-payment-btn">Submit</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" data-testid="update-status-btn">
                      Update Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Update Job Status</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="bg-background" data-testid="status-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="waiting_for_parts">Waiting for Parts</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="credit_pending">Credit Pending</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleStatusUpdate} className="bg-primary hover:bg-red-700" data-testid="submit-status-btn">
                        Update
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          <Card className="border-border" data-testid="documents-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight uppercase">Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => downloadDocument('jobcard')}
                data-testid="download-jobcard-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Job Card
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => downloadDocument('invoice')}
                data-testid="download-invoice-btn"
              >
                <FileText className="w-4 h-4 mr-2" />
                Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
