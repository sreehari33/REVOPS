import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { workshopAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Building2, User, Save } from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [workshop, setWorkshop] = useState(null);
  const [workshopForm, setWorkshopForm] = useState({
    name: '',
    address: '',
    phone: '',
    gst_number: ''
  });

  useEffect(() => {
    fetchWorkshop();
  }, []);

  const fetchWorkshop = async () => {
    try {
      const response = await workshopAPI.getMy();
      setWorkshop(response.data);
      setWorkshopForm({
        name: response.data.name || '',
        address: response.data.address || '',
        phone: response.data.phone || '',
        gst_number: response.data.gst_number || ''
      });
    } catch (error) {
      console.error('Failed to load workshop:', error);
      toast.error('Failed to load workshop details');
    }
  };

  const handleWorkshopUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await workshopAPI.update(workshop.id, workshopForm);
      toast.success('Workshop details updated successfully!');
      fetchWorkshop();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update workshop');
    } finally {
      setLoading(false);
    }
  };

  if (!workshop) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Workshop Found</h2>
        <p className="text-muted-foreground mb-6">You need to create a workshop first.</p>
        <Button onClick={() => window.location.href = '/workshop-setup'}>
          Create Workshop
        </Button>
      </div>
    );
  }

  return (
    <div data-testid="settings-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">Manage your workshop and account settings</p>
      </div>

      <Tabs defaultValue="workshop" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workshop" data-testid="workshop-tab">
            <Building2 className="w-4 h-4 mr-2" />
            Workshop Details
          </TabsTrigger>
          <TabsTrigger value="profile" data-testid="profile-tab">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workshop">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight uppercase">
                Workshop Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWorkshopUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workshop Name *</Label>
                  <Input
                    id="name"
                    value={workshopForm.name}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, name: e.target.value })}
                    required
                    className="bg-background border-input"
                    data-testid="workshop-name-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={workshopForm.phone}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, phone: e.target.value })}
                    required
                    className="bg-background border-input"
                    data-testid="workshop-phone-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={workshopForm.address}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, address: e.target.value })}
                    className="bg-background border-input"
                    data-testid="workshop-address-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    value={workshopForm.gst_number}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, gst_number: e.target.value.toUpperCase() })}
                    className="bg-background border-input font-mono"
                    placeholder="22AAAAA0000A1Z5"
                    data-testid="workshop-gst-input"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-red-700 rounded-sm"
                  disabled={loading}
                  data-testid="save-workshop-btn"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight uppercase">
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <div className="p-3 bg-muted/30 rounded-md border border-border">
                    {user?.name}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="p-3 bg-muted/30 rounded-md border border-border font-mono text-sm">
                    {user?.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="p-3 bg-muted/30 rounded-md border border-border">
                    <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm uppercase font-semibold">
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Workshop ID</Label>
                  <div className="p-3 bg-muted/30 rounded-md border border-border font-mono text-xs">
                    {workshop?.id}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  To update your profile information, please contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
