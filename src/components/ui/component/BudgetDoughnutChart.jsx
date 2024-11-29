import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register Chart.js modules
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const BudgetDoughnutChart = ({ expenses }) => {
  // Prepare data for the Doughnut Chart
  const mergedExpenses = expenses.reduce((acc, expense) => {
    const existingCategory = acc.find((item) => item.category === expense.category);
    if (existingCategory) {
      existingCategory.amount += expense.amount; // Add the amounts
    } else {
      acc.push({ category: expense.category, amount: expense.amount });
    }
    return acc;
  }, []);

  // Step 2: Prepare data for the Doughnut Chart
  const data = {
    labels: mergedExpenses.map((expense) => expense.category),
    datasets: [
      {
        label: "Expenses",
        data: mergedExpenses.map((expense) => expense.amount),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ], // Add more colors if needed
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "",
      },
      legend: {
        position: "left",
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};

export default BudgetDoughnutChart;
