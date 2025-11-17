"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { Black_And_White_Picture } from "next/font/google";

const blackAndWhitePicture = Black_And_White_Picture({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
        {/* Logo / Brand */}
        <Link
          href="/"
          className={`text-3xl font-bold hover:opacity-80 transition-opacity ${blackAndWhitePicture.className}`}
        >
          삽가능 스튜디오
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-4 items-center">
          {/* Desktop Navigation */}
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors hidden sm:block"
            >
              내 영상
            </Link>
            <Link
              href="/upload"
              className="text-sm font-medium hover:text-primary transition-colors hidden sm:block"
            >
              영상 만들기
            </Link>
          </SignedIn>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Desktop Auth Buttons */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="hidden sm:inline-flex">로그인</Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button className="hidden sm:inline-flex">시작하기</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9"
                }
              }}
            />
          </SignedIn>

          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
