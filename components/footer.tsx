"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, Mail, Phone } from "lucide-react";
import { FaYoutube, FaInstagram, FaXTwitter, FaTiktok, FaFacebook } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";
import Link from "next/link";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";

export function Footer() {
  const [mounted, setMounted] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Hydration 에러 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  // 로그인 상태가 로드되었고 로그인된 경우에만 회원탈퇴 버튼 표시
  const showDeleteAccount = isLoaded && isSignedIn;
  const currentYear = mounted ? new Date().getFullYear() : 2025;

  return (
    <footer className="border-t bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h4 className="font-bold mb-4">시하린컴퍼니</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>대표자명: 김수현</li>
              <li>사업자등록번호: 641-40-01131</li>
              <li>통신판매업신고번호: 2024-강원춘천-0856</li>
              <li>주소: 강원특별자치도 춘천시 소양로 번개시장길32(소양로1가), 106호</li>
            </ul>
          </div>

          {/* Legal */}
          <div className="text-right">
            <h4 className="font-bold mb-4">도움의 손길</h4>
            <ul className="space-y-2 text-sm">
              <li>
                {mounted ? (
                  <Dialog open={isCustomerServiceOpen} onOpenChange={setIsCustomerServiceOpen}>
                    <DialogTrigger asChild>
                      <button
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        고객센터
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>고객센터</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">상담가능시간</p>
                            <p className="font-medium">09:00 ~ 18:00</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">전화번호</p>
                            <a
                              href="tel:010-7266-0807"
                              className="font-medium hover:underline"
                            >
                              010-7266-0807
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">이메일</p>
                            <a
                              href="mailto:sappable@gmail.com"
                              className="font-medium hover:underline"
                            >
                              sappable@gmail.com
                            </a>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <button
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    고객센터
                  </button>
                )}
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  서비스 이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  개인정보 처리방침
                </Link>
              </li>
              {showDeleteAccount && (
                <li>
                  <button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
                  >
                    회원탈퇴
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
          <p>
            Copyright © {currentYear} 삽가능 스튜디오. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="https://www.youtube.com/@%EC%82%BD%EA%B0%80%EB%8A%A5%EC%8A%A4%ED%8A%9C%EB%94%94%EC%98%A4" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Youtube">
              <FaYoutube className="h-5 w-5" />
            </Link>
            <Link href="https://www.tiktok.com/@sappable" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FaTiktok className="h-5 w-5" />
            </Link>
            <Link href="https://x.com/sappablestudio" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer" aria-label="X">
              <FaXTwitter className="h-5 w-5" />
            </Link>
            <Link href="https://www.facebook.com/share/17YGM8FRZP/?mibextid=wwXIfr" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook className="h-5 w-5" />
            </Link>
            <Link href="https://www.instagram.com/sapp_studio/" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram className="h-5 w-5" />
            </Link>
            <Link href="https://www.threads.com/@sapp_studio" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Threads">
              <SiThreads className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 회원탈퇴 모달 */}
      {showDeleteAccount && (
        <DeleteAccountDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
    </footer>
  );
}
