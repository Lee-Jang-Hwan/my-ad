/**
 * n8n 워크플로우 수정 스크립트 - 실제 문제 해결
 *
 * 문제: 표현식에서 잘못된 노드 이름 참조
 * - 실제 노드 이름: "응답 처리 Code"
 * - 표현식에서 참조: "응답 처리" ❌
 * - 결과: 노드를 찾을 수 없어 표현식이 문자열로 저장됨
 *
 * 해결: 표현식 수정
 * - 이전: {{ $('응답 처리').item.json.publicUrl }}
 * - 이후: {{ $('응답 처리 Code').item.json.publicUrl }}
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
console.log(`   타입: ${targetNode.type}\n`);

// 필드 설정 확인
const fieldsToSet = targetNode.parameters?.fieldsUi?.fieldValues || [];
console.log(`📋 현재 필드 개수: ${fieldsToSet.length}\n`);

console.log('🔍 현재 필드 상태:\n');
fieldsToSet.forEach((field, index) => {
  const fieldName = field.fieldId;
  const currentValue = field.fieldValue;

  console.log(`${index + 1}. ${fieldName}:`);
  console.log(`   값: ${currentValue}`);

  // video_url인 경우 노드 참조 확인
  if (fieldName === 'video_url') {
    if (currentValue.includes("$('응답 처리')")) {
      console.log(`   ❌ 문제: 잘못된 노드 이름 참조 ("응답 처리")`);
      console.log(`   ✅ 올바른 노드 이름: "응답 처리 Code"`);
    }
  }
  console.log('');
});

// video_url 필드 수정
console.log('🔧 필드 수정 시작...\n');

let modified = false;

fieldsToSet.forEach((field, index) => {
  if (field.fieldId === 'video_url') {
    const currentValue = field.fieldValue;

    // 잘못된 노드 이름 참조 수정
    if (currentValue.includes("$('응답 처리')")) {
      console.log('🔄 video_url 필드 수정:');
      console.log(`   이전: ${currentValue}`);

      // 노드 이름 수정
      const newValue = currentValue.replace(
        "응답 처리')",
        "응답 처리 Code')"
      );
      fieldsToSet[index].fieldValue = newValue;

      console.log(`   이후: ${fieldsToSet[index].fieldValue}`);
      console.log('   ✅ 올바른 노드 이름으로 수정 완료\n');

      modified = true;
    } else {
      console.log('✅ video_url: 이미 올바른 노드 이름 참조 (변경 없음)\n');
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
  console.log(`✅ 수정된 워크플로우 저장 완료: 완요-fixed.json\n`);
} catch (error) {
  console.error('❌ 오류: 파일 저장 실패:', error.message);
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📊 수정 내용:\n');
console.log('필드: video_url');
console.log('이전: {{ $(\'응답 처리\').item.json.publicUrl }}');
console.log('이후: {{ $(\'응답 처리 Code\').item.json.publicUrl }}');
console.log('\n변경 사항: 올바른 노드 이름으로 수정 ✅\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎉 완료! 다음 단계:\n');
console.log('1. n8n 대시보드 접속');
console.log('2. 좌측 메뉴에서 "Workflows" 클릭');
console.log('3. 우측 상단 "Import from File" 클릭');
console.log('4. "docs/완요-fixed.json" 파일 선택');
console.log('5. "Update existing" 선택 (기존 워크플로우 업데이트)');
console.log('6. "Import" 클릭');
console.log('7. 워크플로우가 활성화되어 있는지 확인');
console.log('8. 웹에서 새 영상 생성 테스트\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ 이제 앞으로 생성되는 영상은 자동으로 올바른 URL로 저장됩니다!');