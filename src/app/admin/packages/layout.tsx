import React, { ReactElement } from "react";
import Header from "../components/common/Header";

function OrderLayout({ children }: any) {
  return (
    <div className="relative z-10 flex-1 overflow-auto overflow-x-hidden">
      <Header title={"Захиалга"} />
      <div className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {children}
        </div>
    </div>
  );
}

export default OrderLayout;
