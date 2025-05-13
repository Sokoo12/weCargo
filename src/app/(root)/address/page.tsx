"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Phone,
  ExternalLink,
  Search,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Navigation
} from "lucide-react";
import ConstellationAnimation from "@/components/ConstellationAnimation";
import Image from "next/image";

// Define types for our locations
type Location = {
  id: number;
  name: string;
  address: string;
  embedUrl: string;
  phone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
};

const branches: Location[] = [
  {
    id: 1,
    name: 'Салбар 1',
    address: 'СБД, 12-р хороо, 32-ын тойрог, Номин супермаркетийн зүүн талд',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d672.709546920676!2d106.91664212922576!3d47.94115901512224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d969346cf6f861b%3A0x6d17ab69cd466cf9!2sPPM!5e1!3m2!1sen!2smn!4v1747120983700!5m2!1sen!2smn',
    coordinates: { lat: 47.9184, lng: 106.9175 },
    phone: '+97677889900'
  },
  {
    id: 2,
    name: 'Салбар 2',
    address: 'ХУД 23-р хороо Арцат luxury хотхон 1441 байр',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d873.2291880327078!2d106.83773243802511!3d47.86643945765868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d9695005f0d98e3%3A0x93883f8ce1a8d47d!2sArtsat%20luxury%20residence%201441!5e1!3m2!1sen!2smn!4v1747121133445!5m2!1sen!2smn',
    coordinates: { lat: 47.8524, lng: 106.8050 },
    phone: '+97677889901'
  },
  {
    id: 3,
    name: 'Салбар 3',
    address: 'БГД, 10 хороолол, 6-р хороо, 12Б байр',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d221.53830935101234!2d106.8684849259299!3d47.91455232286412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d9692e05af7003b%3A0x3bfb755ed5c2304d!2s12B%20apartment!5e1!3m2!1sen!2smn!4v1747121184680!5m2!1sen!2smn',
    coordinates: { lat: 47.9010, lng: 106.8732 },
    phone: '+97677889902'
  }
];

export default function AddressPage() {
  const [activeTab, setActiveTab] = useState("1");
  const [expandedBranch, setExpandedBranch] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTabChange = (value: string) => {
    setIsLoading(true);
    setActiveTab(value);
    
    // Simulate loading for the map to give better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`tel:${phone}`);
  };

  const handleDirections = (lat: number, lng: number, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
  };
  
  const toggleBranchExpanded = (branchId: number) => {
    setExpandedBranch(expandedBranch === branchId ? null : branchId);
  };

  // Find the currently selected branch based on the active tab
  const selectedBranch = branches.find(branch => branch.id.toString() === activeTab) || branches[0];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <ConstellationAnimation />
      
      <motion.div
        className="w-full max-w-6xl z-10 mb-[100px] sm:mb-0 mt-[120px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-800">Манай Салбарууд</h1>
          <p className="text-center text-gray-600 mt-2">Төв байршлуудаас өөрт хамгийн ойр салбараа сонгоно уу</p>
        </div>

        <Tabs defaultValue="1" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            {branches.map(branch => (
              <TabsTrigger 
                key={branch.id} 
                value={branch.id.toString()}
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                {branch.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Branch Details Card */}
            <Card className="bg-white/50 border-primary/20 border-[8px] backdrop-blur-sm shadow-none h-fit">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">
                  {selectedBranch.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-white/80 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-primary" />
                      Хаяг
                    </h3>
                    <p className="text-gray-700 pl-7">{selectedBranch.address}</p>
                  </div>
                  
                  <div className="p-4 bg-white/80 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-primary" />
                      Холбоо барих
                    </h3>
                    <p className="text-gray-700 pl-7">{selectedBranch.phone}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 text-sm flex items-center justify-center"
                      variant="default"
                      onClick={(e) => handleCall(selectedBranch.phone, e)}
                    >
                      <Phone size={16} className="mr-2" />
                      Залгах
                    </Button>
                    <Button 
                      className="flex-1 text-sm flex items-center justify-center"
                      variant="outline"
                      onClick={(e) => handleDirections(selectedBranch.coordinates.lat, selectedBranch.coordinates.lng, e)}
                    >
                      <Navigation size={16} className="mr-2" />
                      Чиглүүлэх
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Map Card - spans 2 columns on larger screens */}
            <Card className="bg-white/50 border-primary/20 border-[8px] backdrop-blur-sm shadow-none h-full overflow-hidden md:col-span-2">
              <CardContent className="p-4">
                <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
                  {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                      <p className="text-gray-600">Газрын зураг ачаалж байна...</p>
                    </div>
                  ) : (
                    <motion.div 
                      className="h-full w-full rounded-lg overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {branches.map(branch => (
                        <TabsContent 
                          key={branch.id} 
                          value={branch.id.toString()} 
                          className="h-full w-full m-0"
                        >
                          <iframe
                            className="w-full h-full border-0 rounded-lg"
                            loading="lazy"
                            allowFullScreen
                            src={branch.embedUrl}
                            title={`Map showing ${branch.name} location`}
                          ></iframe>
                        </TabsContent>
                      ))}
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
}