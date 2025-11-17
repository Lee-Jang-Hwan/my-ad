/**
 * n8n 워크플로우 자동 수정 스크립트 (실제 워크플로우용)
 *
 * 실제 워크플로우 구조:
 * - 노드 이름: "Update: finish"
 * - 현재 필드: status, video_url, progress_stage (3개만 있음)
 * - 문제: video_url에 = 접두사 없음 (Fixed 모드)
 * - 해결: video_url에 = 접두사 추가 (Expression 모드로 변경)
 */

const fs = require('fs');

console.log('🔍 워크플로우 파일 읽는 중...\n');

// 파일 읽기
const inputFile = 'C:\\Users\\USER\\Desktop\\oz\\oz-edu\\base-plate\\my-ad1106\\docs\\완요.json';
const outputFile = 'C:\\Users\\USER\\Desktop\\oz\\oz-edu\\base-plate\\my-ad1106\\docs\\완요-fixed.json';

let workflow;
try {
  const fileContent = fs.readFileSync(inputFile, 'utf8');
  workflow = JSON.parse(fileContent);
  console.log('✅ 워크플로우 파일 로드 완료');
  console.log(`📄 워크플로우 이름: ${workflow.name}\n`);
} catch (error) {
  console.error('❌ 오류: JSON 파일을 파싱할 수 없습니다:', error.message);
  process.exit(1);
}

// "Update: finish" 노드 찾기
const nodes = workflow.nodes || [];
console.log(`📊 총 노드 개수: ${nodes.length}\n`);

const targetNode = nodes.find(node => node.name === 'Update: finish');

if (!targetNode) {
  console.error('❌ 오류: "Update: finish" 노드를 찾을 수 없습니다.');
  process.exit(1);
}

console.log('✅ 타겟 노드 발견: "Update: finish"');
console.log(`   타입: ${targetNode.type}`);
console.log(`   ID: ${targetNode.id}\n`);

// 필드 설정 확인
const fieldsToSet = targetNode.parameters?.fieldsUi?.fieldValues || [];
console.log(`📋 현재 필드 개수: ${fieldsToSet.length}\n`);

console.log('🔍 현재 필드 상태:\n');
fieldsToSet.forEach((field, index) => {
  const fieldName = field.fieldId;
  const currentValue = field.fieldValue;
  const hasExpressionPrefix = currentValue?.toString().startsWith('=');

  console.log(`${index + 1}. ${fieldName}:`);
  console.log(`   값: ${currentValue}`);
  console.log(`   모드: ${hasExpressionPrefix ? '✅ Expression' : '❌ Fixed'}`);
  console.log('');
});

// video_url 필드 수정
console.log('🔧 필드 수정 시작...\n');

let modified = false;

fieldsToSet.forEach((field, index) => {
  if (field.fieldId === 'video_url') {
    const currentValue = field.fieldValue;

    // = 접두사가 없으면 추가
    if (!currentValue.startsWith('=')) {
      console.log('🔄 video_url 필드 수정:');
      console.log(`   이전: ${currentValue}`);

      // = 접두사 추가
      fieldsToSet[index].fieldValue = `=${currentValue}`;

      console.log(`   이후: ${fieldsToSet[index].fieldValue}`);
      console.log('   모드: Fixed → Expression ✅\n');

      modified = true;
    } else {
      console.log('✅ video_url: 이미 Expression 모드 (변경 없음)\n');
    }
  }
});

if (!modified) {
  console.log('✨ 이미 모든 설정이 올바릅니다! 수정이 필요하지 않습니다.');
  process.exit(0);
}

// 수정된 워크플로우 저장
try {
  fs.writeFileSync(outputFile, JSON.stringify(workflow, null, 2), 'utf8');
  console.log(`✅ 수정된 워크플로우 저장 완료: ${outputFile}\n`);
} catch (error) {
  console.error('❌ 오류: 파일 저장 실패:', error.message);
  process.exit(1);
}

console.log('📊 수정 결과 요약:\n');
console.log('수정된 필드:');
console.log('  - video_url: Fixed 모드 → Expression 모드 ✅\n');

console.log('유지된 필드:');
console.log('  - status: Expression 모드 (변경 없음)');
console.log('  - progress_stage: Expression 모드 (변경 없음)\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('🎉 완료! 다음 단계:\n');
console.log('1. n8n 대시보드 접속');
console.log('2. 좌측 메뉴에서 "Workflows" 클릭');
console.log('3. "Import from File" 클릭');
console.log('4. "완요-fixed.json" 파일 선택');
console.log('5. "Update existing" 선택 (기존 워크플로우 업데이트)');
console.log('6. "Import" 클릭');
console.log('7. 워크플로우 활성화');
console.log('8. 새 영상 생성 테스트\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');