import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { jobAPI } from '@/services/api';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export const CreateJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    car_model: '',
    vehicle_number: '',
    work_description: '',
    estimated_amount: '',
    advance_paid: '0',
    planned_completion_days: '',
    address: '',
    parts_required: '',
    worker_assigned: '',
    internal_notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        estimated_amount: parseFloat(formData.estimated_amount),
        advance_paid: parseFloat(formData.advance_paid),
        planned_completion_days: parseInt(formData.planned_completion_days)
      };
      await jobAPI.create(payload);
      toast.success('Job created successfully!');
      navigate('/jobs');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="create-job-page">
      <Button
        variant="ghost"
        onClick={() => navigate('/jobs')}
        className="mb-4"
        data-testid="back-btn"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Button>

      <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-8">
        Create New Job
      </h1>

      <Card className="border-border max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight uppercase">Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                  className="bg-background border-input"
                  data-testid="customer-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="bg-background border-input"
                  data-testid="phone-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="car_model">Car Model *</Label>
                <Input
                  id="car_model"
                  value={formData.car_model}
                  onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
                  required
                  className="bg-background border-input"
                  data-testid="car-model-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_number">Vehicle Number *</Label>
                <Input
                  id="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
                  required
                  className="bg-background border-input font-mono"
                  data-testid="vehicle-number-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_amount">Estimated Amount (₹) *</Label>
                <Input
                  id="estimated_amount"
                  type="number"
                  step="0.01"
                  value={formData.estimated_amount}
                  onChange={(e) => setFormData({ ...formData, estimated_amount: e.target.value })}
                  required
                  className="bg-background border-input font-mono"
                  data-testid="estimated-amount-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="advance_paid">Advance Paid (₹)</Label>
                <Input
                  id="advance_paid"
                  type="number"
                  step="0.01"
                  value={formData.advance_paid}
                  onChange={(e) => setFormData({ ...formData, advance_paid: e.target.value })}
                  className="bg-background border-input font-mono"
                  data-testid="advance-paid-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planned_completion_days">Planned Completion (Days) *</Label>
                <Input
                  id="planned_completion_days"
                  type="number"
                  value={formData.planned_completion_days}
                  onChange={(e) => setFormData({ ...formData, planned_completion_days: e.target.value })}
                  required
                  className="bg-background border-input"
                  data-testid="completion-days-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="worker_assigned">Worker Assigned</Label>
                <Input
                  id="worker_assigned"
                  value={formData.worker_assigned}
                  onChange={(e) => setFormData({ ...formData, worker_assigned: e.target.value })}
                  className="bg-background border-input"
                  data-testid="worker-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_description">Work Description *</Label>
              <Textarea
                id="work_description"
                value={formData.work_description}
                onChange={(e) => setFormData({ ...formData, work_description: e.target.value })}
                required
                rows={3}
                className="bg-background border-input"
                data-testid="work-description-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Customer Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="bg-background border-input"
                data-testid="address-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parts_required">Parts Required</Label>
              <Textarea
                id="parts_required"
                value={formData.parts_required}
                onChange={(e) => setFormData({ ...formData, parts_required: e.target.value })}
                rows={2}
                className="bg-background border-input"
                data-testid="parts-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_notes">Internal Notes</Label>
              <Textarea
                id="internal_notes"
                value={formData.internal_notes}
                onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                rows={2}
                className="bg-background border-input"
                data-testid="notes-input"
              />
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="bg-primary text-primary-foreground hover:bg-red-700 rounded-sm"
                disabled={loading}
                data-testid="submit-job-btn"
              >
                {loading ? 'Creating...' : 'Create Job'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/jobs')}
                data-testid="cancel-btn"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateJob;
