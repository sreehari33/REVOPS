import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { managerAPI, workshopAPI } from '@/services/api';
import { Users, Copy, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export const ManagersPage = () => {
  const [managers, setManagers] = useState([]);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [workshopId, setWorkshopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [managersRes, workshopRes] = await Promise.all([
        managerAPI.getAll(),
        workshopAPI.getMy()
      ]);
      setManagers(managersRes.data);
      setWorkshopId(workshopRes.data.id);
      
      if (workshopRes.data.id) {
        const codesRes = await workshopAPI.getInviteCodes(workshopRes.data.id);
        setInviteCodes(codesRes.data.filter(c => c.is_active));
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error(error.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async () => {
    if (!workshopId) {
      toast.error('Workshop not found. Please create a workshop first.');
      return;
    }
    
    try {
      await workshopAPI.createInviteCode(workshopId);
      toast.success('Invite code generated!');
      fetchData();
      setInviteDialogOpen(true);
    } catch (error) {
      console.error('Generate invite error:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate invite code');
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Invite code copied to clipboard!');
  };

  const removeManager = async (id) => {
    if (!window.confirm('Are you sure you want to remove this manager?')) return;
    
    try {
      await managerAPI.remove(id);
      toast.success('Manager removed successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove manager');
    }
  };

  if (loading) {
    return <div className="text-center py-12" data-testid="loading">Loading...</div>;
  }

  return (
    <div data-testid="managers-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
            Managers
          </h1>
          <p className="text-muted-foreground mt-2">{managers.length} active managers</p>
        </div>
        <Button 
          onClick={generateInviteCode}
          className="bg-primary hover:bg-red-700 rounded-sm"
          data-testid="generate-invite-btn"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Generate Invite Code
        </Button>
      </div>

      {/* Invite Codes */}
      {inviteCodes.length > 0 && (
        <Card className="border-border mb-6" data-testid="invite-codes-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight uppercase">Active Invite Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inviteCodes.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                  <div>
                    <p className="font-mono text-2xl font-bold text-primary">{invite.code}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {invite.used_by ? 'Used' : 'Available'} - Created {new Date(invite.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteCode(invite.code)}
                    disabled={!!invite.used_by}
                    data-testid={`copy-invite-${invite.code}`}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Managers List */}
      <Card className="border-border" data-testid="managers-list-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight uppercase">All Managers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {managers.map((manager) => (
              <div key={manager.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">{manager.user?.name}</p>
                    <p className="text-sm text-muted-foreground">{manager.user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined {new Date(manager.joined_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeManager(manager.id)}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                  data-testid={`remove-manager-${manager.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {managers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No managers yet. Generate an invite code to onboard your first manager!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagersPage;
