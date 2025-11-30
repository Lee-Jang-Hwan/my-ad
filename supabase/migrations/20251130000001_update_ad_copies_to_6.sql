-- 광고문구 개수를 5개에서 6개로 변경

-- 기존 CHECK 제약조건 삭제
ALTER TABLE ad_copies DROP CONSTRAINT IF EXISTS ad_copies_copy_index_check;

-- 새로운 CHECK 제약조건 추가 (1-6)
ALTER TABLE ad_copies ADD CONSTRAINT ad_copies_copy_index_check CHECK (copy_index >= 1 AND copy_index <= 6);

-- 테이블 코멘트 업데이트
COMMENT ON TABLE ad_copies IS '광고문구 6개 저장 및 선택 상태 관리';
COMMENT ON COLUMN ad_copies.copy_index IS '광고문구 순서 (1-6)';
