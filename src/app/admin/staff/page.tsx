import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import Header from "../components/common/Header";
import EmployeesList from "../components/staff/EmployeesList";
import { getAllEmployees } from "@/lib/actions/employee.actions";

const userStats = {
  totalEmployees: 0,
  activeEmployees: 0,
  managersCount: 0,
  deliveryCount: 0,
};

const StaffPage = async () => {
  // Fetch employees using server action (no auth issues)
  const employees = await getAllEmployees();

  // Calculate stats
  userStats.totalEmployees = employees.length;
  userStats.activeEmployees = employees.filter(emp => emp.isActive).length;
  userStats.managersCount = employees.filter(emp => emp.role === 'MANAGER').length;
  userStats.deliveryCount = employees.filter(emp => emp.role === 'DELIVERY').length;

  return (
    <div>
      <Header title="Ажилтны удирдлага" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Нийт ажилтан</p>
              <h3 className="text-white text-2xl font-bold mt-1">{userStats.totalEmployees}</h3>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Идэвхтэй ажилтан</p>
              <h3 className="text-white text-2xl font-bold mt-1">{userStats.activeEmployees}</h3>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Менежер</p>
              <h3 className="text-white text-2xl font-bold mt-1">{userStats.managersCount}</h3>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Хүргэгч</p>
              <h3 className="text-white text-2xl font-bold mt-1">{userStats.deliveryCount}</h3>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <UserX className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <EmployeesList initialEmployees={employees} />
    </div>
  );
};

export default StaffPage;
