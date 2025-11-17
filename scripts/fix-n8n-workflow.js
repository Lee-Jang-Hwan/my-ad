/**
 * n8n 워크플로우 자동 수정 스크립트
 *
 * 사용 방법:
 * 1. n8n에서 워크플로우를 JSON으로 다운로드
 * 2. 다운로드한 파일을 이 스크립트와 같은 폴더에 복사
 * 3. node fix-n8n-workflow.js <workflow-file.json>
 * 4. 생성된 <workflow-file>-fixed.json을 n8n에 업로드
 */

const fs = require('fs');
const path = require('path');

// 명령줄 인자에서 파일 경로 가져오기
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ 오류: 워크플로우 JSON 파일을 지정해주세요.');
  console.log('\n사용법:');
  console.log('  node fix-n8n-workflow.js <workflow-file.json>');
  console.log('\n예시:');
  console.log('  node fix-n8n-workflow.js my-workflow.json');
  process.exit(1);
}

const inputFile = args[0];

// 파일 존재 확인
if (!fs.existsSync(inputFile)) {
  console.error(`❌ 오류: 파일을 찾을 수 없습니다: ${inputFile}`);
  process.exit(1);
}

console.log('🔍 워크플로우 파일 읽는 중...');

// JSON 파일 읽기
let workflow;
try {
  const fileContent = fs.readFileSync(inputFile, 'utf8');
  workflow = JSON.parse(fileContent);
} catch (error) {
  console.error('❌ 오류: JSON 파일을 파싱할 수 없습니다:', error.message);
  process.exit(1);
}

console.log('✅ 워크플로우 파일 로드 완료');
console.log(`📄 워크플로우 이름: ${workflow.name || '(이름 없음)'}`);

// 노드 찾기
const nodes = workflow.nodes || [];
console.log(`📊 총 노드 개수: ${nodes.length}`);

// "최종 업데이트: Completed" 또는 유사한 Supabase Update 노드 찾기
const targetNodeNames = [
  '최종 업데이트: Completed',
  '최종 업데이트',
  'Update Completed',
  'Supabase Update',
];

let targetNode = null;
let targetNodeIndex = -1;

// 노드 이름으로 찾기
for (let i = 0; i < nodes.length; i++) {
  const node = nodes[i];
  if (targetNodeNames.some(name => node.name?.includes(name))) {
    targetNode = node;
    targetNodeIndex = i;
    break;
  }
}

// 못 찾았으면 Supabase 타입의 Update 작업 노드 찾기
if (!targetNode) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (
      node.type?.toLowerCase().includes('supabase') &&
      node.parameters?.operation === 'update'
    ) {
      targetNode = node;
      targetNodeIndex = i;
      break;
    }
  }
}

if (!targetNode) {
  console.error('❌ 오류: "최종 업데이트: Completed" 노드를 찾을 수 없습니다.');
  console.log('\n💡 Tip: Supabase Update 노드의 이름을 확인해주세요.');
  console.log('   노드 이름에 다음 중 하나가 포함되어야 합니다:');
  targetNodeNames.forEach(name => console.log(`   - ${name}`));
  process.exit(1);
}

console.log(`\n✅ 타겟 노드 발견: "${targetNode.name}"`);
console.log(`   타입: ${targetNode.type}`);
console.log(`   위치: 노드 #${targetNodeIndex + 1}`);

// 필드 설정 확인
const fieldsToSet = targetNode.parameters?.fieldsUi?.fieldValues || [];
console.log(`\n📋 현재 필드 개수: ${fieldsToSet.length}`);

// 수정해야 할 필드 목록
const expressionFields = [
  'video_url',
  'thumbnail_url',
  'duration',
  'file_size',
  'completed_at',
];

let modifiedCount = 0;
let alreadyCorrect = 0;

console.log('\n🔧 필드 수정 중...\n');

fieldsToSet.forEach((field, index) => {
  const fieldName = field.fieldId;
  const currentValue = field.fieldValue;

  // Expression 필드인지 확인
  if (expressionFields.includes(fieldName)) {
    // 이미 표현식 모드인지 확인
    const isExpression = typeof currentValue === 'string' && currentValue.startsWith('=');

    if (isExpression) {
      console.log(`✅ ${fieldName}: 이미 Expression 모드 (변경 없음)`);
      alreadyCorrect++;
    } else {
      // Fixed 모드 → Expression 모드로 변경
      const originalValue = currentValue;

      // 값이 문자열이고 ={{ 로 시작하면 앞의 = 제거
      if (typeof currentValue === 'string' && currentValue.startsWith('={{')) {
        fieldsToSet[index].fieldValue = currentValue; // 이미 올바른 형식
      } else if (typeof currentValue === 'string') {
        // = 접두사 추가하여 Expression 모드로 변경
        fieldsToSet[index].fieldValue = `=${currentValue}`;
      }

      console.log(`🔄 ${fieldName}: Fixed 모드 → Expression 모드`);
      console.log(`   이전: ${originalValue}`);
      console.log(`   이후: ${fieldsToSet[index].fieldValue}`);
      modifiedCount++;
    }
  } else {
    // Expression 필드가 아니면 건드리지 않음
    console.log(`⏭️  ${fieldName}: Fixed 모드 유지 (변경 없음)`);
  }
});

console.log(`\n📊 수정 결과:`);
console.log(`   ✅ 이미 올바른 필드: ${alreadyCorrect}개`);
console.log(`   🔄 수정된 필드: ${modifiedCount}개`);
console.log(`   ⏭️  유지된 필드: ${fieldsToSet.length - alreadyCorrect - modifiedCount}개`);

if (modifiedCount === 0) {
  console.log('\n✨ 이미 모든 설정이 올바릅니다! 수정이 필요하지 않습니다.');
  process.exit(0);
}

// 수정된 워크플로우 저장
const outputFile = inputFile.replace(/\.json$/, '-fixed.json');

try {
  fs.writeFileSync(outputFile, JSON.stringify(workflow, null, 2), 'utf8');
  console.log(`\n✅ 수정된 워크플로우 저장 완료: ${outputFile}`);
} catch (error) {
  console.error('❌ 오류: 파일 저장 실패:', error.message);
  process.exit(1);
}

console.log('\n🎉 완료! 다음 단계:');
console.log('1. n8n 대시보드에서 워크플로우 메뉴 열기');
console.log('2. "Import from File" 클릭');
console.log(`3. "${outputFile}" 파일 선택`);
console.log('4. 기존 워크플로우를 덮어쓰기 또는 새로운 워크플로우로 생성');
console.log('5. 워크플로우 활성화 후 테스트');
console.log('\n💡 Tip: 기존 워크플로우를 백업하는 것을 권장합니다!');