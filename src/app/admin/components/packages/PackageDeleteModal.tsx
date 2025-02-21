"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Delete, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

function PackageDeleteModal({ packageId, orderId }: { packageId: string; orderId: string }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      document.getElementById("closeDialog")?.click();
      
      // Show success message
      toast.success("Захиалга амжилттай устгагдлаа.");
      
      // Refetch orders list after deletion
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Захиалга устгах явцад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mb-5 bg-red-400">
          <Delete className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Захиалга устгах</DialogTitle>
          <DialogDescription>
            Та <span className="font-semibold">{packageId}</span> захиалгыг устгахдаа итгэлтэй байн уу?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" id="closeDialog" disabled={loading}>
              Үгүй
            </Button>
          </DialogClose>
          <Button className="bg-red-400" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Тийм"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PackageDeleteModal;
