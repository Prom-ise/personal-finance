import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js";

const BudgetDoughnutChart = ({ expenses }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const categories = expenses.map((expense) => expense.category);
    const amounts = expenses.map((expense) => expense.amount);

    const chart = new Chart(chartRef.current, {
      type: "doughnut",
      data: {
        labels: categories,
        datasets: [
          {
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ], // Customize colors
            data: amounts,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Budget Expenses Overview",
          },
        },
        responsive: true,
      },
    });

    return () => {
      chart.destroy(); // Cleanup chart on unmount
    };
  }, [expenses]);

  return <canvas ref={chartRef}></canvas>;
};

export default BudgetDoughnutChart;
