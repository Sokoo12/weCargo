// app/contact/page.tsx
"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Building, Globe, ArrowRight, Copy, Check, PhoneCall } from "lucide-react";
import ConstellationAnimation from "@/components/ConstellationAnimation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const locations = [
  {
    id: 1,
    title: "Эрээн дэх хаяг",
    phone: "15148615407",
    address: "内蒙古锡林郭勒盟二连浩特市环宇商贸城五号楼125号业顺额尔敦商贸有限公司",
    addressMn: "Өвөр Монгол, Шилийн гол аймаг, Эрээн хот",
    icon: Globe,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600"
  },
  {
    id: 2,
    title: "Улаанбаатар дахь хаяг",
    subtitle: "Төв салбар",
    phone: "90021937",
    address: "Сүхбаатар дүүрэг 12 хороо 32-ын тойрог Номин супермаркет",
    icon: Building,
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
    iconColor: "text-primary"
  }
];

export default function ContactPage() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Хаяг хуулагдлаа!");
    
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white pt-[120px] pb-[100px] relative">
      <ConstellationAnimation />
      
      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Бидэнтэй холбогдох
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Та бидэнтэй доорх хаягаар холбогдон дэлгэрэнгүй мэдээлэл авах боломжтой
            </p>
          </motion.div>

          {/* Office Locations */}
          <motion.div 
            className="mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {locations.map(location => (
                <motion.div key={location.id} variants={childVariants}>
                  <Card className={`border-2 ${location.borderColor} shadow-sm hover:shadow-md transition-all overflow-hidden`}>
                    <div className={`${location.bgColor} p-6 flex justify-between items-center`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${location.bgColor} border-2 ${location.borderColor}`}>
                          <location.icon className={`w-6 h-6 ${location.iconColor}`} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">{location.title}</h2>
                          {location.subtitle && (
                            <p className="text-gray-600">{location.subtitle}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <Phone className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">Утас</p>
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-800">{location.phone}</p>
                            <a 
                              href={`tel:${location.phone}`} 
                              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                              title="Залгах"
                            >
                              <PhoneCall className="w-4 h-4 text-green-600" />
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-gray-500">Хаяг</p>
                            <button 
                              onClick={() => copyToClipboard(location.address, location.id)}
                              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                              title="Хаяг хуулах"
                            >
                              {copiedId === location.id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                          <p className="font-medium text-gray-800">
                            {location.addressMn && <span>{location.addressMn}<br/></span>}
                            {location.address}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Info Cards */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 shadow-lg">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={childVariants} className="flex flex-col items-center text-center p-6 rounded-xl bg-blue-50 border border-blue-100">
                <Mail className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Имэйл хаяг</h3>
                <p className="text-gray-600">wecargo@gmail.com</p>
              </motion.div>
              
              <motion.div variants={childVariants} className="flex flex-col items-center text-center p-6 rounded-xl bg-primary/5 border border-primary/10">
                <MapPin className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Байршил</h3>
                <p className="text-gray-600">Улаанбаатар, Монгол</p>
                <p className="text-gray-600">Эрээн, Хятад</p>
              </motion.div>
              
              <motion.div variants={childVariants} className="flex flex-col items-center text-center p-6 rounded-xl bg-amber-50 border border-amber-100">
                <Clock className="w-12 h-12 text-amber-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ажлын цаг</h3>
                <p className="text-gray-600">Даваа - Бямба</p>
                <p className="text-gray-600">09:00 - 20:00</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Call to action */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-primary/20 to-blue-500/20 p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Бидэнтэй холбогдоход бэлэн үү?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                Та имэйл бичих эсвэл салбарт биечлэн ирж үйлчлүүлэх боломжтой
              </p>
              <a href="mailto:wecargo@gmail.com" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-full transition-colors">
                Имэйл бичих <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
