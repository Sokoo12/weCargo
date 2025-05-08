"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, UserPlus, AlertCircle } from "lucide-react";
import Image from "next/image";
import moment from "moment";
import "moment/locale/mn"; // Import Mongolian locale
import { Employee, EmployeeFormData } from "@/types/employee";
import { EmployeeRole } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createEmployee, updateEmployee, deleteEmployee } from "@/lib/actions/employee.actions";

type EmployeeListProps = {
  initialEmployees?: Employee[];
};

const EmployeesList = ({ initialEmployees = [] }: EmployeeListProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(initialEmployees);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    role: EmployeeRole.DELIVERY,
    isActive: true,
  });

  useEffect(() => {
    moment.locale("mn");
    // We're not fetching employees on load since we already have initialEmployees
    setIsLoading(false);
  }, []);

  // Update filtered employees when search term changes
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredEmployees(employees);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(term) ||
          employee.email.toLowerCase().includes(term)
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as EmployeeRole }));
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      address: "",
      role: EmployeeRole.DELIVERY,
      isActive: true,
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: "", // Empty for security reasons
      phoneNumber: employee.phoneNumber || "",
      address: employee.address || "",
      role: employee.role,
      isActive: employee.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password) {
      toast.error("Нууц үг оруулна уу");
      return;
    }

    try {
      setIsLoading(true);
      
      // Use server action to create employee
      const newEmployee = await createEmployee(formData);
      
      // Add the new employee to our state
      setEmployees(prev => [newEmployee as Employee, ...prev]);
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Ажилтан амжилттай нэмэгдлээ");
      
      // Force refresh
      router.refresh();
      
    } catch (error: any) {
      toast.error(`Алдаа гарлаа: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    try {
      setIsLoading(true);
      
      // Use server action to update employee
      const updatedEmployee = await updateEmployee(currentEmployee.id, formData);
      
      // Update the employee in our state
      setEmployees(prev => 
        prev.map(emp => emp.id === currentEmployee.id ? updatedEmployee as Employee : emp)
      );
      
      setIsEditDialogOpen(false);
      setCurrentEmployee(null);
      resetForm();
      toast.success("Ажилтны мэдээлэл амжилттай шинэчлэгдлээ");
      
      // Force refresh
      router.refresh();
      
    } catch (error: any) {
      toast.error(`Алдаа гарлаа: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!currentEmployee) return;

    try {
      setIsLoading(true);
      
      // Use server action to delete employee
      await deleteEmployee(currentEmployee.id);
      
      // Remove the employee from our state
      setEmployees(prev => 
        prev.filter(emp => emp.id !== currentEmployee.id)
      );
      
      setIsDeleteDialogOpen(false);
      setCurrentEmployee(null);
      toast.success("Ажилтан амжилттай устгагдлаа");
      
      // Force refresh
      router.refresh();
      
    } catch (error: any) {
      toast.error(`Алдаа гарлаа: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Ажилтнууд</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Хайх..."
                className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <Button
              onClick={openAddDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              <UserPlus size={18} className="mr-2" />
              Ажилтан нэмэх
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Нэр
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Имэйл
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Утас
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Үүрэг
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Төлөв
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Бүртгэгдсэн
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Сүүлд нэвтэрсэн
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Үйлдэл
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                      <AlertCircle className="mx-auto mb-2" size={24} />
                      {searchTerm ? "Хайлтад тохирох ажилтан олдсонгүй" : "Ажилтны мэдээлэл байхгүй байна"}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                              {employee.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-100">
                              {employee.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{employee.email}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {employee.phoneNumber || "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.role === "MANAGER" 
                            ? "bg-purple-800 text-purple-100" 
                            : "bg-blue-800 text-blue-100"
                        }`}>
                          {employee.role === "MANAGER" ? "Менежер" : "Хүргэгч"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.isActive
                            ? "bg-green-800 text-green-100"
                            : "bg-red-800 text-red-100"
                        }`}>
                          {employee.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-200">
                          {moment(employee.joinDate).format('LL')}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {employee.lastLogin 
                          ? moment(employee.lastLogin).fromNow() 
                          : "Хэзээ ч нэвтрээгүй"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openEditDialog(employee)}
                            className="text-blue-400 hover:text-blue-300"
                            disabled={isLoading}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => openDeleteDialog(employee)}
                            className="text-red-400 hover:text-red-300"
                            disabled={isLoading}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Шинэ ажилтан нэмэх</DialogTitle>
            <DialogDescription className="text-gray-400">
              Шинэ ажилтны мэдээллийг оруулна уу
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div>
              <Label htmlFor="name">Нэр</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ажилтны нэр"
                required
                className="bg-gray-700 border-gray-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="email">Имэйл</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                required
                className="bg-gray-700 border-gray-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password">Нууц үг</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="bg-gray-700 border-gray-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Утасны дугаар</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="99887766"
                className="bg-gray-700 border-gray-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="address">Хаяг</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Ажилтны хаяг"
                className="bg-gray-700 border-gray-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="role">Үүрэг</Label>
              <Select 
                value={formData.role} 
                onValueChange={handleRoleChange}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Үүрэг сонгох" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value={EmployeeRole.MANAGER}>Менежер</SelectItem>
                  <SelectItem value={EmployeeRole.DELIVERY}>Хүргэгч</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive" 
                checked={formData.isActive} 
                onCheckedChange={handleStatusChange}
                disabled={isLoading}
              />
              <Label htmlFor="isActive">Идэвхтэй</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isLoading}
              >
                Цуцлах
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Боловсруулж байна...' : 'Нэмэх'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Ажилтны мэдээлэл засах</DialogTitle>
            <DialogDescription className="text-gray-400">
              {currentEmployee?.name}-н мэдээллийг шинэчлэх
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateEmployee} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Нэр</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ажилтны нэр"
                required
                className="bg-gray-700 border-gray-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Имэйл</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                required
                className="bg-gray-700 border-gray-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="edit-password">
                Нууц үг (хоосон үлдээвэл өөрчлөгдөхгүй)
              </Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="bg-gray-700 border-gray-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="edit-phoneNumber">Утасны дугаар</Label>
              <Input
                id="edit-phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="99887766"
                className="bg-gray-700 border-gray-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="edit-address">Хаяг</Label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Ажилтны хаяг"
                className="bg-gray-700 border-gray-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="edit-role">Үүрэг</Label>
              <Select 
                value={formData.role} 
                onValueChange={handleRoleChange}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Үүрэг сонгох" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value={EmployeeRole.MANAGER}>Менежер</SelectItem>
                  <SelectItem value={EmployeeRole.DELIVERY}>Хүргэгч</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-isActive" 
                checked={formData.isActive} 
                onCheckedChange={handleStatusChange}
                disabled={isLoading}
              />
              <Label htmlFor="edit-isActive">Идэвхтэй</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isLoading}
              >
                Цуцлах
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Боловсруулж байна...' : 'Хадгалах'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Ажилтан устгах</DialogTitle>
            <DialogDescription className="text-gray-400">
              Та {currentEmployee?.name} нэртэй ажилтныг устгахдаа итгэлтэй байна уу?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-900 bg-opacity-40 p-4 rounded-md border border-red-700 mb-4">
            <p className="text-red-200 flex items-center">
              <AlertCircle className="mr-2" size={18} />
              Энэ үйлдлийг буцаах боломжгүй.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={isLoading}
            >
              Цуцлах
            </Button>
            <Button 
              type="button" 
              onClick={handleDeleteEmployee}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Боловсруулж байна...' : 'Устгах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployeesList; 