import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";

import Header from "../components/common/Header";
import UsersList from "../components/staff/UsersList";
import { clerkClient } from "@clerk/express";

const userStats = {
  totalUsers: 152845,
  newUsersToday: 243,
  activeUsers: 98520,
  churnRate: "2.4%",
};

const StaffPage = async () => {
  const response = await clerkClient.users.getUserList({
    orderBy: "-created_at",
    limit: 10,
  });

  const usersData: ClerkUser[] = response.data.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.emailAddresses[0].emailAddress,
    imageUrl: user.imageUrl,
	createdAt:user.createdAt,
	lastActiveAt:user.lastActiveAt
  }));

  //   console.log(users[0].)
  
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Ажилтан" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* STATS */}
        {/* <motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard
						name='Total Users'
						icon={UsersIcon}
						value={userStats.totalUsers.toLocaleString()}
						color='#6366F1'
					/>
					<StatCard name='New Users Today' icon={UserPlus} value={userStats.newUsersToday} color='#10B981' />
					<StatCard
						name='Active Users'
						icon={UserCheck}
						value={userStats.activeUsers.toLocaleString()}
						color='#F59E0B'
					/>
					<StatCard name='Churn Rate' icon={UserX} value={userStats.churnRate} color='#EF4444' />
				</motion.div> */}

        <UsersList
          usersData={usersData}
        />
      </main>
    </div>
  );
};
export default StaffPage;
