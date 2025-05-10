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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Ажилтнууд</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Хайх..."
                className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <Button
              onClick={openAddDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
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
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/40 rounded-xl border border-gray-700">
            <AlertCircle size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-xl text-gray-300 mb-2">Ажилтан олдсонгүй</p>
            <p className="text-gray-400 mb-6">Хайлтын шүүлтүүрийг өөрчлөх эсвэл шинэ ажилтан нэмнэ үү</p>
            <Button
              onClick={openAddDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus size={18} className="mr-2" />
              Ажилтан нэмэх
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-700 mt-4">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Нэр
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Имэйл
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Утас
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Үүрэг
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Төлөв
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Бүртгэгдсэн
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Сүүлд нэвтэрсэн
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Үйлдэл
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {filteredEmployees.map((employee) => (
                  <motion.tr
                    key={employee.id}
                    className="hover:bg-gray-800/50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-700 flex items-center justify-center">
                          <span className="text-lg font-medium text-white">{employee.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-white">{employee.name}</div>
                          <div className="text-sm text-gray-400">{employee.role === "MANAGER" ? "Менежер" : "Хүргэгч"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {employee.phoneNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        employee.role === "MANAGER" 
                          ? "bg-purple-900/40 text-purple-400" 
                          : "bg-orange-900/40 text-orange-400"
                      }`}>
                        {employee.role === "MANAGER" ? "Менежер" : "Хүргэгч"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        employee.isActive 
                          ? "bg-green-900/40 text-green-400" 
                          : "bg-red-900/40 text-red-400"
                      }`}>
                        {employee.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {moment(employee.joinDate).format("YYYY-MM-DD")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {employee.lastLogin ? moment(employee.lastLogin).fromNow() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => openEditDialog(employee)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4 text-blue-400" />
                        </Button>
                        <Button
                          onClick={() => openDeleteDialog(employee)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-700"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-gray-800 text-gray-100 border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Ажилтан нэмэх</DialogTitle>
            <DialogDescription className="text-gray-400">
              Ажилтны мэдээллийг оруулна уу
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Нэр</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Имэйл</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Нууц үг</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Утасны дугаар</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Хаяг</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Үүрэг</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                  <SelectValue placeholder="Үүрэг сонгох" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-gray-100">
                  <SelectItem value="MANAGER" className="text-gray-100">Менежер</SelectItem>
                  <SelectItem value="DELIVERY" className="text-gray-100">Хүргэгч</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleStatusChange}
              />
              <Label htmlFor="isActive">Идэвхтэй</Label>
            </div>
            <DialogFooter className="mt-6 flex sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Цуцлах
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Түр хүлээнэ үү..." : "Нэмэх"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 text-gray-100 border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Ажилтны мэдээлэл засах</DialogTitle>
            <DialogDescription className="text-gray-400">
              {currentEmployee?.name} - {currentEmployee?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateEmployee} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Нэр</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Имэйл</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">
                Нууц үг (хоосон үлдээвэл өөрчлөгдөхгүй)
              </Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phoneNumber">Утасны дугаар</Label>
              <Input
                id="edit-phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Хаяг</Label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Үүрэг</Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                  <SelectValue placeholder="Үүрэг сонгох" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-gray-100">
                  <SelectItem value="MANAGER" className="text-gray-100">Менежер</SelectItem>
                  <SelectItem value="DELIVERY" className="text-gray-100">Хүргэгч</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={handleStatusChange}
              />
              <Label htmlFor="edit-isActive">Идэвхтэй</Label>
            </div>
            <DialogFooter className="mt-6 flex sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Цуцлах
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Боловсруулж байна..." : "Хадгалах"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 text-gray-100 border-gray-700 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Ажилтан устгах</DialogTitle>
            <DialogDescription className="text-gray-400">
              Та "{currentEmployee?.name}" нэртэй ажилтныг устгахдаа итгэлтэй байна уу?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 p-4 bg-red-900/20 border border-red-900/30 rounded-md">
            <p className="text-red-400 text-sm">
              Энэ үйлдлийг буцаах боломжгүй. Ажилтантай холбоотой бүх мэдээлэл устах болно.
            </p>
          </div>
          <DialogFooter className="mt-6 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Цуцлах
            </Button>
            <Button
              type="button"
              onClick={handleDeleteEmployee}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Устгаж байна..." : "Устгах"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployeesList; 