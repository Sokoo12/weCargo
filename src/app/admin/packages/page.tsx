// app/admin/packages/page.tsx
"use client";

import PackagesList from "../components/packages/PackagesList";
import OrderForm from "../components/packages/OrderForm";
import BulkOrderUpload from "../components/packages/BulkOrderUpload";
import OrderExport from "../components/packages/orderExport";
const PackagesPage = () => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="flex flex-wrap gap-3 mb-4 justify-between">
        <div className="flex gap-3">
          <OrderForm updateMode={false} />
          <BulkOrderUpload />
        </div>
        
        {/* Add the new export component */}
        <OrderExport />
      </div>

      <PackagesList />
    </div>
  );
};

export default PackagesPage;