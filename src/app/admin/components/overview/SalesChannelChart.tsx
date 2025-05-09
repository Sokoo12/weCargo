"use client";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { OrderStatus } from "@/types/enums";
import { translateStatus } from "@/utils/translateStatus";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#42f50b"];

type DeliveryStatusData = {
  name: string;
  value: number;
};

type MetricsResponse = {
  deliveryStatus: DeliveryStatusData[];
};

const SalesChannelChart = () => {
  const [salesChannelData, setSalesChannelData] = useState<DeliveryStatusData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/orders/metrics");
        const result: MetricsResponse = await response.json();

        if (Array.isArray(result.deliveryStatus)) {
          setSalesChannelData(result.deliveryStatus);
        } else {
          console.warn("deliveryStatus is missing or not an array", result);
          setSalesChannelData([]);
        }
      } catch (error) {
        console.error("Error fetching sales channel data:", error);
        setSalesChannelData([]);
      }
    };

    fetchData();
  }, []);

  const translatedData: DeliveryStatusData[] = Array.isArray(salesChannelData)
    ? salesChannelData.map((data) => ({
        name: translateStatus(data.name as OrderStatus),
        value: data.value,
      }))
    : [];

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 lg:col-span-2 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className='text-lg font-medium mb-4 text-gray-100'>Ачаа бараа</h2>

      <div className='h-80'>
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <BarChart data={translatedData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#4B5563' />
            <XAxis dataKey='name' stroke='#9CA3AF' />
            <YAxis stroke='#9CA3AF' />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Legend />
            <Bar dataKey={"value"} fill='#8884d8'>
              {translatedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SalesChannelChart;
