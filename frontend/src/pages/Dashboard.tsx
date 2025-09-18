import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { TransactionSummary, MonthlyTrend, CategorySummary, Transaction } from '../types';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { formatSatoshis } from '../utils/bitcoin';
import { formatCurrency } from '../utils/currency';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategorySummary[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategorySummary[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, trendsRes, expenseCatRes, incomeCatRes, transactionsRes] = await Promise.all([
          api.get('/transactions/summary'),
          api.get('/transactions/monthly-trends'),
          api.get('/transactions/category-summary?type=expense'),
          api.get('/transactions/category-summary?type=income'),
          api.get('/transactions?limit=5'),
        ]);

        setSummary(summaryRes.data.summary);
        setMonthlyTrends(trendsRes.data.trends);
        setExpenseCategories(expenseCatRes.data.summary);
        setIncomeCategories(incomeCatRes.data.summary);
        setRecentTransactions(transactionsRes.data.transactions);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your financial activity</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">+</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Income
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(summary?.totalIncome || 0, user?.currency)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">-</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Expenses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(summary?.totalExpenses || 0, user?.currency)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${(summary?.balance || 0) >= 0 ? 'bg-blue-500' : 'bg-orange-500'} rounded-md flex items-center justify-center`}>
                    <span className="text-white text-sm font-medium">=</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Balance
                    </dt>
                    <dd className={`text-lg font-medium ${(summary?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(summary?.balance || 0, user?.currency)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Top Expense Categories */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Top Expense Categories
              </h3>
              <div className="mt-5">
                {expenseCategories.length > 0 ? (
                  <div className="space-y-3">
                    {expenseCategories.slice(0, 5).map((category) => (
                      <div key={category.categoryId} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: category.categoryColor }}
                          ></div>
                          <span className="text-sm text-gray-900">{category.categoryName}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(category.total, user?.currency)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {category.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No expense data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Income Categories */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Top Income Categories
              </h3>
              <div className="mt-5">
                {incomeCategories.length > 0 ? (
                  <div className="space-y-3">
                    {incomeCategories.slice(0, 5).map((category) => (
                      <div key={category.categoryId} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: category.categoryColor }}
                          ></div>
                          <span className="text-sm text-gray-900">{category.categoryName}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(category.total, user?.currency)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {category.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No income data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Transactions
            </h3>
            <div className="space-y-3">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: transaction.categoryColor || '#6B7280' }}
                      ></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.description || transaction.categoryName || 'Transaction'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, user?.currency)}
                      </div>
                      {transaction.satoshiAmount && (
                        <div className="text-xs text-orange-600">
                          {formatSatoshis(transaction.satoshiAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No transactions yet. Start by adding your first transaction!
                </p>
              )}
            </div>
            {recentTransactions.length > 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => window.location.href = '/transactions'}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all transactions →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <button
                onClick={() => window.location.href = '/transactions?action=add&type=income'}
                className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-3 sm:p-4 text-center transition-colors"
              >
                <div className="text-green-600 font-medium text-sm sm:text-base">Add Income</div>
                <div className="text-green-500 text-xs sm:text-sm hidden sm:block">Record new income</div>
              </button>
              <button
                onClick={() => window.location.href = '/transactions?action=add&type=expense'}
                className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-3 sm:p-4 text-center transition-colors"
              >
                <div className="text-red-600 font-medium text-sm sm:text-base">Add Expense</div>
                <div className="text-red-500 text-xs sm:text-sm hidden sm:block">Record new expense</div>
              </button>
              <button
                onClick={() => window.location.href = '/categories'}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 sm:p-4 text-center transition-colors"
              >
                <div className="text-blue-600 font-medium text-sm sm:text-base">Categories</div>
                <div className="text-blue-500 text-xs sm:text-sm hidden sm:block">Add or edit categories</div>
              </button>
              <button
                onClick={() => window.location.href = '/transactions'}
                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-3 sm:p-4 text-center transition-colors"
              >
                <div className="text-purple-600 font-medium text-sm sm:text-base">View All</div>
                <div className="text-purple-500 text-xs sm:text-sm hidden sm:block">See all transactions</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;