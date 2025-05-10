import { ReactNode } from 'react';

export default function DeliveryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex-1">
      {children}
    </div>
  );
} 