"use client";

import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Upload,
  LayoutDashboard,
  Menu,
  X,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Black_And_White_Picture } from "next/font/google";
import { cn } from "@/lib/utils";

const blackAndWhitePicture = Black_And_White_Picture({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAuth?: boolean;
}

const menuItems: MenuItem[] = [
  {
    title: "홈",
    href: "/",
    icon: Home,
  },
  {
    title: "영상 만들기",
    href: "/upload",
    icon: Upload,
    requireAuth: true,
  },
  {
    title: "내 영상",
    href: "/dashboard",
    icon: LayoutDashboard,
    requireAuth: true,
  },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b px-6">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={`text-xl font-bold hover:opacity-80 transition-opacity ${blackAndWhitePicture.className}`}
              >
                삽가능 스튜디오
              </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  if (item.requireAuth) {
                    return (
                      <SignedIn key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SignedIn>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Bottom Section */}
            <div className="border-t p-4 space-y-3">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-medium text-muted-foreground">
                  테마
                </span>
                <ThemeToggle />
              </div>

              {/* Auth Section */}
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="default" className="w-full" size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    로그인
                  </Button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <div className="flex items-center gap-3 px-2">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "h-9 w-9",
                      },
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">계정관리</p>
                  </div>
                </div>
              </SignedIn>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
