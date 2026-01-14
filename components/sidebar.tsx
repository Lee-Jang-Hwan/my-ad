"use client";

import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ImagePlus,
  Clapperboard,
  LayoutDashboard,
  LogIn,
  Coins,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
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
    title: "이미지 만들기",
    href: "/image",
    icon: ImagePlus,
    requireAuth: true,
  },
  {
    title: "영상 만들기",
    href: "/video",
    icon: Clapperboard,
    requireAuth: true,
  },
  {
    title: "스토리보드",
    href: "/storyboard",
    icon: Film,
    requireAuth: true,
  },
  {
    title: "마이 페이지",
    href: "/dashboard",
    icon: LayoutDashboard,
    requireAuth: true,
  },
  {
    title: "크레딧 충전",
    href: "/pricing",
    icon: Coins,
    requireAuth: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleMenuClick = (item: MenuItem, e: React.MouseEvent) => {
    if (item.requireAuth && !isSignedIn) {
      e.preventDefault();
      router.push("/sign-in");
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-32 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b px-2">
          <Link
            href="/"
            className={`text-sm font-bold hover:opacity-80 transition-opacity text-center ${blackAndWhitePicture.className}`}
          >
            삽가능<br/>스튜디오
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="flex flex-col items-center space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.requireAuth && !isSignedIn ? "/sign-in" : item.href}
                  onClick={(e) => handleMenuClick(item, e)}
                  className={cn(
                    "group flex flex-col items-center gap-2 px-4 py-3 text-xs font-medium transition-all duration-300 ease-in-out rounded-lg",
                    isActive
                      ? "text-black dark:text-white scale-110 font-semibold"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  <Icon className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
                  <span className="transition-all duration-300 group-hover:text-black dark:group-hover:text-white group-hover:font-semibold">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t p-2 space-y-3">
          {/* Auth Section */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default" className="w-full bg-gray-700 hover:bg-gray-800 text-white" size="sm">
                <LogIn className="w-4 h-4 mr-1" />
                로그인
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center justify-center">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                  },
                }}
              />
            </div>
          </SignedIn>

          {/* Theme Toggle */}
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
