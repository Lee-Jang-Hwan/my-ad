-- 광고문구 개수를 5개로 유지 (AI 생성 5개 + 직접 입력 1개는 DB에 저장 안함)

-- 기존 CHECK 제약조건 삭제
ALTER TABLE ad_copies DROP CONSTRAINT IF EXISTS ad_copies_copy_index_check;

-- CHECK 제약조건 추가 (1-5)
ALTER TABLE ad_copies ADD CONSTRAINT ad_copies_copy_index_check CHECK (copy_index >= 1 AND copy_index <= 5);

-- 테이블 코멘트 업데이트
COMMENT ON TABLE ad_copies IS 'AI 생성 광고문구 5개 저장 및 선택 상태 관리';
COMMENT ON COLUMN ad_copies.copy_index IS '광고문구 순서 (1-5)';
