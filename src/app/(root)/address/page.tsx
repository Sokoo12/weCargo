'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, Phone, MapPin, Home, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ConstellationAnimation from '@/components/ConstellationAnimation';

const warehouses = [
  {
    id: 1,
    name: 'ШИЖЯЖУАН ХОТЫН АГУУЛАХ',
    description: 'This warehouse specializes in storing electronics and gadgets.',
    recipient: 'Баярмаа Ганболд',
    yourPhoneNumber: '+976 99112233',
    phone: '+976 12345678',
    region: 'Улаанбаатар',
    address: 'Сүхбаатар дүүрэг, 1-р хороо, 12-р байр',
    zipCode: '16041',
  },
  {
    id: 2,
    name: 'ГУАНЖКУ АГУУЛАХ',
    description: 'A large warehouse for agricultural products and equipment.',
    recipient: 'Номин Ганбат',
    yourPhoneNumber: '+976 99223344',
    phone: '+976 23456789',
    region: 'Дархан',
    address: 'Дархан дүүрэг, 2-р хороо, 34-р байр',
    zipCode: '18000',
  },
];

export default function WarehousesPage() {
  const handleCopy = (text:string) => {
    navigator.clipboard.writeText(text);
    toast.success('Хуулагдлаа!');
  };

  const handleCopyAll = (warehouse:any) => {
    const allFields = `Хүлээн авагч: ${warehouse.recipient}\nУтас: ${warehouse.phone}\nБүс нутаг: ${warehouse.region}\nХаяг: ${warehouse.address}\nЗип код: ${warehouse.zipCode}`;
    navigator.clipboard.writeText(allFields);
    toast.success('Бүх мэдээлэл хуулагдлаа!');
  };

  return (
    <div className="min-h-screen bg-white py-12 pb-[100px] sm:pb-0 pt-[100px]">
        <ConstellationAnimation/>
      <div className="container mx-auto sm:px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">Хаяг холбох</h1>
        {warehouses.map((warehouse, index) => (
          <motion.div
            key={warehouse.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className="p-4 sm:p-6 shadow-lg rounded-none sm:rounded-lg bg-white/90 backdrop-blur-sm mb-6 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800">{warehouse.name}</h2>
              <p className="text-gray-600 mt-2 mb-4">{warehouse.description}</p>

              <div className="space-y-2">
                {[
                  { label: 'Хүлээн авагч', value: warehouse.recipient, icon: <FileText className="w-5 h-5" /> },
                  { label: 'Өөрийн утасны дугаар', value: warehouse.yourPhoneNumber, icon: <Phone className="w-5 h-5" /> },
                  { label: 'Утас', value: warehouse.phone, icon: <Phone className="w-5 h-5" /> },
                  { label: 'Бүс нутаг', value: warehouse.region, icon: <MapPin className="w-5 h-5" /> },
                  { label: 'Хаяг', value: warehouse.address, icon: <Home className="w-5 h-5" /> },
                  { label: 'Зип код', value: warehouse.zipCode, icon: <FileText className="w-5 h-5" /> },
                ].map((field, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center gap-3  transition-colors"
                  >
                    <span className="text-gray-700 flex items-center gap-2 bg-gray-100 h-[50px] px-4 w-full rounded-full">{field.icon} {field.label}: {field.value}</span>
                    <Button size="sm" variant="ghost" className='rounded-full bg-gray-100 h-[50px] w-[50px]' onClick={() => handleCopy(field.value)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button onClick={() => handleCopyAll(warehouse)} className="rounded-full text-white font-semibold py-2 px-4 h-[50px] transition-all">
                  Бүх мэдээллийг хуулах <Copy/>
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}