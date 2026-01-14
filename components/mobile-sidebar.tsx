"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ImagePlus,
  Clapperboard,
  LayoutDashboard,
  Menu,
  LogIn,
  Coins,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  // Hydration 에러 방지: 클라이언트에서만 Sheet 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuClick = (item: MenuItem) => {
    setOpen(false);
    if (item.requireAuth && !isSignedIn) {
      router.push("/sign-in");
    }
  };

  // 마운트 전에는 버튼만 표시 (SSR에서 동일하게 렌더링)
  if (!mounted) {
    return (
      <div className="lg:hidden">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </div>
    );
  }

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
          <VisuallyHidden>
            <SheetTitle>메뉴</SheetTitle>
          </VisuallyHidden>
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
              <div className="flex flex-col items-center space-y-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.requireAuth && !isSignedIn ? "/sign-in" : item.href}
                      onClick={() => handleMenuClick(item)}
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
            <div className="border-t p-4 space-y-3">
              {/* Theme Toggle */}
              <div className="flex items-center justify-center">
                <ThemeToggle />
              </div>

              {/* Auth Section */}
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="default" className="w-full bg-gray-700 hover:bg-gray-800 text-white" size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
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
                        avatarBox: "h-9 w-9",
                      },
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
