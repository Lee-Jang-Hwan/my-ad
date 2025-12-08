import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        자주 묻는 질문 (FAQ)
      </h1>

      <div className="space-y-6">
        {/* 서비스 소개 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">서비스 소개</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="service-1">
              <AccordionTrigger className="text-left">
                Q. 삽가능 스튜디오는 어떤 서비스인가요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                삽가능 스튜디오는 <strong className="text-foreground">AI를 활용한 광고 영상 및 이미지 생성 서비스</strong>입니다.
                상품 이미지와 상품명만 업로드하면, AI가 자동으로 광고 문구를 생성하고,
                고품질의 광고 영상과 이미지를 만들어 드립니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="service-2">
              <AccordionTrigger className="text-left">
                Q. 어떤 AI 기술을 사용하나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <ul className="list-disc ml-4 space-y-1">
                  <li><strong className="text-foreground">광고 문구 생성</strong>: Google Gemini 3.0을 활용하여 상품에 맞는 매력적인 광고 카피를 생성합니다.</li>
                  <li><strong className="text-foreground">이미지 정제</strong>: Nano Banana Pro를 사용하여 상품 이미지를 고품질로 정제합니다.</li>
                  <li><strong className="text-foreground">영상 생성</strong>: OpenAI Sora 2 Pro를 사용하여 역동적인 광고 영상을 제작합니다.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="service-3">
              <AccordionTrigger className="text-left">
                Q. 영상 생성에 얼마나 걸리나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                전체 영상 생성 과정은 약 <strong className="text-foreground">5~8분</strong> 정도 소요됩니다:
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>광고 문구 생성: 약 30초</li>
                  <li>이미지 정제: 약 40초</li>
                  <li>영상 생성: 약 5분</li>
                </ul>
                <p className="mt-2 text-sm">※ 서버 상황에 따라 다소 차이가 있을 수 있습니다.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="service-4">
              <AccordionTrigger className="text-left">
                Q. 이미지 생성에 얼마나 걸리나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                이미지 생성은 약 <strong className="text-foreground">3분</strong> 정도 소요됩니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* 회원가입 및 계정 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">회원가입 및 계정</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="account-1">
              <AccordionTrigger className="text-left">
                Q. 회원가입은 어떻게 하나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                홈페이지 좌측 하단의 <strong className="text-foreground">로그인</strong> 버튼을 클릭하면 회원가입 및 로그인이 가능합니다.
                이메일, Google, Tiktok, Github 계정으로 간편하게 가입할 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account-2">
              <AccordionTrigger className="text-left">
                Q. 비밀번호를 잊어버렸어요.
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                로그인 페이지에서 <strong className="text-foreground">비밀번호 찾기</strong>를 클릭하시면,
                가입 시 사용한 이메일로 비밀번호 재설정 링크를 받을 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account-3">
              <AccordionTrigger className="text-left">
                Q. 회원 탈퇴는 어떻게 하나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                오른쪽 하단 회원탈퇴에서 회원 탈퇴를 진행할 수 있습니다.
                탈퇴 시 모든 데이터(생성된 영상, 이미지, 잔여 크레딧)가 삭제되며 복구가 불가능하니 신중하게 결정해 주세요.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account-4">
              <AccordionTrigger className="text-left">
                Q. 여러 기기에서 동시에 로그인할 수 있나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                네, 가능합니다. PC, 모바일, 태블릿 등 여러 기기에서 동일 계정으로 로그인하여 서비스를 이용할 수 있습니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* 크레딧 및 결제 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">크레딧 및 결제</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="credit-1">
              <AccordionTrigger className="text-left">
                Q. 크레딧이란 무엇인가요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                크레딧은 삽가능 스튜디오에서 영상 및 이미지를 생성할 때 사용되는 <strong className="text-foreground">서비스 내 재화</strong>입니다.
                크레딧을 충전한 후 원하는 만큼 콘텐츠를 생성할 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="credit-2">
              <AccordionTrigger className="text-left">
                Q. 크레딧은 어떻게 충전하나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <ol className="list-decimal ml-4 space-y-1">
                  <li>로그인 후 <strong className="text-foreground">크레딧 충전</strong> 메뉴로 이동합니다.</li>
                  <li>원하는 크레딧 패키지를 선택합니다.</li>
                  <li>결제를 완료하면 즉시 크레딧이 충전됩니다.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="credit-3">
              <AccordionTrigger className="text-left">
                Q. 어떤 결제 수단을 지원하나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                토스페이먼츠를 통해 다양한 결제 수단을 지원합니다:
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>신용/체크카드</li>
                  <li>계좌이체</li>
                  <li>간편결제 (토스페이, 카카오페이, 네이버페이 등)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="credit-4">
              <AccordionTrigger className="text-left">
                Q. 영상/이미지 생성에 크레딧이 얼마나 필요한가요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <ul className="list-disc ml-4 space-y-1">
                  <li><strong className="text-foreground">영상 생성</strong>: 1회당 80 크레딧 소모</li>
                  <li><strong className="text-foreground">이미지 생성</strong>: 1회당 20 크레딧 소모</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="credit-5">
              <AccordionTrigger className="text-left">
                Q. 크레딧을 다른 사람에게 양도할 수 있나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                아니요, 충전된 크레딧은 <strong className="text-foreground">사용자 간 양도 및 양수가 불가능</strong>합니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="credit-7">
              <AccordionTrigger className="text-left">
                Q. 환불이 가능한가요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                다음 조건을 모두 충족하는 경우에만 <strong className="text-foreground">전액 환불</strong>이 가능합니다:
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>크레딧 충전(결제)일로부터 7일 이내</li>
                  <li>충전한 크레딧을 단 1크레딧도 사용하지 않은 경우</li>
                </ul>
                <p className="mt-3 font-medium text-foreground">환불이 불가능한 경우:</p>
                <ul className="list-disc ml-4 mt-1 space-y-1">
                  <li>결제일로부터 7일이 경과한 경우</li>
                  <li>크레딧을 1회 이상 사용한 경우 (디지털 콘텐츠 제공이 개시된 것으로 간주)</li>
                  <li>잔여 크레딧에 대한 부분 환불</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* 영상 생성 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">영상 생성</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="video-1">
              <AccordionTrigger className="text-left">
                Q. 어떤 형식의 이미지를 업로드할 수 있나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <ul className="list-disc ml-4 space-y-1">
                  <li><strong className="text-foreground">지원 형식</strong>: JPG, JPEG, PNG, WebP</li>
                  <li><strong className="text-foreground">권장 크기</strong>: 1024x1024 픽셀 이상</li>
                  <li><strong className="text-foreground">최대 용량</strong>: 10MB</li>
                </ul>
                <p className="mt-2 text-sm">※ 고화질 이미지를 업로드할수록 더 좋은 결과물을 얻을 수 있습니다.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="video-2">
              <AccordionTrigger className="text-left">
                Q. 상품명은 어떻게 입력하면 좋을까요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                상품의 특징이 잘 드러나도록 <strong className="text-foreground">구체적으로</strong> 입력해 주세요.
                <p className="mt-3 font-medium text-foreground">좋은 예시:</p>
                <ul className="list-disc ml-4 mt-1 space-y-1">
                  <li>&quot;프리미엄 오가닉 그린티 세트&quot;</li>
                  <li>&quot;초경량 방수 캠핑 백팩 30L&quot;</li>
                </ul>
                <p className="mt-3 font-medium text-foreground">피해야 할 예시:</p>
                <ul className="list-disc ml-4 mt-1 space-y-1">
                  <li>&quot;상품&quot;</li>
                  <li>&quot;제품 1&quot;</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="video-3">
              <AccordionTrigger className="text-left">
                Q. 광고 문구는 어떻게 선택하나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                AI가 여러 개의 광고 문구를 생성하면, 그 중에서 <strong className="text-foreground">가장 마음에 드는 문구 하나를 선택</strong>하거나 직접입력하시면 됩니다.
                선택한 문구가 영상에 적용됩니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="video-4">
              <AccordionTrigger className="text-left">
                Q. 생성된 영상의 길이는 얼마나 되나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                생성되는 영상의 길이는 약 <strong className="text-foreground">12초</strong>입니다.
                짧고 임팩트 있는 광고 영상에 최적화되어 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="video-5">
              <AccordionTrigger className="text-left">
                Q. 영상 생성 중에 브라우저를 닫아도 되나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                네, 괜찮습니다. 영상 생성은 서버에서 진행되므로 브라우저를 닫아도 <strong className="text-foreground">생성이 계속 진행</strong>됩니다.
                나중에 마이 페이지에서 완성된 영상을 확인하실 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="video-6">
              <AccordionTrigger className="text-left">
                Q. 영상 생성이 실패했어요. 크레딧은 어떻게 되나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                서버 오류 등 <strong className="text-foreground">회사의 귀책 사유</strong>로 영상 생성이 실패한 경우,
                사용된 크레딧은 <strong className="text-foreground">자동으로 환급</strong>됩니다.
                단, 부적절한 이미지 업로드 등 사용자 귀책 사유로 인한 실패는 환급 대상이 아닙니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* 이미지 생성 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">이미지 생성</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="image-1">
              <AccordionTrigger className="text-left">
                Q. 이미지 생성과 영상 생성의 차이점은 무엇인가요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <ul className="list-disc ml-4 space-y-1">
                  <li><strong className="text-foreground">이미지 생성</strong>: 상품 이미지를 바탕으로 정적인 광고 이미지를 생성합니다.</li>
                  <li><strong className="text-foreground">영상 생성</strong>: 상품 이미지를 바탕으로 움직이는 광고 영상을 생성합니다.</li>
                </ul>
                <p className="mt-2">사용 목적에 따라 선택해 주세요. SNS 포스팅에는 이미지를, 릴스나 숏폼에는 영상을 추천드립니다.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="image-2">
              <AccordionTrigger className="text-left">
                Q. 이미지는 어떤 크기로 생성되나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                생성되는 이미지는 다양한 플랫폼에 적합한 크기로 제공됩니다.
                정사각형(1:1) 비율을 지원합니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* 생성 결과물 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">생성 결과물</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="result-1">
              <AccordionTrigger className="text-left">
                Q. 생성된 영상/이미지는 어디서 확인하나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                로그인 후 <strong className="text-foreground">마이 페이지</strong>에서 모든 생성 결과물을 확인할 수 있습니다.
                영상 탭과 이미지 탭으로 구분되어 있어 쉽게 찾을 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="result-2">
              <AccordionTrigger className="text-left">
                Q. 생성된 콘텐츠의 소유권은 누구에게 있나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                생성된 광고 영상 및 이미지의 <strong className="text-foreground">소유권은 회원에게 있습니다</strong>.
                자유롭게 상업적 용도로 활용하실 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="result-3">
              <AccordionTrigger className="text-left">
                Q. 생성된 콘텐츠를 다운로드할 수 있나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                네, 마이 페이지에서 생성된 영상과 이미지를 <strong className="text-foreground">무제한 다운로드</strong>할 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="result-4">
              <AccordionTrigger className="text-left">
                Q. 생성된 콘텐츠는 얼마나 보관되나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                생성된 콘텐츠는 <strong className="text-foreground">회원 탈퇴 시까지</strong> 보관됩니다.
                탈퇴 시 모든 데이터가 삭제되니, 필요한 콘텐츠는 미리 다운로드해 주세요.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="result-5">
              <AccordionTrigger className="text-left">
                Q. 생성된 콘텐츠를 SNS에 바로 공유할 수 있나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                현재는 다운로드 후 직접 업로드하는 방식으로 사용하실 수 있습니다.
                향후 SNS 직접 공유 기능을 추가할 예정입니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="result-6">
              <AccordionTrigger className="text-left">
                Q. 워터마크가 있나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                아니요, 생성된 모든 콘텐츠에는 <strong className="text-foreground">워터마크가 없습니다</strong>.
                바로 상업적 용도로 활용하실 수 있습니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* 문제 해결 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">문제 해결</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="trouble-1">
              <AccordionTrigger className="text-left">
                Q. 이미지 업로드가 안 돼요.
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                다음 사항을 확인해 주세요:
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li>이미지 형식이 JPG, PNG, WebP인지 확인</li>
                  <li>파일 크기가 10MB 이하인지 확인</li>
                  <li>인터넷 연결 상태 확인</li>
                  <li>브라우저 캐시 삭제 후 재시도</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="trouble-2">
              <AccordionTrigger className="text-left">
                Q. 영상/이미지가 생성되지 않아요.
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <ol className="list-decimal ml-4 space-y-1">
                  <li>마이 페이지에서 생성 상태를 확인해 주세요.</li>
                  <li>&quot;처리 중&quot; 상태라면 잠시 기다려 주세요.</li>
                  <li>&quot;실패&quot; 상태라면 다시 시도해 주세요.</li>
                  <li>문제가 지속되면 고객센터로 문의해 주세요.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="trouble-3">
              <AccordionTrigger className="text-left">
                Q. 결제했는데 크레딧이 충전되지 않았어요.
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <ol className="list-decimal ml-4 space-y-1">
                  <li>마이 페이지에서 크레딧 잔액을 확인해 주세요.</li>
                  <li>결제 내역에서 결제 상태를 확인해 주세요.</li>
                  <li>10분이 지나도 충전되지 않으면 고객센터로 문의해 주세요.</li>
                  <li>결제 영수증을 함께 제출해 주시면 빠른 처리가 가능합니다.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="trouble-4">
              <AccordionTrigger className="text-left">
                Q. 생성된 영상/이미지 품질이 기대와 다릅니다.
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                AI 생성 결과물은 입력 이미지의 품질과 상품명에 영향을 받습니다:
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li><strong className="text-foreground">고화질 이미지</strong>를 업로드해 주세요.</li>
                  <li><strong className="text-foreground">배경이 깔끔한 이미지</strong>를 사용해 주세요.</li>
                  <li><strong className="text-foreground">상품이 잘 보이는 이미지</strong>를 선택해 주세요.</li>
                  <li><strong className="text-foreground">상품명을 구체적으로</strong> 입력해 주세요.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="trouble-5">
              <AccordionTrigger className="text-left">
                Q. 모바일에서 영상이 재생되지 않아요.
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                영상 썸네일을 <strong className="text-foreground">터치</strong>하면 재생됩니다. 재생되지 않는 경우:
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li>브라우저를 최신 버전으로 업데이트해 주세요.</li>
                  <li>다른 브라우저(Chrome, Safari)로 시도해 주세요.</li>
                  <li>앱 내 브라우저 대신 기본 브라우저를 사용해 주세요.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* 기타 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">기타</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="etc-2">
              <AccordionTrigger className="text-left">
                Q. 서비스 이용에 제한이 있나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                다음의 경우 서비스 이용이 제한될 수 있습니다:
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>불법적인 목적으로 서비스를 사용하는 경우</li>
                  <li>타인의 권리를 침해하거나 부적절한 콘텐츠를 생성하는 경우</li>
                  <li>서비스의 안정적 운영을 방해하는 경우</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="etc-3">
              <AccordionTrigger className="text-left">
                Q. 업로드한 이미지는 어떻게 처리되나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                업로드한 이미지는 서비스 제공 목적으로만 사용되며, 회원 탈퇴 시 삭제됩니다.
                회사는 서비스 개선 및 홍보 목적으로 생성된 콘텐츠를 활용할 수 있으나, 개인을 식별할 수 없는 형태로 처리합니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="etc-4">
              <AccordionTrigger className="text-left">
                Q. 저작권에 문제가 있는 이미지를 업로드하면 어떻게 되나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">회원은 업로드하는 이미지의 저작권에 대한 책임을 집니다.</strong>
                타인의 저작물을 무단으로 사용하여 발생하는 모든 법적 책임은 회원에게 있습니다.
                저작권이 있는 이미지는 사용 권한을 확인 후 업로드해 주세요.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="etc-5">
              <AccordionTrigger className="text-left">
                Q. API를 제공하나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                현재 API는 제공하지 않습니다. 향후 API 제공 계획이 있으며, 관련 업데이트는 공지사항을 통해 안내드리겠습니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* 추가 문의 안내 */}
        <Card className="p-6 bg-muted/50">
          <h2 className="text-lg font-semibold mb-2">추가 문의</h2>
          <p className="text-muted-foreground">
            FAQ에서 답변을 찾지 못하셨나요? 고객센터로 문의해 주시면 친절하게 안내해 드리겠습니다.
          </p>
        </Card>
      </div>
    </div>
  );
}
