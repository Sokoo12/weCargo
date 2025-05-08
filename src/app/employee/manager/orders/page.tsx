'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OrderStatus, OrderSize } from '@prisma/client';
import { Edit, Trash2, Plus, FileText, Clock, Search, Package, ArrowUp, Box, AlertTriangle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import OrderDetailsModal from '../components/OrderDetailsModal';
import OrderForm from '../components/orders/OrderForm';
import BulkOrderUpload from '../components/orders/BulkOrderUpload';
import OrderExport from '../components/orders/OrderExport';

interface StatusHistoryItem {
  id: string;
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

interface OrderDetails {
  id: string;
  orderId: string;
  totalQuantity: number;
  shippedQuantity: number;
  largeItemQuantity: number;
  smallItemQuantity: number;
  priceRMB: number;
  priceTonggur: number;
  deliveryAvailable: boolean;
  comments?: string;
  createdAt: Date;
}

interface Order {
  id: string;
  orderId?: string;
  packageId: string;
  phoneNumber?: string;
  size: OrderSize;
  status: OrderStatus;
  createdAt: Date;
  note?: string;
  isShipped?: boolean;
  isDamaged?: boolean;
  damageDescription?: string;
  statusHistory?: StatusHistoryItem[];
  orderDetails?: OrderDetails;
}

// Define filter types for the dashboard
type FilterType = 'NONE' | 'STATUS' | 'SHIPPED' | 'DAMAGED';
type StatusFilter = 'IN_WAREHOUSE' | 'IN_TRANSIT' | 'IN_UB' | null;

export default function ManagerOrdersPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add state for filters
  const [filterType, setFilterType] = useState<FilterType>('NONE');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);

  // Define fetchOrders before using it in useQuery
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      
      // Filter orders to only include the statuses managers are allowed to see
      const allowedStatuses = ['IN_WAREHOUSE', 'IN_TRANSIT', 'IN_UB'];
      const filteredData = data.filter((order: Order) => 
        allowedStatuses.includes(order.status)
      );
      
      return filteredData as Order[];
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Алдаа', {
        description: 'Захиалгуудыг ачаалж чадсангүй'
      });
      throw error;
    }
  };

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  // Calculate statistics
  const getStatusCounts = () => {
    const counts = {
      IN_WAREHOUSE: 0,
      IN_TRANSIT: 0,
      IN_UB: 0,
      SHIPPED: 0,
      DAMAGED: 0,
      TOTAL: 0
    };

    orders.forEach(order => {
      counts.TOTAL++;
      
      // Count by status
      if (order.status === 'IN_WAREHOUSE') {
        counts.IN_WAREHOUSE++;
      } else if (order.status === 'IN_TRANSIT') {
        counts.IN_TRANSIT++;
      } else if (order.status === 'IN_UB') {
        counts.IN_UB++;
      }
      
      // Count shipped orders
      if (order.isShipped) {
        counts.SHIPPED++;
      }
      
      // Count damaged orders
      if (order.isDamaged) {
        counts.DAMAGED++;
      }
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Handle filter card clicks
  const handleFilterByStatus = (status: StatusFilter) => {
    setFilterType('STATUS');
    setStatusFilter(status);
    setSearchTerm('');
  };

  const handleFilterByShipped = () => {
    setFilterType('SHIPPED');
    setStatusFilter(null);
    setSearchTerm('');
  };

  const handleFilterByDamaged = () => {
    setFilterType('DAMAGED');
    setStatusFilter(null);
    setSearchTerm('');
  };

  const clearFilters = () => {
    setFilterType('NONE');
    setStatusFilter(null);
    setSearchTerm('');
  };

  // Apply all filters to the orders
  const filteredOrders = orders.filter((order) => {
    // Ensure we only work with the allowed statuses
    const allowedStatuses = ['IN_WAREHOUSE', 'IN_TRANSIT', 'IN_UB'];
    if (!allowedStatuses.includes(order.status)) return false;
    
    // First apply search term filter
    const matchesSearch = searchTerm === '' || 
      order.packageId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Then apply status/category filters
    if (filterType === 'NONE') return true;
    if (filterType === 'STATUS' && statusFilter) return order.status === statusFilter;
    if (filterType === 'SHIPPED') return order.isShipped === true;
    if (filterType === 'DAMAGED') return order.isDamaged === true;
    
    return true;
  });

  const handleDeleteOrder = async () => {
    if (!currentOrder) return;
    
    try {
      const response = await fetch(`/api/orders/${currentOrder.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete order');
      
      await refetch();
      setIsDeleteDialogOpen(false);
      
      toast.success('Амжилттай', {
        description: 'Захиалга амжилттай устгагдлаа'
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Алдаа', {
        description: 'Захиалгыг устгаж чадсангүй'
      });
    }
  };

  const confirmDelete = (order: Order) => {
    setCurrentOrder(order);
    setIsDeleteDialogOpen(true);
  };
  
  const showHistoryModal = (order: Order) => {
    setCurrentOrder(order);
    setIsHistoryModalOpen(true);
  };
  
  const showDetailsModal = (order: Order) => {
    if (order.orderDetails) {
      setCurrentOrder(order);
      setIsDetailsModalOpen(true);
    } else {
      toast.error('Алдаа', {
        description: 'Энэ захиалгын дэлгэрэнгүй мэдээлэл олдсонгүй'
      });
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    // Only define colors for statuses the manager can select
    const statusMap: Record<string, string> = {
      IN_WAREHOUSE: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30',
      IN_TRANSIT: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
      IN_UB: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30',
    };
    
    return statusMap[status] || 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30';
  };
  
  const translateStatus = (status: OrderStatus): string => {
    // Only show translations for statuses the manager can select
    const translations: Record<string, string> = {
      IN_WAREHOUSE: 'Эрээн агуулахад ирсэн',
      IN_TRANSIT: 'Эрээн агуулахаас гарсан',
      IN_UB: 'УБ-д ирсэн',
    };
    
    return translations[status] || status.replace('_', ' ');
  };
  
  // Get the current filter description for display
  const getFilterDescription = () => {
    if (filterType === 'NONE') return null;
    if (filterType === 'STATUS' && statusFilter === 'IN_WAREHOUSE') return 'Эрээн агуулахад ирсэн';
    if (filterType === 'STATUS' && statusFilter === 'IN_TRANSIT') return 'Эрээн агуулахаас гарсан';
    if (filterType === 'STATUS' && statusFilter === 'IN_UB') return 'УБ-д ирсэн';
    if (filterType === 'SHIPPED') return 'Ачигдсан';
    if (filterType === 'DAMAGED') return 'Гэмтэлтэй';
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Захиалгын удирдлага</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center py-8">Захиалгуудыг ачааллаж байна...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Захиалгын удирдлага</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center py-8 text-red-500">Захиалгуудыг ачааллахад алдаа гарлаа</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Захиалгын удирдлага</h1>
      </div>
      
      {/* Statistics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => clearFilters()}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="text-2xl font-bold">{statusCounts.TOTAL}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Нийт захиалга</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${filterType === 'STATUS' && statusFilter === 'IN_WAREHOUSE' ? 'ring-2 ring-yellow-500' : ''}`}
          onClick={() => handleFilterByStatus('IN_WAREHOUSE')}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
                <Package className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div className="text-2xl font-bold">{statusCounts.IN_WAREHOUSE}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Эрээн агуулахад</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${filterType === 'STATUS' && statusFilter === 'IN_TRANSIT' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleFilterByStatus('IN_TRANSIT')}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <ArrowUp className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="text-2xl font-bold">{statusCounts.IN_TRANSIT}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Эрээнээс гарсан</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${filterType === 'STATUS' && statusFilter === 'IN_UB' ? 'ring-2 ring-orange-500' : ''}`}
          onClick={() => handleFilterByStatus('IN_UB')}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
                <Box className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div className="text-2xl font-bold">{statusCounts.IN_UB}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">УБ-д ирсэн</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${filterType === 'SHIPPED' ? 'ring-2 ring-green-500' : ''}`}
          onClick={handleFilterByShipped}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <Package className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div className="text-2xl font-bold">{statusCounts.SHIPPED}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ачигдсан</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${filterType === 'DAMAGED' ? 'ring-2 ring-red-500' : ''}`}
          onClick={handleFilterByDamaged}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div className="text-2xl font-bold">{statusCounts.DAMAGED}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Гэмтэлтэй</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-4 justify-between">
        <div className="flex gap-3">
          <OrderForm updateMode={false} />
          <BulkOrderUpload />
          
          {/* Active filter indicator */}
          {filterType !== 'NONE' && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md">
              <span className="text-sm">
                Хайлт: <span className="font-medium">{getFilterDescription()}</span>
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 ml-2"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <OrderExport />
          <div className="relative">
            <Input
              type="text"
              placeholder="Хайх..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value) {
                  setFilterType('NONE');
                  setStatusFilter(null);
                }
              }}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Захиалгууд</CardTitle>
          <div className="text-sm text-gray-500">
            {filteredOrders.length} захиалга
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ачааны дугаар</TableHead>
                <TableHead>Захиалгын дугаар</TableHead>
                <TableHead>Төлөв</TableHead>
                <TableHead>Үүсгэсэн</TableHead>
                <TableHead>Утас</TableHead>
                <TableHead>Ачигдсан</TableHead>
                <TableHead>Гэмтэлтэй</TableHead>
                <TableHead className="text-right">Үйлдлүүд</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Захиалга олдсонгүй
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.packageId}</TableCell>
                    <TableCell>{order.orderId || 'Н/Б'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(order.status)}>
                        {translateStatus(order.status)}
                      </Badge>
                      {order.statusHistory && order.statusHistory.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showHistoryModal(order);
                          }}
                          className="ml-2 text-gray-400 hover:text-gray-300"
                          title="Төлөвийн түүх"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                      )}
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{order.phoneNumber || 'Н/Б'}</TableCell>
                    <TableCell>{order.isShipped ? 'Тийм' : 'Үгүй'}</TableCell>
                    <TableCell>{order.isDamaged ? 'Тийм' : 'Үгүй'}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <OrderForm updateMode={true} orderId={order.id} />
                      {order.orderDetails && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Захиалгын дэлгэрэнгүй"
                          onClick={() => showDetailsModal(order)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete(order)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Устгахыг баталгаажуулах</DialogTitle>
            <DialogDescription>
              Та энэ захиалгыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>
              Устгах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Status History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Төлөвийн түүх</DialogTitle>
            <DialogDescription>
              {currentOrder?.packageId} захиалгын төлөвийн өөрчлөлтүүд
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {currentOrder?.statusHistory && currentOrder.statusHistory.length > 0 ? (
              currentOrder.statusHistory
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((history) => (
                  <div key={history.id} className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-1">
                      <Badge className={getStatusBadge(history.status)}>
                        {translateStatus(history.status)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(history.timestamp).toLocaleDateString()} {new Date(history.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {history.note && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{history.note}</p>}
                  </div>
                ))
            ) : (
              <p className="text-center text-gray-500">Төлөвийн түүх байхгүй байна</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>
              Хаах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Order Details Modal */}
      {currentOrder && (
        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          orderDetails={currentOrder.orderDetails || null}
          packageId={currentOrder.packageId}
        />
      )}
    </div>
  );
} 