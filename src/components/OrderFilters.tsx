"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OrderStatus } from "@/types/enums";
import { translateStatus } from "@/utils/translateStatus";
import { Filter, X } from "lucide-react";
import { format } from "date-fns";

type OrderFiltersProps = {
  onFilter: (filters: {
    packageId: string;
    status: OrderStatus | null;  // Changed from "" to null
    startDate: Date | undefined;
    endDate: Date | undefined;
  }) => void;
};

const OrderFilters = ({ onFilter }: OrderFiltersProps) => {
  const [open, setOpen] = useState(false);
  const [packageId, setPackageId] = useState("");
  const [status, setStatus] = useState<OrderStatus | null>(null);  // Changed from "" to null
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleFilter = () => {
    onFilter({
      packageId,
      status,
      startDate,
      endDate,
    });
    setOpen(false);
  };

  const handleReset = () => {
    setPackageId("");
    setStatus(null);  // Changed from "" to null
    setStartDate(undefined);
    setEndDate(undefined);
    onFilter({
      packageId: "",
      status: null,  // Changed from "" to null
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-gray-700 text-white">
          <Filter className="mr-2 h-4 w-4" />
          Шүүлтүүр
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4 bg-gray-800 border-gray-700 text-white">
        <div className="space-y-4">
          <h4 className="font-medium text-lg text-white">Шүүх</h4>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Захиалгын дугаар</label>
            <Input
              placeholder="Захиалгын дугаар"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Төлөв</label>
            <Select 
              value={status || undefined}  // Changed to handle null value
              onValueChange={(value) => setStatus(value as OrderStatus)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Төлөв сонгох" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="ALL">Бүгд</SelectItem>
                {Object.values(OrderStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {translateStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Rest of the component remains the same */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Эхлэх огноо</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full bg-gray-700 border-gray-600 text-white justify-start"
                  >
                    {startDate ? format(startDate, 'PPP') : "Сонгох..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    className="bg-gray-800 text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Дуусах огноо</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full bg-gray-700 border-gray-600 text-white justify-start"
                  >
                    {endDate ? format(endDate, 'PPP') : "Сонгох..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    className="bg-gray-800 text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <Button 
              variant="outline" 
              className="bg-gray-700 border-gray-600 text-white"
              onClick={handleReset}
            >
              <X className="mr-2 h-4 w-4" />
              Цэвэрлэх
            </Button>
            <Button onClick={handleFilter}>
              Шүүх
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default OrderFilters;