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
import { Skeleton } from "@/components/ui/skeleton";
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
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2673.7631954167554!2d106.91505075!3d47.91843885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDU1JzA2LjQiTiAxMDbCsDU0JzU0LjIiRQ!5e0!3m2!1sen!2sus!4v1651234567890!5m2!1sen!2sus',
    coordinates: { lat: 47.9184, lng: 106.9175 },
    phone: '+97677889900'
  },
  {
    id: 2,
    name: 'Салбар 2',
    address: 'ХУД 23-р хороо Арцат luxury хотхон 1441 байр',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2673.9815254167554!2d106.80505075!3d47.85243885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDUxJzA4LjgiTiAxMDbCsDQ4JzE4LjIiRQ!5e0!3m2!1sen!2sus!4v1651234567890!5m2!1sen!2sus',
    coordinates: { lat: 47.8524, lng: 106.8050 },
    phone: '+97677889901'
  },
  {
    id: 3,
    name: 'Салбар 3',
    address: 'БГД, 10 хороолол, 6-р хороо, 12Б байр',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2673.8724854167554!2d106.87324075!3d47.90103885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDU0JzAzLjQiTiAxMDbCsDUyJzIzLjciRQ!5e0!3m2!1sen!2sus!4v1651234567890!5m2!1sen!2sus',
    coordinates: { lat: 47.9010, lng: 106.8732 },
    phone: '+97677889902'
  }
];

export default function AddressPage() {
  const [selectedBranch, setSelectedBranch] = useState<Location>(branches[0]);
  const [expandedBranch, setExpandedBranch] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleBranchSelect = (branch: Location) => {
    setIsLoading(true);
    setSelectedBranch(branch);
    
    // Simulate loading for the map to give better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <ConstellationAnimation />
      
      <motion.div
        className="w-full max-w-5xl z-10 mb-[100px] sm:mb-0 mt-[120px] grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Branch List Card */}
        <Card className="bg-white/50 border-primary/20 border-[8px] backdrop-blur-sm shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary text-center">
              Манай Салбарууд
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Төв байршлуудаас өөрт хамгийн ойр салбараа сонгоно уу
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {branches.map((branch) => (
                <motion.div
                  key={branch.id}
                  className={`rounded-lg overflow-hidden ${
                    selectedBranch.id === branch.id 
                      ? "bg-primary/10 border-l-4 border-primary" 
                      : "bg-gray-100 hover:bg-gray-200"
                  } cursor-pointer transition-all duration-200`}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleBranchSelect(branch)}
                >
                  <div className="p-4">
                    <div 
                      className="flex justify-between items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBranchExpanded(branch.id);
                      }}
                    >
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-primary" />
                        <span className="font-bold text-gray-800">
                          {branch.name}
                        </span>
                      </div>
                      {expandedBranch === branch.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    
                    {/* Expanded branch details */}
                    {expandedBranch === branch.id && (
                      <motion.div
                        className="mt-3 text-gray-700"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-sm py-2">{branch.address}</p>
                        <p className="text-sm py-2 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-primary" />
                          {branch.phone}
                        </p>
                      </motion.div>
                    )}
                    
                    <div className="flex mt-2 space-x-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-xs border-primary text-primary hover:bg-primary hover:text-white flex items-center space-x-1 rounded-full"
                        onClick={(e) => handleCall(branch.phone, e)}
                      >
                        <Phone size={14} />
                        <span>Залгах</span>
                      </Button>
                      <Button 
                        variant="default"
                        size="sm"
                        className="text-xs flex items-center space-x-1 rounded-full"
                        onClick={(e) => handleDirections(branch.coordinates.lat, branch.coordinates.lng, e)}
                      >
                        <Navigation size={14} />
                        <span>Байршил харах</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Google Map Card */}
        <div className="col-span-1 md:col-span-2">
          <Card className="bg-white/50 border-primary/20 border-[8px] backdrop-blur-sm shadow-none h-full overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl md:text-2xl font-bold text-primary">
                {selectedBranch.name}
              </CardTitle>
              <CardDescription className="text-gray-500">
                {selectedBranch.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative h-[400px] md:h-[500px] p-2">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600">Газрын зураг ачаалж байна...</p>
                </div>
              ) : (
                <motion.div 
                  className="h-full rounded-lg overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <iframe
                    className="w-full h-full border-0 rounded-lg"
                    loading="lazy"
                    allowFullScreen
                    src={selectedBranch.embedUrl}
                    title={`Map showing ${selectedBranch.name} location`}
                  ></iframe>
                </motion.div>
              )}
              
             
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}