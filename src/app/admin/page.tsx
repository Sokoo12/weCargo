"use client";
import React, { useEffect, useState } from "react";
import Header from "./components/common/Header";
import { motion } from "framer-motion";
import StatCard from "./components/common/StatCard";
import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import SalesChannelChart from "./components/overview/SalesChannelChart";
import SalesOverviewChart from "./components/overview/SalesOverviewChart";
import DeliveryStatusChart from "./components/overview/DeliveryStatusChart";

function Admin() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    deliveredOrders: 0,
    totalOrders: 0,
    canceledOrders: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/orders/metrics");
        const result:MetricsResponse = await response.json();
        setStats({
          totalRevenue: result.totalRevenue || 0,
          deliveredOrders: result.deliveredOrders || 0,
          totalOrders: result.totalOrders || 0,
          canceledOrders: result.canceledOrders || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Хураангуй" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Нийт дүн"
            icon={Zap}
            value={`${stats.totalRevenue.toLocaleString()}₮`}
            color="#6366F1"
          />
          <StatCard
            name="Хүргэгдсан Захиалга"
            icon={Users}
            value={stats.deliveredOrders.toLocaleString()}
            color="#8B5CF6"
          />
          <StatCard
            name="Нийт захиалга"
            icon={ShoppingBag}
            value={stats.totalOrders.toLocaleString()}
            color="#EC4899"
          />
          <StatCard
            name="Цуцлагдсан захиалга"
            icon={BarChart2}
            value={`${((stats.canceledOrders / stats.totalOrders) * 100 || 0).toFixed(2)}%`}
            color="#10B981"
          />
        </motion.div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SalesOverviewChart />
          <DeliveryStatusChart />
          <SalesChannelChart />
        </div>
      </main>
    </div>
  );
}

export default Admin;