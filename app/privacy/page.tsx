import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        삽가능 스튜디오 개인정보 처리방침
      </h1>

      <div className="space-y-6">
        {/* 제1조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제1조 (수집하는 개인정보 항목)
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <div>
              <p className="font-medium text-foreground mb-2">
                1. 회원 가입 시 수집하는 항목
              </p>
              <ul className="list-none ml-4 space-y-1">
                <li>① 이메일</li>
                <li>② 깃허브</li>
                <li>③ 애플</li>
                <li>④ 암호화된 비밀번호</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">
                2. 결제 시 수집하는 항목
              </p>
              <ul className="list-none ml-4 space-y-1">
                <li>① 결제 카드 종류</li>
                <li>② 카드 번호(5자리는 *로 수집)</li>
                <li>③ 결제 승인번호</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">
                3. 문의 시 수집하는 항목
              </p>
              <ul className="list-none ml-4 space-y-1">
                <li>① 이름</li>
                <li>② 상호명</li>
                <li>③ 상품명</li>
                <li>④ 이메일</li>
                <li>⑤ 전화번호</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 제2조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제2조 (개인정보 이용 목적)
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              회사는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적
              이외의 용도로는 이용하지 않습니다:
            </p>
            <ul className="list-none ml-4 space-y-1">
              <li>① 서비스 제공</li>
              <li>② 콘텐츠 제공</li>
              <li>③ 본인인증</li>
              <li>④ 요금 추심</li>
              <li>⑤ 회원관리</li>
              <li>⑥ 마케팅 및 광고 활용</li>
            </ul>
          </div>
        </Card>

        {/* 제3조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제3조 (개인정보의 보유 및 이용기간)
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
              개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
              개인정보를 처리·보유합니다.
            </p>
            <div>
              <p className="font-medium text-foreground mb-2">
                2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:
              </p>
              <ul className="list-none ml-4 space-y-1">
                <li>① 회원 가입 및 관리 : 회원 탈퇴 시까지</li>
                <li>② 계약 또는 청약철회 등에 관한 기록 : 5년</li>
                <li>③ 대금결제 및 재화 등의 공급에 관한 기록 : 5년</li>
                <li>④ 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년</li>
                <li>⑤ 웹사이트 방문기록 : 3개월</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 제4조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제4조 (개인정보의 제3자 제공)
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            ① 회사는 정보주체의 별도 동의가 있는 경우를 제외하고는 개인정보를
            제3자에게 제공하지 않습니다.
          </p>
        </Card>

        {/* 제5조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제5조 (개인정보의 파기절차 및 방법)
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <div>
              <p className="font-medium text-foreground mb-2">1. 파기절차</p>
              <ul className="list-none ml-4 space-y-1">
                <li>
                  ① 회원이 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져
                  내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후
                  파기됩니다.
                </li>
                <li>
                  ② 관련 법령에서 보관의무를 정한 정보는 해당 기간 경과 후에
                  파기됩니다.
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">2. 파기방법</p>
              <ul className="list-none ml-4 space-y-1">
                <li>
                  ① 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는
                  기술적 방법을 사용하여 삭제합니다.
                </li>
                <li>
                  ② 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여
                  파기합니다.
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 제6조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제6조 (이용자의 권리·의무 및 행사방법)
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <div>
              <p>
                1. 이용자는 회사에 대해 언제든지 다음 각 호의 권리를 행사할 수
                있습니다:
              </p>
              <ul className="list-none mt-2 ml-4 space-y-1">
                <li>① 개인정보 열람 요구</li>
                <li>② 오류 등이 있을 경우 정정 요구</li>
                <li>③ 삭제 요구</li>
                <li>④ 처리정지 요구</li>
              </ul>
            </div>
            <p>
              2. 제1항에 따른 권리 행사는 회사 고객센터를 통해 요청하실 수 있으며,
              회사는 이에 대해 지체없이 조치하겠습니다.
            </p>
          </div>
        </Card>

        {/* 제7조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제7조 (개인정보의 안전성 확보조치)
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고
              있습니다:
            </p>
            <ul className="list-none ml-4 space-y-1">
              <li>① 비밀번호의 암호화</li>
              <li>② 접속기록의 보관 및 위조·변조 방지를 위한 조치</li>
              <li>③ 개인정보 취급자의 최소화 및 교육</li>
              <li>④ 방화벽 구축</li>
            </ul>
          </div>
        </Card>

        {/* 제8조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제8조 (개인정보 보호책임자)
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
              처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와
              같이 개인정보 보호책임자를 지정하고 있습니다:
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="font-medium text-foreground mb-2">
                개인정보 보호책임자
              </p>
              <ul className="list-none space-y-1">
                <li>• 성명 : 이장환</li>
                <li>• 연락처 : 010-7266-0807</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 제9조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제9조 (개인정보 처리 위탁)
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              회사는 서비스 향상을 위해서 다음과 같이 개인정보를 위탁하고
              있습니다:
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <ul className="list-none space-y-1">
                <li>• 수탁업체: 토스페이먼츠 주식회사</li>
                <li>• 위탁업무: 신용카드 결제 대행</li>
                <li>• 보유기간: 계약 종료 시까지</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 부칙 */}
        <Separator className="my-8" />

        <Card className="p-6 bg-muted/50">
          <p className="text-muted-foreground">
            본 개인정보 처리방침은 2025년 12월 05일부터 적용됩니다.
          </p>
        </Card>
      </div>
    </div>
  );
}
