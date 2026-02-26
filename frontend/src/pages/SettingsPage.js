import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { workshopAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { CURRENCIES } from '@/utils/currency';
import { toast } from 'sonner';
import { Building2, User, Save, DollarSign, CheckCircle2 } from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { currency, updateCurrency } = useCurrency();

  const [loading, setLoading] = useState(false);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [workshop, setWorkshop] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(currency?.code || 'INR');

  const [workshopForm, setWorkshopForm] = useState({
    name: '',
    address: '',
    phone: '',
    gst_number: ''
  });

  useEffect(() => {
    fetchWorkshop();
  }, []);

  // Keep local selectedCurrency in sync when context loads
  useEffect(() => {
    if (currency?.code) {
      setSelectedCurrency(currency.code);
    }
  }, [currency]);

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
      // Set currency from workshop data
      if (response.data.currency) {
        setSelectedCurrency(response.data.currency);
      }
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

  const handleCurrencyUpdate = async () => {
    setCurrencyLoading(true);
    try {
      await workshopAPI.update(workshop.id, { currency: selectedCurrency });
      updateCurrency(selectedCurrency);
      toast.success('Currency updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update currency');
    } finally {
      setCurrencyLoading(false);
    }
  };

  // Group currencies: Middle East first, then others
  const middleEastCodes = ['QAR', 'AED', 'SAR', 'KWD', 'BHD', 'OMR', 'JOD', 'EGP'];
  const middleEastCurrencies = CURRENCIES.filter(c => middleEastCodes.includes(c.code));
  const otherCurrencies = CURRENCIES.filter(c => !middleEastCodes.includes(c.code));

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
          <TabsTrigger value="currency" data-testid="currency-tab">
            <DollarSign className="w-4 h-4 mr-2" />
            Currency
          </TabsTrigger>
          <TabsTrigger value="profile" data-testid="profile-tab">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* ── Workshop Details Tab ── */}
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

        {/* ── Currency Tab ── */}
        <TabsContent value="currency">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight uppercase">
                Currency Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select the currency for your workshop. All amounts will display in this currency.
                Language stays English regardless of selection.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Current selection preview */}
              <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/30 rounded-sm">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Currently Active</p>
                  <p className="font-mono font-bold text-lg">
                    {CURRENCIES.find(c => c.code === selectedCurrency)?.symbol}{' '}
                    <span className="text-muted-foreground font-normal text-sm">
                      — {CURRENCIES.find(c => c.code === selectedCurrency)?.name}
                    </span>
                  </p>
                </div>
              </div>

              {/* Middle East section */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                  Middle East
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {middleEastCurrencies.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCurrency(c.code)}
                      className={`
                        flex items-center gap-2 p-3 rounded-sm border text-left transition-all
                        ${selectedCurrency === c.code
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }
                      `}
                    >
                      <span className="font-mono font-bold text-sm w-10 shrink-0">{c.symbol}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{c.code}</p>
                        <p className="text-xs truncate opacity-70">{c.name}</p>
                      </div>
                      {selectedCurrency === c.code && (
                        <CheckCircle2 className="w-4 h-4 text-primary ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other currencies section */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Other Currencies
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {otherCurrencies.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedCurrency(c.code)}
                      className={`
                        flex items-center gap-2 p-3 rounded-sm border text-left transition-all
                        ${selectedCurrency === c.code
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }
                      `}
                    >
                      <span className="font-mono font-bold text-sm w-10 shrink-0">{c.symbol}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{c.code}</p>
                        <p className="text-xs truncate opacity-70">{c.name}</p>
                      </div>
                      {selectedCurrency === c.code && (
                        <CheckCircle2 className="w-4 h-4 text-primary ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCurrencyUpdate}
                className="bg-primary hover:bg-red-700 rounded-sm"
                disabled={currencyLoading || selectedCurrency === currency?.code}
                data-testid="save-currency-btn"
              >
                <Save className="w-4 h-4 mr-2" />
                {currencyLoading ? 'Saving...' : 'Save Currency'}
              </Button>

            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Profile Tab ── */}
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
