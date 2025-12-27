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
  fullSubjects?: string[];
  scores: number[];
}

export default function ProgressChart({
  subjects,
  fullSubjects,
  scores,
}: Props) {
  const data = {
    labels: subjects,
    datasets: [
      {
        label: "Scores",
        data: scores,
        backgroundColor: "rgba(66, 72, 116, 0.8)", // #424874
      },
    ],
  };
  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                return fullSubjects && fullSubjects[index]
                  ? fullSubjects[index]
                  : subjects[index];
              },
            },
          },
        },
      }}
    />
  );
}
