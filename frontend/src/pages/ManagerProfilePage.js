import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { workshopAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Building2, User, Mail, Phone, Briefcase, Calendar } from 'lucide-react';

export const ManagerProfilePage = () => {
  const { user } = useAuth();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkshop();
  }, []);

  const fetchWorkshop = async () => {
    try {
      const response = await workshopAPI.getMy();
      setWorkshop(response.data);
    } catch (error) {
      console.error('Failed to load workshop:', error);
      toast.error('Failed to load workshop details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  return (
    <div data-testid="manager-profile-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
          My Profile
        </h1>
        <p className="text-muted-foreground mt-2">Your account and workshop information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight uppercase flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-mono">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <div className="mt-1">
                  <span className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm uppercase font-semibold">
                    Manager
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                To update your personal information, please contact the workshop owner.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Workshop Information */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight uppercase flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Workshop Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workshop ? (
              <>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Workshop Name</p>
                    <p className="text-lg font-semibold">{workshop.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Workshop Phone</p>
                    <p className="text-lg font-mono">{workshop.phone}</p>
                  </div>
                </div>

                {workshop.address && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-base">{workshop.address}</p>
                    </div>
                  </div>
                )}

                {workshop.gst_number && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">GST Number</p>
                      <p className="text-base font-mono">{workshop.gst_number}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <div className="p-3 bg-muted/30 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Workshop ID</p>
                    <p className="text-xs font-mono text-muted-foreground">{workshop.id}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Workshop information not available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight uppercase">
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">User ID</p>
                <p className="text-xs font-mono break-all">{user?.id}</p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Workshop ID</p>
                <p className="text-xs font-mono break-all">{user?.workshop_id || 'Not assigned'}</p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Account Status</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Active</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-600 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> For password changes, account deactivation, or other security settings, please contact your workshop owner.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerProfilePage;
