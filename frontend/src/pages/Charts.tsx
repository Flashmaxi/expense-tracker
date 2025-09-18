import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import PieChart from "../components/charts/PieChart";
import LineChart from "../components/charts/LineChart";
import { CategorySummary, MonthlyTrend, Transaction } from "../types";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import { formatSatoshis } from "../utils/bitcoin";
import { formatCurrency } from "../utils/currency";

const Charts: React.FC = () => {
  const { user } = useAuth();
  const [expenseCategories, setExpenseCategories] = useState<CategorySummary[]>(
    []
  );
  const [incomeCategories, setIncomeCategories] = useState<CategorySummary[]>(
    []
  );
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchChartsData();
  }, [dateRange]);

  const fetchChartsData = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      const [expenseCatRes, incomeCatRes, trendsRes, transactionsRes] = await Promise.all([
        api.get(
          `/transactions/category-summary?type=expense&${params.toString()}`
        ),
        api.get(
          `/transactions/category-summary?type=income&${params.toString()}`
        ),
        api.get("/transactions/monthly-trends"),
        api.get(`/transactions?${params.toString()}`),
      ]);

      setExpenseCategories(expenseCatRes.data.summary);
      setIncomeCategories(incomeCatRes.data.summary);
      setMonthlyTrends(trendsRes.data.trends);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error("Failed to fetch charts data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearDateRange = () => {
    setDateRange({
      startDate: "",
      endDate: "",
    });
  };

  // Calculate satoshi totals
  const getSatoshiTotals = () => {
    const incomeTransactions = transactions.filter(t => t.type === 'income' && t.satoshiAmount);
    const expenseTransactions = transactions.filter(t => t.type === 'expense' && t.satoshiAmount);

    const totalIncomeSats = incomeTransactions.reduce((sum, t) => sum + (t.satoshiAmount || 0), 0);
    const totalExpenseSats = expenseTransactions.reduce((sum, t) => sum + (t.satoshiAmount || 0), 0);

    return { totalIncomeSats, totalExpenseSats };
  };

  const { totalIncomeSats, totalExpenseSats } = getSatoshiTotals();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Charts & Analytics
          </h1>
          <p className="text-gray-600">Visualize your financial data</p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Filter by Date Range
          </h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={dateRange.startDate}
                onChange={(e) =>
                  handleDateRangeChange("startDate", e.target.value)
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={dateRange.endDate}
                onChange={(e) =>
                  handleDateRangeChange("endDate", e.target.value)
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearDateRange}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Trends Chart */}
        <div className="col-span-full">
          <LineChart
            data={monthlyTrends}
            title="Monthly Income vs Expenses Trend"
          />
        </div>

        {/* Category Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Categories */}
          <div>
            {expenseCategories.length > 0 ? (
              <PieChart data={expenseCategories} title="Expenses by Category" />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Expenses by Category
                </h3>
                <p className="text-gray-500 text-center py-8">
                  No expense data available for the selected period
                </p>
              </div>
            )}
          </div>

          {/* Income Categories */}
          <div>
            {incomeCategories.length > 0 ? (
              <PieChart data={incomeCategories} title="Income by Category" />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Income by Category
                </h3>
                <p className="text-gray-500 text-center py-8">
                  No income data available for the selected period
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Summary Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {incomeCategories.length}
              </div>
              <div className="text-sm text-gray-500">Income Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {expenseCategories.length}
              </div>
              <div className="text-sm text-gray-500">Expense Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  incomeCategories.reduce((sum, cat) => sum + cat.total, 0),
                  user?.currency
                )}
              </div>
              <div className="text-sm text-gray-500">Total Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  expenseCategories.reduce((sum, cat) => sum + cat.total, 0),
                  user?.currency
                )}
              </div>
              <div className="text-sm text-gray-500">Total Expenses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {totalIncomeSats > 0 ? formatSatoshis(totalIncomeSats) : '0 sats'}
              </div>
              <div className="text-sm text-gray-500">Total Income (Sats)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {totalExpenseSats > 0 ? formatSatoshis(totalExpenseSats) : '0 sats'}
              </div>
              <div className="text-sm text-gray-500">Total Expenses (Sats)</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Charts;
