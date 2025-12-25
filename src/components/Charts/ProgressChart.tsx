"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  subjects: string[];
  scores: number[];
}

export default function ProgressChart({ subjects, scores }: Props) {
  const data = {
    labels: subjects,
    datasets: [
      {
        label: "Scores",
        data: scores,
        backgroundColor: "rgba(15, 23, 42, 0.8)",
      },
    ],
  };
  return (
    <Bar
      data={data}
      options={{ responsive: true, plugins: { legend: { display: false } } }}
    />
  );
}
