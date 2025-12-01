"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Mobile navigation menu component
 * Displayed only on small screens (< 640px)
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:hidden">
        <SheetHeader>
          <SheetTitle>메뉴</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-6">
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-lg font-medium hover:text-primary transition-colors py-2"
              onClick={handleLinkClick}
            >
              내 영상
            </Link>
            <Link
              href="/upload"
              className="text-lg font-medium hover:text-primary transition-colors py-2"
              onClick={handleLinkClick}
            >
              영상 만들기
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="w-full justify-start text-lg">
                로그인
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button className="w-full text-lg">시작하기</Button>
            </SignInButton>
          </SignedOut>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
