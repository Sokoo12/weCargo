"use client"
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import ConstellationAnimation from "@/components/ConstellationAnimation";

// Warehouse data with rates
const warehouses = [
  {
    id: 1,
    name: "X3B3H MУЖ ШИЖЯЖУАН ХОТЫН АГУУЛАХ",
    rates: {
      weightRate: 3000, // 1кг = 3000₮ (жингээр тооцоолох)
      volumeRateSmall: 599, // 0.1м³ < эзэлхүүн ≤ 1м³
      volumeRateLarge: 399, // эзэлхүүн > 1м³
    },
  },
  {
    id: 2,
    name: "ГУАНЖКУ АГУУЛАХ",
    rates: {
      weightRate: 3500,
      volumeRateSmall: 699,
      volumeRateLarge: 499,
    },
  },
  {
    id: 3,
    name: "ШАНДУН МУЖ ЛИНЫН ХОТ АГУУЛАХ",
    rates: {
      weightRate: 4000,
      volumeRateSmall: 799,
      volumeRateLarge: 599,
    },
  },
];

export default function CalculatorPage() {
  const [weight, setWeight] = useState<number>(0); // Багцын жин (кг)
  const [height, setHeight] = useState<number>(0); // Багцын өндөр (см)
  const [length, setLength] = useState<number>(0); // Багцын урт (см)
  const [width, setWidth] = useState<number>(0); // Багцын өргөн (см)
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(
    null
  ); // Сонгосон агуулах
  const [cost, setCost] = useState<number | null>(null); // Тооцоолсон зардал

  // Сонгосон агуулахын мэдээлэл
  const selectedWarehouseData = warehouses.find(
    (w) => w.id === selectedWarehouse
  );

  // Хүргэлтийн зардлыг тооцоолох
  const calculateCost = () => {
    if (!selectedWarehouse) {
      toast.error("Агуулах сонгоно уу!");
      return;
    }

    // Сонгосон агуулахын үнийн мэдээлэл
    const warehouse = warehouses.find((w) => w.id === selectedWarehouse);
    if (!warehouse) {
      toast.error("Алдаатай агуулах сонгогдсон байна!");
      return;
    }

    const { weightRate, volumeRateSmall, volumeRateLarge } = warehouse.rates;

    // Хэмжээсийг метр болгон хувиргах
    const heightM = height / 100;
    const lengthM = length / 100;
    const widthM = width / 100;

    // Эзэлхүүнийг тооцоолох (м³)
    const volume = heightM * lengthM * widthM;

    let transportationCost = 0;

    // Эзэлхүүн эсвэл жингээр зардлыг тооцоолох
    if (volume < 0.1) {
      // Жингээр тооцоолох
      transportationCost = weight * weightRate;
    } else {
      // Эзэлхүүнээр тооцоолох
      if (volume <= 1) {
        transportationCost = volume * volumeRateSmall;
      } else {
        transportationCost = volume * volumeRateLarge;
      }
    }

    // Тооцоолсон зардлыг харуулах
    setCost(transportationCost);
    toast.success("Зардал амжилттай тооцоогдлоо!");
  };

  return (
    <div className="min-h-screen bg-white py-12 pt-[100px] pb-[150px]">
        <ConstellationAnimation/>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* <h1 className="text-2xl font-bold text-center mb-8 text-primary">
            Багцын хүргэлтийн зардлын тооцоолуур
          </h1> */}
          <Card className="p-6 shadow-lg rounded-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-primary">
                Багцын мэдээлэл оруулах
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Агуулах сонгох */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Агуулах сонгох
                  </label>
                  <Select
                    onValueChange={(value) =>
                      setSelectedWarehouse(Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Агуулах сонгох" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem
                          key={warehouse.id}
                          value={String(warehouse.id)}
                        >
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Сонгосон агуулахын үнийн мэдээлэл */}
                {selectedWarehouseData && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Сонгосон агуулахын үнийн мэдээлэл
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-medium">Жингийн үнэ:</span>{" "}
                        {selectedWarehouseData.rates.weightRate}
                        {"₮ per кг (эзэлхүүн < 0.1м³)"}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">
                          {"Эзэлхүүний үнэ (0.1м³ < эзэлхүүн ≤ 1м³)"}:
                        </span>{" "}
                        {selectedWarehouseData.rates.volumeRateSmall} ¥ per м³
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">
                          {"Эзэлхүүний үнэ (эзэлхүүн > 1м³):"}
                        </span>{" "}
                        {selectedWarehouseData.rates.volumeRateLarge} ¥ per м³
                      </p>
                    </div>
                  </div>
                )}

                {/* Жин оруулах */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Жин (кг)
                  </label>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    placeholder="Жинг кг-аар оруулна уу"
                  />
                </div>

                {/* Өндөр оруулах */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Өндөр (см)
                  </label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value))}
                    placeholder="Өндрийг см-ээр оруулна уу"
                  />
                </div>

                {/* Урт оруулах */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Урт (см)
                  </label>
                  <Input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value))}
                    placeholder="Уртыг см-ээр оруулна уу"
                  />
                </div>

                {/* Өргөн оруулах */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Өргөн (см)
                  </label>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value))}
                    placeholder="Өргөнийг см-ээр оруулна уу"
                  />
                </div>

                {/* Зардлыг тооцоолох товч */}
                <Button
                  className="w-full h-[50px] text-white"
                  onClick={calculateCost}
                >
                  Зардлыг тооцоолох
                </Button>

                {/* Тооцоолсон зардлыг харуулах */}
                {cost !== null && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Тооцоолсон хүргэлтийн зардал:
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {cost.toFixed(2)} ₮
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
