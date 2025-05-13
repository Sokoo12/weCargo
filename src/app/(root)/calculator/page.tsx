"use client"
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ConstellationAnimation from "@/components/ConstellationAnimation";
import { LayoutGrid, TruckIcon, PackageIcon, InfoIcon, AlertCircle, CheckCircle } from "lucide-react";

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState("warehouse");

  return (
    <div className="min-h-screen bg-white py-12 pt-[120px] pb-[100px] relative">
      <ConstellationAnimation />
      
      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              WE CARGO & LOGISTIC
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Бид танд хамгийн хурдан, хамгийн хямд карго үйлчилгээг санал болгож байна
            </p>
          </div>

          <Tabs defaultValue="warehouse" className="mb-8" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-8 w-full max-w-md mx-auto">
              <TabsTrigger value="warehouse" className="text-sm md:text-base">
                Агуулахаас авах үнэ
              </TabsTrigger>
              <TabsTrigger value="branch" className="text-sm md:text-base">
                Салбараас авах үнэ
              </TabsTrigger>
            </TabsList>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Small packages */}
              <Card className="overflow-hidden border-primary/10 transition-all hover:shadow-md">
                <div className="bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-800">Жижиг ачаа</h3>
                  </div>
                </div>
                <CardContent className="p-5">
                  <TabsContent value="warehouse" className="mt-0">
                    <p className="text-2xl font-bold text-primary">1.500-10.000₮</p>
                  </TabsContent>
                  <TabsContent value="branch" className="mt-0">
                    <p className="text-2xl font-bold text-primary">2.500-15.000₮</p>
                  </TabsContent>
                </CardContent>
              </Card>

              {/* Large lightweight packages over 10m3 */}
              <Card className="overflow-hidden border-primary/10 transition-all hover:shadow-md">
                <div className="bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-800">10 м3-с дээш овортой хөнгөн ачаа</h3>
                  </div>
                </div>
                <CardContent className="p-5">
                  <TabsContent value="warehouse" className="mt-0">
                    <p className="text-2xl font-bold text-primary">350¥</p>
                  </TabsContent>
                  <TabsContent value="branch" className="mt-0">
                    <p className="text-2xl font-bold text-primary">400¥</p>
                  </TabsContent>
                </CardContent>
              </Card>

              {/* Large heavy packages over 10m3 */}
              <Card className="overflow-hidden border-primary/10 transition-all hover:shadow-md">
                <div className="bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-800">10 м3-с дээш овортой хүнд ачаа</h3>
                  </div>
                </div>
                <CardContent className="p-5">
                  <TabsContent value="warehouse" className="mt-0">
                    <p className="text-2xl font-bold text-primary">400¥</p>
                  </TabsContent>
                  <TabsContent value="branch" className="mt-0">
                    <p className="text-2xl font-bold text-primary">450¥</p>
                  </TabsContent>
                </CardContent>
              </Card>

              {/* 1m3 lightweight packages */}
              <Card className="overflow-hidden border-primary/10 transition-all hover:shadow-md">
                <div className="bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-800">1 м3 овортой хөнгөн ачаа</h3>
                  </div>
                </div>
                <CardContent className="p-5">
                  <TabsContent value="warehouse" className="mt-0">
                    <p className="text-2xl font-bold text-primary">400¥</p>
                  </TabsContent>
                  <TabsContent value="branch" className="mt-0">
                    <p className="text-2xl font-bold text-primary">500¥</p>
                  </TabsContent>
                </CardContent>
              </Card>

              {/* 1m3 heavy packages */}
              <Card className="overflow-hidden border-primary/10 transition-all hover:shadow-md">
                <div className="bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-800">1 м3 овортой хүнд ачаа</h3>
                  </div>
                </div>
                <CardContent className="p-5">
                  <TabsContent value="warehouse" className="mt-0">
                    <p className="text-2xl font-bold text-primary">450¥</p>
                  </TabsContent>
                  <TabsContent value="branch" className="mt-0">
                    <p className="text-2xl font-bold text-primary">550¥</p>
                  </TabsContent>
                </CardContent>
              </Card>

              {/* Packages under 1m3 */}
              <Card className="overflow-hidden border-primary/10 transition-all hover:shadow-md">
                <div className="bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-800">1 м3-с бага ачаа</h3>
                  </div>
                </div>
                <CardContent className="p-5">
                  <TabsContent value="warehouse" className="mt-0">
                    <p className="text-2xl font-bold text-primary">500¥</p>
                  </TabsContent>
                  <TabsContent value="branch" className="mt-0">
                    <p className="text-2xl font-bold text-primary">600¥</p>
                  </TabsContent>
                </CardContent>
              </Card>

              {/* Bundled small items */}
              <Card className="overflow-hidden border-primary/10 transition-all hover:shadow-md">
                <div className="bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-800">Олон жижиг барааг шуудайлж багцлах м3</h3>
                  </div>
                </div>
                <CardContent className="p-5">
                  <TabsContent value="warehouse" className="mt-0">
                    <p className="text-2xl font-bold text-primary">600¥</p>
                  </TabsContent>
                  <TabsContent value="branch" className="mt-0">
                    <p className="text-2xl font-bold text-primary">650¥</p>
                  </TabsContent>
                </CardContent>
              </Card>

              {/* Express shipping */}
              <Card className="overflow-hidden border-primary/10 transition-all hover:shadow-md">
                <div className="bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-800">Шуурхай ачаа м3</h3>
                  </div>
                </div>
                <CardContent className="p-5">
                  <TabsContent value="warehouse" className="mt-0">
                    <p className="text-2xl font-bold text-primary">1000¥</p>
                  </TabsContent>
                  <TabsContent value="branch" className="mt-0">
                    <p className="text-2xl font-bold text-primary">1100¥</p>
                  </TabsContent>
                </CardContent>
              </Card>

              {/* Heavy items with low volume */}
              <Card className="overflow-hidden border-primary/10 transition-all hover:shadow-md col-span-1 md:col-span-2 lg:col-span-3">
                <div className="bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-800">Овор багатай хүнд ачааг жин тонноор бодно</h3>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="text-2xl font-bold text-primary">1000-1400¥</p>
                  <p className="text-gray-600 mt-2">*Үнэ ачааны төрөл, жингээс хамааран өөрчлөгдөж болно</p>
                </CardContent>
              </Card>
            </div>
          </Tabs>
          
          {/* Advantages */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Бидний давуу талууд</h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-primary/10">
                <CardContent className="p-5 pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Бид танд Хамгийн ойр, Хамгийн хурдан, Хамгийн хямд карго юм.</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/10">
                <CardContent className="p-5 pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Та өөрийн барааны хэмжээг явуулан үнэлгээг нь гаргуулж болох ба их хэмжээний бараа авчруулах тохиолдолд үнийг хэлэлцэн тохирч болно.</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/10">
                <CardContent className="p-5 pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Мөн бид Улаанбаатар хот доторх хамгийн хямд хүргэлттэй учир та өөрийн цаг хугацаа, зардлыг хэмнэх давуу талтай.</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/10 md:col-span-2">
                <CardContent className="p-5 pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Бид таны ачаа барааг хүлээн авсан үеэс хүлээлгэж өгөх хүртэлх аюулгүй байдал, эвдрэл, гэмтлийг бүрэн хариуцах бөгөөд бидний хайхрамжгүй, буруутай үйл ажиллагааны улмаас танд учирсан хохирлыг даатгал гэж цаг алдахгүйгээр бүрэн төлж барагдуулна.</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/10">
                <CardContent className="p-5 pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">Линк захиалга, QR төлбөр төлөлт, алипэй цэнэглэлт үнэ төлбөргүй хийж өгнө.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 