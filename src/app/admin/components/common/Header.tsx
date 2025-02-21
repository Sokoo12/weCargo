"use client";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const Header = ({ title }: { title: string }) => {
  return (
    <header className="bg-gray-800 flex justify-between items-center px-4 sm:px-6 lg:px-8 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700">
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-100">{title}</h1>
      </div>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <Button asChild className="button bg-purple-gradient bg-cover">
          <Link href="/sign-in">Нэвтрэх</Link>
        </Button>
      </SignedOut>
    </header>
  );
};
export default Header;
