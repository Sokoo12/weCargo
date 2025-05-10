import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { Loader2, TruckIcon, MapPin, Home, Building, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DeliveryFormProps {
  orderId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const UB_DISTRICTS = [
  "Баянгол",
  "Баянзүрх",
  "Чингэлтэй",
  "Сүхбаатар",
  "Хан-Уул",
  "Сонгинохайрхан",
  "Налайх",
  "Багануур",
  "Багахангай",
];

const DeliveryForm = ({ orderId, onSuccess, onCancel }: DeliveryFormProps) => {
  const [formData, setFormData] = useState({
    address: "",
    district: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDistrictChange = (value: string) => {
    setFormData((prev) => ({ ...prev, district: value }));
    if (errors.district) {
      setErrors((prev) => ({ ...prev, district: "" }));
    }
  };

  const validate = (step?: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1 || !step) {
      if (!formData.district) {
        newErrors.district = "Дүүргээ сонгоно уу";
      }
    }
    
    if (step === 2 || !step) {
      if (!formData.address.trim()) {
        newErrors.address = "Хаягаа оруулна уу";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validate(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address || !formData.district) {
      toast.error("Хүргэлтийн хаяг оруулна уу");
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        orderId,
        address: formData.address,
        district: formData.district,
        notes: formData.notes
      };
      
      const response = await fetch("/api/orders/delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error("Хүргэлтийн хүсэлт илгээх үед алдаа гарлаа");
      }
      
      toast.success("Хүргэлтийн хүсэлт амжилттай илгээгдлээ!");
      onSuccess();
    } catch (error) {
      console.error("Delivery request error:", error);
      toast.error("Хүргэлтийн хүсэлт илгээх үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const renderStepDots = () => {
    return (
      <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-5">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-all duration-300 ${
              index + 1 === currentStep
                ? "bg-primary scale-110"
                : index + 1 < currentStep
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center mb-1 sm:mb-2 text-primary">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              <h3 className="font-medium text-sm sm:text-base">Хүргэлтийн бүс</h3>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="district" className="text-xs sm:text-sm font-medium">Дүүрэг</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-white shadow-md border border-gray-100 max-w-[200px] text-xs sm:text-sm">
                      <p className="max-w-[140px] sm:max-w-[200px]">Зөвхөн Улаанбаатар хотын дүүргүүдэд хүргэлт хийгдэнэ</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select 
                value={formData.district} 
                onValueChange={handleDistrictChange}
              >
                <SelectTrigger className={`rounded-lg transition-all h-9 sm:h-11 text-xs sm:text-sm ${errors.district ? "border-red-500 ring-1 ring-red-500" : "focus:ring-2 focus:ring-primary/20"}`}>
                  <SelectValue placeholder="Дүүргээ сонгоно уу" />
                </SelectTrigger>
                <SelectContent className="text-xs sm:text-sm">
                  {UB_DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.district && (
                <p className="text-xs sm:text-sm text-red-500 flex items-center">
                  <span className="text-red-600 mr-1 text-xs">●</span>
                  {errors.district}
                </p>
              )}
            </div>
            
            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg mt-3 sm:mt-4 text-blue-600 text-xs sm:text-sm">
              <div className="flex items-start">
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                <p>Хүргэлтийн үйлчилгээ Улаанбаатар хотын хэмжээнд үйлчилнэ. Хүргэлтийн төлбөр дүүргээс хамааран өөр өөр байна.</p>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center mb-1 sm:mb-2 text-primary">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              <h3 className="font-medium text-sm sm:text-base">Хүргэлтийн хаяг</h3>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="address" className="text-xs sm:text-sm font-medium">Гэрийн хаяг</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Гэрийн хаягаа дэлгэрэнгүй оруулна уу"
                  className={`pl-8 sm:pl-10 rounded-lg h-9 sm:h-11 text-xs sm:text-sm ${errors.address ? "border-red-500 ring-1 ring-red-500" : "focus:ring-2 focus:ring-primary/20"}`}
                />
              </div>
              {errors.address && (
                <p className="text-xs sm:text-sm text-red-500 flex items-center">
                  <span className="text-red-600 mr-1 text-xs">●</span>
                  {errors.address}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="notes" className="text-xs sm:text-sm font-medium">Нэмэлт тэмдэглэл</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Хүргэлтэнд хэрэгтэй нэмэлт мэдээлэл"
                className="rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 resize-none"
                rows={2}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {renderStepDots()}
      {renderStepContent()}

      <div className="flex justify-between pt-3 sm:pt-4 mt-1 sm:mt-2 border-t border-gray-100">
        {currentStep > 1 ? (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handlePrevStep}
            disabled={loading}
            className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
          >
            Буцах
          </Button>
        ) : (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
            className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
          >
            Болих
          </Button>
        )}

        {currentStep < totalSteps ? (
          <Button 
            type="button"
            onClick={handleNextStep}
            className="bg-primary hover:bg-primary/90 h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
          >
            Үргэлжлүүлэх
          </Button>
        ) : (
          <Button 
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                Илгээж байна...
              </>
            ) : (
              <>
                <TruckIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Хүргэлт хүсэх
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
};

export default DeliveryForm; 