"use client";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { translateStatus } from "@/utils/translateStatus";
import { OrderStatus } from "@/types/enums";

// Sample type — update based on your actual API response
type DeliveryStatusData = {
  name: string;
  value: number;
};

type MetricsResponse = {
  deliveryStatus: DeliveryStatusData[];
};

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

const DeliveryStatusChart = () => {
  const [categoryData, setCategoryData] = useState<DeliveryStatusData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/orders/metrics");
        const result: MetricsResponse = await response.json();

        if (Array.isArray(result.deliveryStatus)) {
          setCategoryData(result.deliveryStatus);
        } else {
          console.warn("Unexpected deliveryStatus format:", result.deliveryStatus);
          setCategoryData([]);
        }
      } catch (error) {
        console.error("Error fetching delivery status data:", error);
        setCategoryData([]);
      }
    };

    fetchData();
  }, []);

  const translatedData: DeliveryStatusData[] = Array.isArray(categoryData)
    ? categoryData.map((data) => ({
        name: translateStatus(data.name as OrderStatus),
        value: data.value,
      }))
    : [];

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-lg font-medium mb-4 text-gray-100">Хүргэлтийн төлөв</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={translatedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {translatedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default DeliveryStatusChart;
