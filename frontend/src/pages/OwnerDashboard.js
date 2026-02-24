import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsAPI } from '@/services/api';
import { BarChart3, TrendingUp, CreditCard, Briefcase, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const OwnerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await analyticsAPI.exportData();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'jobs_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return <div className="text-center py-12" data-testid="loading">Loading analytics...</div>;
  }

  const dailyRevenueData = Object.entries(analytics?.daily_revenue || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      revenue
    }));

  return (
    <div data-testid="owner-dashboard">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Your workshop performance at a glance</p>
        </div>
        <Button 
          onClick={handleExport}
          className="bg-primary hover:bg-red-700 rounded-sm"
          data-testid="export-data-btn"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`₹${analytics?.total_revenue?.toLocaleString('en-IN') || 0}`}
          icon={<TrendingUp className="w-6 h-6" />}
          tracing
        />
        <StatCard
          title="Collected"
          value={`₹${analytics?.total_collected?.toLocaleString('en-IN') || 0}`}
          icon={<CreditCard className="w-6 h-6" />}
        />
        <StatCard
          title="Outstanding Credits"
          value={`₹${analytics?.total_credits?.toLocaleString('en-IN') || 0}`}
          icon={<CreditCard className="w-6 h-6" />}
          highlight
        />
        <StatCard
          title="Total Jobs"
          value={analytics?.total_jobs || 0}
          icon={<Briefcase className="w-6 h-6" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border" data-testid="revenue-chart-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight uppercase">Revenue Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyRevenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#a1a1aa" style={{ fontSize: '12px' }} />
                <YAxis stroke="#a1a1aa" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  labelStyle={{ color: '#fafafa' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border" data-testid="status-chart-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight uppercase">Jobs by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics?.status_counts || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                    <span className="text-sm font-medium capitalize">{status.replace('_', ' ')}</span>
                  </div>
                  <span className="text-lg font-bold font-mono">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, tracing, highlight }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-border ${tracing ? 'tracing-beam' : ''} ${highlight ? 'border-yellow-600' : ''}`} data-testid="stat-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{title}</p>
            <div className="text-primary">{icon}</div>
          </div>
          <p className="text-3xl font-black font-mono tracking-tight">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    'pending': 'bg-yellow-500',
    'in_progress': 'bg-blue-500',
    'completed': 'bg-green-500',
    'delivered': 'bg-green-600',
    'credit_pending': 'bg-yellow-600',
    'waiting_for_parts': 'bg-orange-500',
    'closed': 'bg-gray-500'
  };
  return colors[status] || 'bg-gray-500';
};

export default OwnerDashboard;
