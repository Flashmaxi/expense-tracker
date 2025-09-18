import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { CategorySummary } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/currency';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: CategorySummary[];
  title: string;
}

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  const { user } = useAuth();
  const chartData = {
    labels: data.map(item => item.categoryName),
    datasets: [
      {
        data: data.map(item => item.total),
        backgroundColor: data.map(item => item.categoryColor),
        borderColor: data.map(item => item.categoryColor),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const percentage = data[context.dataIndex]?.percentage || 0;
            return `${context.label}: ${formatCurrency(value, user?.currency)} (${percentage.toFixed(1)}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;