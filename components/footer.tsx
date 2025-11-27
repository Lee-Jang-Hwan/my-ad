"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, Mail } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);

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
              <li>주소: 강원특별자치도 춘천시 소양로 번개시장길32</li>
            </ul>
          </div>

          {/* Legal */}
          <div className="text-right">
            <h4 className="font-bold mb-4">도움의 손길</h4>
            <ul className="space-y-2 text-sm">
              <li>
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
            <Link href="#" className="hover:text-foreground transition-colors">
              Twitter
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Facebook
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
