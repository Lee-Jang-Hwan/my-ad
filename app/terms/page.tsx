import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        삽가능 스튜디오 이용약관
      </h1>

      <div className="space-y-6">
        {/* 제1조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">제1조 (목적)</h2>
          <p className="text-muted-foreground leading-relaxed">
            본 약관은 시하린컴퍼니(이하 &quot;회사&quot;)가 제공하는 삽가능
            스튜디오(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 회사와 회원의
            권리·의무 및 책임사항을 규정하는 것을 목적으로 합니다.
          </p>
        </Card>

        {/* 제2조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제2조 (서비스 이용 계약)
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              1. 서비스 이용 계약은 회원이 본 약관에 동의하고 회사가
              승낙함으로써 체결됩니다.
            </p>
            <div>
              <p>2. 회원 가입 시 다음의 정책을 준수해야 합니다:</p>
              <ul className="list-none mt-2 ml-4 space-y-1">
                <li>① 비밀번호는 8~20자리</li>
                <li>② 영문, 숫자, 특수문자를 모두 포함</li>
                <li>③ 개인정보 보호를 위한 안전한 비밀번호 설정</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 제3조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">제3조 (크레딧 충전)</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              1. 상세 내용은 삽가능 스튜디오 웹사이트의 크레딧 충전 페이지에서
              확인할 수 있습니다.
            </p>
            <p>2. 충전 된 크레딧은 사용자간 양도·양수가 불가합니다.</p>
          </div>
        </Card>

        {/* 제4조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제4조 (청약철회 및 환불 정책)
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              1. <strong className="text-foreground">[전액 환불 조건]</strong>{" "}
              회원은 크레딧을 충전(결제)한 날로부터 7일 이내에, 충전한 크레딧을
              단 1크레딧도 사용하지 않은 경우에 한하여 청약철회(전액 환불)를
              요청할 수 있습니다.
            </p>
            <div>
              <p>
                2. <strong className="text-foreground">[환불 제한]</strong> 다음
                각 호의 어느 하나에 해당하는 경우, 전자상거래법에 따라
                청약철회가 제한되어 환불이 불가능합니다.
              </p>
              <ul className="list-none mt-2 ml-4 space-y-1">
                <li>① 결제일로부터 7일이 경과한 경우</li>
                <li>
                  ② 크레딧을 1회 이상 사용하여 서비스 이용 이력이 남은 경우
                  (디지털 콘텐츠의 제공이 개시된 것으로 간주)
                </li>
                <li>
                  ③ 회원이 실수로 크레딧을 사용하였더라도 이미 서비스가 제공된
                  경우
                </li>
              </ul>
            </div>
            <p>
              3.{" "}
              <strong className="text-foreground">[잔여 크레딧 처리]</strong>{" "}
              사용하고 남은 잔여 크레딧에 대한 부분 환불(현금 정산)은 제공되지
              않습니다. 구입한 크레딧은 서비스 내에서 소진 시까지 유효합니다.
            </p>
            <p>
              4.{" "}
              <strong className="text-foreground">
                [서비스 하자로 인한 환불]
              </strong>{" "}
              회사의 중대한 귀책 사유로 서비스를 정상적으로 이용할 수 없는 경우,
              잔여 크레딧은 전액 환불 조치합니다.
            </p>
          </div>
        </Card>

        {/* 제5조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제5조 (데이터 처리 및 보관)
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <div>
              <p className="font-medium text-foreground mb-2">
                1. 데이터 소유권 및 책임
              </p>
              <ul className="list-none ml-4 space-y-1">
                <li>
                  ① 영상 생성으로 생성 된 광고영상의 소유권은 회원에게 있습니다
                </li>
                <li>
                  ② 회원은 이미지 및 상품명의 저작권 및 불법 이용시 형사적,
                  법적 책임을 집니다
                </li>
                <li>
                  ③ 회사는 서비스 제공을 위한 기술적 지원만을 담당합니다
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">
                2. 데이터 보관 기간
              </p>
              <p className="ml-4">회원 탈퇴 시 까지</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">3. 데이터 활용</p>
              <ul className="list-none ml-4 space-y-1">
                <li>
                  • 회사는 서비스 개선 및 홍보 목적으로 회원의 광고영상을 활용할
                  수 있으며, 이 경우 개별 회원을 식별할 수 없는 형태로 처리합니다
                </li>
                <li>
                  • 회사는 회원의 동의 없이 제3자에게 광고영상 데이터를 제공하지
                  않습니다
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 제6조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            제6조 (서비스 이용 제한)
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <div>
              <p>
                1. 회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한할 수
                있습니다:
              </p>
              <ul className="list-none mt-2 ml-4 space-y-1">
                <li>① 불법적인 목적으로 서비스를 사용하는 경우</li>
                <li>
                  ② 타인의 권리를 침해하거나 도덕적 기준에 반하는 영상 생성의
                  경우
                </li>
                <li>③ 서비스의 안정적 운영을 방해하는 경우</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">2. 제한 조치</p>
              <ul className="list-none ml-4 space-y-1">
                <li>• 1차 위반: 경고</li>
                <li>• 2차 위반: 계정정지</li>
                <li>• 심각한 위반: 즉시 계정 해지 및 향후 서비스 이용 제한</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 제7조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">제7조 (회사의 의무)</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>1. 회사는 안정적인 서비스 제공을 위해 노력합니다.</p>
            <p>
              2. 회사는 회원의 개인정보를 보호하며, 관련 법령에 따라 처리합니다.
            </p>
            <p>
              3. 회사는 서비스 이용과 관련한 회원의 문의사항이나 불만사항을
              처리합니다.
            </p>
          </div>
        </Card>

        {/* 부칙 */}
        <Separator className="my-8" />

        <Card className="p-6 bg-muted/50">
          <h2 className="text-lg font-semibold mb-2">부칙</h2>
          <p className="text-muted-foreground">
            본 약관은 2025년 12월 05일부터 시행합니다.
          </p>
        </Card>
      </div>
    </div>
  );
}
