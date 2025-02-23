"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Image from "next/image";
import moment from "moment";
import "moment/locale/mn"; // Import Mongolian locale

type UserListProps = {
  usersData: ClerkUser[];
};

const UsersList = ({ usersData }: UserListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<ClerkUser[]>(usersData);

  //   const [lastActivatedDate, setLastActivatedDate] = useState<string | null>(
  //     null
  //   );

  useEffect(() => {
    //   const timestamp = 1739634675621; // Replace with your timestamp
    //   const date = moment(timestamp); // Create a Moment.js object from the timestamp

    //   // Format the date
    //   const formattedDate = date.format("MMMM Do YYYY, h:mm:ss a"); // Example: "December 17th 2024, 12:04:35 pm"
    //   setLastActivatedDate(formattedDate);
    moment.locale("mn");
  }, []);

  //   console.log(usersData);

  const handleSearch = (e: any) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = usersData.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Ажилтнууд</h2>
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
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Имэйл
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Бүртгэгдсэн
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Сүүлд нэвтэрсэн
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Үйлдэл
              </th> */}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {filteredUsers.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {/* <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {user.firs}
                      </div> */}
                      <Image
                        src={user.imageUrl}
                        height={40}
                        width={40}
                        alt="userImg"
                        className="rounded-full"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-100">
                        {user.firstName}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100">
                    {moment(user.createdAt).format('LL')}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {/* <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "Active"
                        ? "bg-green-800 text-green-100"
                        : "bg-red-800 text-red-100"
                    }`}
                  >
                    {user.status}
                  </span> */}
                  {moment(user.lastActiveAt).startOf("day").fromNow()}
                </td>

                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button className="text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </td> */}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
export default UsersList;
