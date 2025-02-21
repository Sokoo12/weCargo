"use client";

import PackagesList from "../components/packages/PackagesList";
import OrderForm from "../components/packages/OrderForm";
import BulkOrderUpload from "../components/packages/BulkOrderUpload";

const PackagesPage = () => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="flex gap-3">
        <OrderForm updateMode={false} />
        <BulkOrderUpload />
      </div>
      {/* 
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					<DailyOrders />
					<OrderDistribution />
				</div> */}

      <PackagesList />
    </div>
  );
};
export default PackagesPage;
