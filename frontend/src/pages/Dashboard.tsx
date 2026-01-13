import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  adAccountsApi,
  metricsApi,
  benchmarksApi,
  oauthApi,
} from '../services/api';
import { useAuthStore } from '../store/authStore';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Link as LinkIcon } from 'lucide-react';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    const oauth = searchParams.get('oauth');
    if (oauth === 'success') {
      alert('Ad account connected successfully!');
      window.history.replaceState({}, '', '/dashboard');
    } else if (oauth === 'error') {
      alert('Failed to connect ad account. Please try again.');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const { data: adAccounts, refetch: refetchAccounts } = useQuery({
    queryKey: ['adAccounts'],
    queryFn: async () => {
      const response = await adAccountsApi.getAll();
      return response.data.data;
    },
  });

  const { data: metricsData } = useQuery({
    queryKey: ['metrics', dateRange],
    queryFn: async () => {
      const response = await metricsApi.getUserMetrics(dateRange);
      return response.data.data;
    },
    enabled: (adAccounts?.length || 0) > 0,
  });

  const { data: benchmarkData } = useQuery({
    queryKey: ['benchmark', dateRange],
    queryFn: async () => {
      const response = await benchmarksApi.compareToBenchmark(dateRange);
      return response.data.data;
    },
    enabled: (adAccounts?.length || 0) > 0,
  });

  const handleConnectGoogle = async () => {
    try {
      const response = await oauthApi.initiateGoogle();
      window.location.href = response.data.data.authUrl;
    } catch (error) {
      console.error('Failed to initiate Google OAuth:', error);
    }
  };

  const handleConnectFacebook = async () => {
    try {
      const response = await oauthApi.initiateFacebook();
      window.location.href = response.data.data.authUrl;
    } catch (error) {
      console.error('Failed to initiate Facebook OAuth:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getComparisonColor = (value: number, inverse = false) => {
    if (inverse) {
      return value <= 0 ? 'text-green-600' : 'text-red-600';
    }
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getComparisonIcon = (value: number, inverse = false) => {
    const isPositive = inverse ? value <= 0 : value >= 0;
    return isPositive ? (
      <TrendingUp className="w-5 h-5" />
    ) : (
      <TrendingDown className="w-5 h-5" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary-600">Adium</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {user?.firstName || user?.email}
            </p>
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Date Range Selector */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Date Range</h2>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Connected Ad Accounts</h2>
          {!adAccounts || adAccounts.length === 0 ? (
            <div>
              <p className="text-gray-600 mb-4">
                Connect your ad accounts to start benchmarking
              </p>
              <div className="flex gap-4">
                <button onClick={handleConnectGoogle} className="btn-primary">
                  <LinkIcon className="w-4 h-4 inline mr-2" />
                  Connect Google Ads
                </button>
                <button onClick={handleConnectFacebook} className="btn-primary">
                  <LinkIcon className="w-4 h-4 inline mr-2" />
                  Connect Facebook Ads
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-2 mb-4">
                {adAccounts.map((account: any) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {account.accountName || account.accountId}
                      </p>
                      <p className="text-sm text-gray-600">{account.platform}</p>
                    </div>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={handleConnectGoogle} className="btn-outline">
                  <LinkIcon className="w-4 h-4 inline mr-2" />
                  Add Google Ads
                </button>
                <button onClick={handleConnectFacebook} className="btn-outline">
                  <LinkIcon className="w-4 h-4 inline mr-2" />
                  Add Facebook Ads
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Metrics Summary */}
        {metricsData?.summary && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card border-primary-500">
                <p className="text-gray-600 text-sm">Total Impressions</p>
                <p className="text-2xl font-bold">
                  {metricsData.summary.totalImpressions.toLocaleString()}
                </p>
              </div>
              <div className="stat-card border-green-500">
                <p className="text-gray-600 text-sm">Total Clicks</p>
                <p className="text-2xl font-bold">
                  {metricsData.summary.totalClicks.toLocaleString()}
                </p>
              </div>
              <div className="stat-card border-orange-500">
                <p className="text-gray-600 text-sm">Total Spend</p>
                <p className="text-2xl font-bold">
                  ${metricsData.summary.totalSpend.toFixed(2)}
                </p>
              </div>
              <div className="stat-card border-purple-500">
                <p className="text-gray-600 text-sm">Total Conversions</p>
                <p className="text-2xl font-bold">
                  {metricsData.summary.totalConversions}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Benchmark Comparison */}
        {benchmarkData && benchmarkData.userStats && benchmarkData.benchmarks && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2" />
              Benchmark Comparison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* CTR */}
              <div className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-gray-600 text-sm">Click-Through Rate</p>
                    <p className="text-2xl font-bold">
                      {benchmarkData.userStats.ctr.toFixed(2)}%
                    </p>
                  </div>
                  <div
                    className={`flex items-center ${getComparisonColor(
                      benchmarkData.comparison.ctrDiff
                    )}`}
                  >
                    {getComparisonIcon(benchmarkData.comparison.ctrDiff)}
                    <span className="ml-1 font-semibold">
                      {formatPercentage(benchmarkData.comparison.ctrDiff)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Platform avg: {benchmarkData.benchmarks.avgCtr.toFixed(2)}%
                </p>
              </div>

              {/* CPC */}
              <div className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-gray-600 text-sm">Cost Per Click</p>
                    <p className="text-2xl font-bold">
                      ${benchmarkData.userStats.cpc.toFixed(2)}
                    </p>
                  </div>
                  <div
                    className={`flex items-center ${getComparisonColor(
                      benchmarkData.comparison.cpcDiff,
                      true
                    )}`}
                  >
                    {getComparisonIcon(
                      benchmarkData.comparison.cpcDiff,
                      true
                    )}
                    <span className="ml-1 font-semibold">
                      {formatPercentage(benchmarkData.comparison.cpcDiff)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Platform avg: ${benchmarkData.benchmarks.avgCpc.toFixed(2)}
                </p>
              </div>

              {/* Conversion Rate */}
              <div className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-gray-600 text-sm">Conversion Rate</p>
                    <p className="text-2xl font-bold">
                      {benchmarkData.userStats.conversionRate.toFixed(2)}%
                    </p>
                  </div>
                  <div
                    className={`flex items-center ${getComparisonColor(
                      benchmarkData.comparison.conversionRateDiff
                    )}`}
                  >
                    {getComparisonIcon(
                      benchmarkData.comparison.conversionRateDiff
                    )}
                    <span className="ml-1 font-semibold">
                      {formatPercentage(
                        benchmarkData.comparison.conversionRateDiff
                      )}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Platform avg:{' '}
                  {benchmarkData.benchmarks.avgConversionRate.toFixed(2)}%
                </p>
              </div>

              {/* CPM */}
              <div className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-gray-600 text-sm">
                      Cost Per 1000 Impressions
                    </p>
                    <p className="text-2xl font-bold">
                      ${benchmarkData.userStats.cpm.toFixed(2)}
                    </p>
                  </div>
                  <div
                    className={`flex items-center ${getComparisonColor(
                      benchmarkData.comparison.cpmDiff,
                      true
                    )}`}
                  >
                    {getComparisonIcon(
                      benchmarkData.comparison.cpmDiff,
                      true
                    )}
                    <span className="ml-1 font-semibold">
                      {formatPercentage(benchmarkData.comparison.cpmDiff)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Platform avg: ${benchmarkData.benchmarks.avgCpm.toFixed(2)}
                </p>
              </div>

              {/* CPA */}
              <div className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-gray-600 text-sm">Cost Per Acquisition</p>
                    <p className="text-2xl font-bold">
                      ${benchmarkData.userStats.cpa.toFixed(2)}
                    </p>
                  </div>
                  <div
                    className={`flex items-center ${getComparisonColor(
                      benchmarkData.comparison.cpaDiff,
                      true
                    )}`}
                  >
                    {getComparisonIcon(
                      benchmarkData.comparison.cpaDiff,
                      true
                    )}
                    <span className="ml-1 font-semibold">
                      {formatPercentage(benchmarkData.comparison.cpaDiff)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Platform avg: ${benchmarkData.benchmarks.avgCpa.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {!adAccounts || adAccounts.length === 0 ? (
          <div className="card text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Get Started with Adium
            </h3>
            <p className="text-gray-600 mb-6">
              Connect your ad accounts to see how your performance compares to
              other advertisers
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
