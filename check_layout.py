from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    # 스토리보드 목록 페이지
    print("스토리보드 목록 페이지로 이동...")
    page.goto('http://localhost:3000/storyboard')
    page.wait_for_load_state('networkidle')
    time.sleep(3)

    page.screenshot(path='C:/Users/USER/Desktop/oz/oz-edu/base-plate/my-ad1106/screenshot_list.png')
    print("스토리보드 목록 스크린샷 저장 완료")

    # 첫 번째 스토리보드 링크 찾기
    links = page.locator('a[href^="/storyboard/"]').all()
    print(f"발견된 스토리보드 링크 수: {len(links)}")

    if len(links) > 0:
        # 첫 번째 스토리보드로 이동
        href = links[0].get_attribute('href')
        print(f"첫 번째 스토리보드: {href}")
        page.goto(f'http://localhost:3000{href}')
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        page.screenshot(path='C:/Users/USER/Desktop/oz/oz-edu/base-plate/my-ad1106/screenshot_editor.png')
        print("에디터 스크린샷 저장 완료")

        # 씬 아이템들 찾기 (좌측 패널의 씬 목록)
        scene_items = page.locator('div.cursor-pointer.rounded-lg').all()
        print(f"발견된 씬 수: {len(scene_items)}")

        # 우측 패널의 너비 측정
        main_panel = page.locator('main').first

        for i in range(min(3, len(scene_items))):
            print(f"\n씬 {i+1} 클릭...")
            scene_items = page.locator('div.cursor-pointer.rounded-lg').all()
            if i < len(scene_items):
                scene_items[i].click()
                time.sleep(1)

                # main 패널의 실제 너비 측정
                main_box = main_panel.bounding_box()
                if main_box:
                    print(f"  씬 {i+1} - main 패널 너비: {main_box['width']}px, 높이: {main_box['height']}px")

                # 미리보기 카드 너비 측정
                preview_cards = page.locator('div[style*="grid-template-columns"]').first
                if preview_cards:
                    card_box = preview_cards.bounding_box()
                    if card_box:
                        print(f"  씬 {i+1} - 미리보기 그리드 너비: {card_box['width']}px")

                page.screenshot(path=f'C:/Users/USER/Desktop/oz/oz-edu/base-plate/my-ad1106/screenshot_scene_{i+1}.png')
                print(f"  씬 {i+1} 스크린샷 저장 완료")
    else:
        print("스토리보드가 없습니다")

    browser.close()
    print("\n테스트 완료!")
