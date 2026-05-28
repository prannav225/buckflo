import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

// Global Chart defaults
ChartJS.defaults.font.family = '"Inter", system-ui, sans-serif';
ChartJS.defaults.color = "rgba(150, 150, 150, 0.8)";
ChartJS.defaults.scale.grid.color = "rgba(150, 150, 150, 0.1)";

function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1.0e6) {
    return (value / 1.0e6).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (abs >= 1.0e3) {
    return (value / 1.0e3).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return value.toString();
}

export const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  devicePixelRatio: typeof window !== 'undefined' ? Math.max(window.devicePixelRatio, 2.5) : 2.5,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(30, 29, 27, 0.95)",
      titleColor: "rgba(255, 255, 255, 0.9)",
      bodyColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "rgba(255, 255, 255, 0.08)",
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: function (context: any) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          let val = context.parsed;
          if (typeof val === "object" && val !== null && "y" in val) {
            val = val.y;
          }
          if (val !== null && val !== undefined) {
            label += new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(val);
          }
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { font: { size: 10 } },
    },
    y: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        font: { size: 10 },
        callback: function (value: string | number) {
          const numVal = Number(value);
          if (isNaN(numVal)) return value;
          return "₹" + formatCompact(numVal);
        },
      },
    },
  },
};
