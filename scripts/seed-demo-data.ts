/**
 * 데모용 샘플 데이터 생성 스크립트 (TypeScript)
 *
 * 사용법:
 * 1. 환경변수 설정: .env 파일에 SUPABASE_SERVICE_ROLE_KEY 필요
 * 2. 실행: pnpm tsx scripts/seed-demo-data.ts
 *
 * 기능:
 * - public/videos/ 폴더의 샘플 영상을 참조하는 데모 데이터 생성
 * - 완성된 영상 6개 (step1~step6-sample.mp4)
 * - 진행 중인 영상 2개
 * - 실패한 영상 1개
 */

import { createClient } from '@supabase/supabase-js';

// 환경변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

// Service Role 클라이언트 생성 (RLS 우회)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface DemoUser {
  clerk_id: string;
  name: string;
  created_at: string;
}

interface DemoImage {
  id: string;
  user_id: string;
  image_url: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DemoInfo {
  id: string;
  user_id: string;
  product_name: string;
  description: string;
  category: string;
  created_at: string;
}

interface DemoVideo {
  id: string;
  user_id: string;
  product_image_id: string;
  product_info_id: string;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  file_size: number | null;
  status: string;
  progress_stage: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

async function seedDemoData() {
  console.log('🚀 데모 샘플 데이터 생성 시작...\n');

  try {
    // 1. 데모 사용자 생성
    console.log('1️⃣ 데모 사용자 생성 중...');
    const demoUsers: DemoUser[] = [
      {
        clerk_id: 'user_demo_001',
        name: '데모 사용자 1',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        clerk_id: 'user_demo_002',
        name: '데모 사용자 2',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        clerk_id: 'user_demo_003',
        name: '데모 사용자 3',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const { error: usersError } = await supabase
      .from('users')
      .upsert(demoUsers, { onConflict: 'clerk_id' });

    if (usersError) {
      console.error('❌ 사용자 생성 실패:', usersError);
      throw usersError;
    }
    console.log('✅ 데모 사용자 3명 생성 완료\n');

    // 2. 샘플 이미지 메타데이터 생성
    console.log('2️⃣ 샘플 이미지 메타데이터 생성 중...');
    const demoImages: DemoImage[] = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        user_id: 'user_demo_001',
        image_url: 'demo/images/sample1.jpg',
        original_filename: 'product-sample-1.jpg',
        file_size: 2500000,
        mime_type: 'image/jpeg',
        status: 'completed',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        user_id: 'user_demo_001',
        image_url: 'demo/images/sample2.jpg',
        original_filename: 'product-sample-2.jpg',
        file_size: 2800000,
        mime_type: 'image/jpeg',
        status: 'completed',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        user_id: 'user_demo_002',
        image_url: 'demo/images/sample3.jpg',
        original_filename: 'product-sample-3.jpg',
        file_size: 2300000,
        mime_type: 'image/jpeg',
        status: 'completed',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        user_id: 'user_demo_002',
        image_url: 'demo/images/sample4.jpg',
        original_filename: 'product-sample-4.jpg',
        file_size: 2600000,
        mime_type: 'image/jpeg',
        status: 'completed',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        user_id: 'user_demo_003',
        image_url: 'demo/images/sample5.jpg',
        original_filename: 'product-sample-5.jpg',
        file_size: 2700000,
        mime_type: 'image/jpeg',
        status: 'completed',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        user_id: 'user_demo_003',
        image_url: 'demo/images/sample6.jpg',
        original_filename: 'product-sample-6.jpg',
        file_size: 2400000,
        mime_type: 'image/jpeg',
        status: 'completed',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
      },
      // 진행 중 & 실패 케이스
      {
        id: '77777777-7777-7777-7777-777777777777',
        user_id: 'user_demo_001',
        image_url: 'demo/images/processing1.jpg',
        original_filename: 'processing-1.jpg',
        file_size: 2100000,
        mime_type: 'image/jpeg',
        status: 'processing',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        user_id: 'user_demo_002',
        image_url: 'demo/images/processing2.jpg',
        original_filename: 'processing-2.jpg',
        file_size: 2200000,
        mime_type: 'image/jpeg',
        status: 'processing',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: '99999999-9999-9999-9999-999999999999',
        user_id: 'user_demo_003',
        image_url: 'demo/images/failed1.jpg',
        original_filename: 'failed-1.jpg',
        file_size: 2000000,
        mime_type: 'image/jpeg',
        status: 'failed',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const { error: imagesError } = await supabase
      .from('product_images')
      .upsert(demoImages, { onConflict: 'id' });

    if (imagesError) {
      console.error('❌ 이미지 생성 실패:', imagesError);
      throw imagesError;
    }
    console.log('✅ 샘플 이미지 9개 생성 완료\n');

    // 3. 상품 정보 생성
    console.log('3️⃣ 상품 정보 생성 중...');
    const demoInfos: DemoInfo[] = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        user_id: 'user_demo_001',
        product_name: '프리미엄 제품 샘플 1',
        description: 'AI로 생성된 고품질 홍보영상 샘플입니다',
        category: '데모/샘플',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        user_id: 'user_demo_001',
        product_name: '프리미엄 제품 샘플 2',
        description: 'AI로 생성된 고품질 홍보영상 샘플입니다',
        category: '데모/샘플',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        user_id: 'user_demo_002',
        product_name: '프리미엄 제품 샘플 3',
        description: 'AI로 생성된 고품질 홍보영상 샘플입니다',
        category: '데모/샘플',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        user_id: 'user_demo_002',
        product_name: '프리미엄 제품 샘플 4',
        description: 'AI로 생성된 고품질 홍보영상 샘플입니다',
        category: '데모/샘플',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        user_id: 'user_demo_003',
        product_name: '프리미엄 제품 샘플 5',
        description: 'AI로 생성된 고품질 홍보영상 샘플입니다',
        category: '데모/샘플',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        user_id: 'user_demo_003',
        product_name: '프리미엄 제품 샘플 6',
        description: 'AI로 생성된 고품질 홍보영상 샘플입니다',
        category: '데모/샘플',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'gggggggg-gggg-gggg-gggg-gggggggggggg',
        user_id: 'user_demo_001',
        product_name: '처리 중인 제품 1',
        description: '현재 AI 영상 생성 중입니다',
        category: '데모/진행중',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
        user_id: 'user_demo_002',
        product_name: '처리 중인 제품 2',
        description: '현재 AI 영상 생성 중입니다',
        category: '데모/진행중',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
        user_id: 'user_demo_003',
        product_name: '실패한 제품 1',
        description: '영상 생성 중 오류가 발생했습니다',
        category: '데모/실패',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const { error: infosError } = await supabase
      .from('product_info')
      .upsert(demoInfos, { onConflict: 'id' });

    if (infosError) {
      console.error('❌ 상품 정보 생성 실패:', infosError);
      throw infosError;
    }
    console.log('✅ 상품 정보 9개 생성 완료\n');

    // 4. 완성된 영상 데이터 생성
    console.log('4️⃣ 영상 데이터 생성 중...');
    const demoVideos: DemoVideo[] = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        user_id: 'user_demo_001',
        product_image_id: '11111111-1111-1111-1111-111111111111',
        product_info_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        video_url: '/videos/step1-sample.mp4',
        thumbnail_url: null,
        duration: 15,
        file_size: 5242880,
        status: 'completed',
        progress_stage: 'completed',
        error_message: null,
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 55 * 60 * 1000).toISOString(),
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        user_id: 'user_demo_001',
        product_image_id: '22222222-2222-2222-2222-222222222222',
        product_info_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        video_url: '/videos/step2-sample.mp4',
        thumbnail_url: null,
        duration: 15,
        file_size: 5242880,
        status: 'completed',
        progress_stage: 'completed',
        error_message: null,
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000 - 55 * 60 * 1000).toISOString(),
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        user_id: 'user_demo_002',
        product_image_id: '33333333-3333-3333-3333-333333333333',
        product_info_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        video_url: '/videos/step3-sample.mp4',
        thumbnail_url: null,
        duration: 15,
        file_size: 5242880,
        status: 'completed',
        progress_stage: 'completed',
        error_message: null,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000 - 55 * 60 * 1000).toISOString(),
      },
      {
        id: '10000000-0000-0000-0000-000000000004',
        user_id: 'user_demo_002',
        product_image_id: '44444444-4444-4444-4444-444444444444',
        product_info_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        video_url: '/videos/step4-sample.mp4',
        thumbnail_url: null,
        duration: 15,
        file_size: 5242880,
        status: 'completed',
        progress_stage: 'completed',
        error_message: null,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 11 * 60 * 60 * 1000 - 55 * 60 * 1000).toISOString(),
      },
      {
        id: '10000000-0000-0000-0000-000000000005',
        user_id: 'user_demo_003',
        product_image_id: '55555555-5555-5555-5555-555555555555',
        product_info_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        video_url: '/videos/step5-sample.mp4',
        thumbnail_url: null,
        duration: 15,
        file_size: 5242880,
        status: 'completed',
        progress_stage: 'completed',
        error_message: null,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 9 * 60 * 60 * 1000 - 55 * 60 * 1000).toISOString(),
      },
      {
        id: '10000000-0000-0000-0000-000000000006',
        user_id: 'user_demo_003',
        product_image_id: '66666666-6666-6666-6666-666666666666',
        product_info_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        video_url: '/videos/step6-sample.mp4',
        thumbnail_url: null,
        duration: 15,
        file_size: 5242880,
        status: 'completed',
        progress_stage: 'completed',
        error_message: null,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000 - 55 * 60 * 1000).toISOString(),
      },
      // 진행 중인 영상들
      {
        id: '10000000-0000-0000-0000-000000000007',
        user_id: 'user_demo_001',
        product_image_id: '77777777-7777-7777-7777-777777777777',
        product_info_id: 'gggggggg-gggg-gggg-gggg-gggggggggggg',
        video_url: null,
        thumbnail_url: null,
        duration: null,
        file_size: null,
        status: 'processing',
        progress_stage: 'ad_copy_generation',
        error_message: null,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        completed_at: null,
      },
      {
        id: '10000000-0000-0000-0000-000000000008',
        user_id: 'user_demo_002',
        product_image_id: '88888888-8888-8888-8888-888888888888',
        product_info_id: 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
        video_url: null,
        thumbnail_url: null,
        duration: null,
        file_size: null,
        status: 'processing',
        progress_stage: 'video_generation',
        error_message: null,
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        completed_at: null,
      },
      // 실패한 영상
      {
        id: '10000000-0000-0000-0000-000000000009',
        user_id: 'user_demo_003',
        product_image_id: '99999999-9999-9999-9999-999999999999',
        product_info_id: 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
        video_url: null,
        thumbnail_url: null,
        duration: null,
        file_size: null,
        status: 'failed',
        progress_stage: 'video_generation',
        error_message: 'Veo 3.1 API 타임아웃: 영상 생성 중 연결이 끊어졌습니다. 다시 시도해주세요.',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completed_at: null,
      },
    ];

    const { error: videosError } = await supabase
      .from('ad_videos')
      .upsert(demoVideos, { onConflict: 'id' });

    if (videosError) {
      console.error('❌ 영상 데이터 생성 실패:', videosError);
      throw videosError;
    }
    console.log('✅ 영상 데이터 9개 생성 완료\n');

    // 5. 확인 쿼리
    console.log('5️⃣ 생성된 데이터 확인 중...');
    const { data: videos, error: checkError } = await supabase
      .from('ad_videos')
      .select(`
        id,
        user_id,
        video_url,
        status,
        progress_stage,
        created_at,
        product_info:product_info_id (
          product_name
        )
      `)
      .like('user_id', 'user_demo%')
      .order('created_at', { ascending: false });

    if (checkError) {
      console.error('❌ 확인 쿼리 실패:', checkError);
    } else {
      console.log('\n📊 생성된 데모 영상 목록:');
      console.table(videos?.map(v => ({
        user_id: v.user_id,
        product_name: (v.product_info as any)?.product_name,
        video_url: v.video_url || '(생성 중)',
        status: v.status,
        progress_stage: v.progress_stage,
      })));
    }

    console.log('\n✅ 데모 샘플 데이터 생성 완료!');
    console.log('\n📝 확인 방법:');
    console.log('  1. 홈페이지: http://localhost:3000 - 샘플 영상 섹션');
    console.log('  2. 대시보드: http://localhost:3000/dashboard (데모 계정으로 로그인 필요)');
    console.log('  3. Supabase Dashboard에서 테이블 확인');
    console.log('\n🎬 샘플 영상 파일:');
    console.log('  - /videos/step1-sample.mp4');
    console.log('  - /videos/step2-sample.mp4');
    console.log('  - /videos/step3-sample.mp4');
    console.log('  - /videos/step4-sample.mp4');
    console.log('  - /videos/step5-sample.mp4');
    console.log('  - /videos/step6-sample.mp4');

  } catch (error) {
    console.error('\n❌ 데모 데이터 생성 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
seedDemoData();