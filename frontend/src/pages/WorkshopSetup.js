import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { workshopAPI } from '@/services/api';
import { toast } from 'sonner';
import { Wrench } from 'lucide-react';

export const WorkshopSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    gst_number: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await workshopAPI.create(formData);
      toast.success('Workshop created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create workshop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl border-border" data-testid="workshop-setup-card">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Wrench className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-black tracking-tighter uppercase">Workshop Setup</CardTitle>
          </div>
          <CardDescription className="text-center">
            Let's set up your workshop profile to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workshop Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., City Auto Workshop"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                data-testid="workshop-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                data-testid="workshop-phone-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main Street, City, State"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent"
                data-testid="workshop-address-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst_number">GST Number</Label>
              <Input
                id="gst_number"
                type="text"
                placeholder="22AAAAA0000A1Z5"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })}
                className="bg-background border-input focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                data-testid="workshop-gst-input"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-red-700 rounded-sm"
              disabled={loading}
              data-testid="workshop-setup-submit-btn"
            >
              {loading ? 'Creating Workshop...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkshopSetup;
