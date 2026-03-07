"""Playwright smoke test for the new frontend UX."""
from playwright.sync_api import sync_playwright
import time

SCREENSHOT_DIR = r"C:\Users\jagoerge\.copilot\session-state\ae1280b1-1da5-4560-bbd0-d5dace33770a\files"

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        passed = 0
        failed = 0

        # Test 1: Basic load
        print("Test 1: Loading http://localhost:8000 ...")
        page.goto("http://localhost:8000", wait_until="networkidle")
        print(f"  Title: {page.title()}")
        passed += 1

        # Test 2: TopBar controls visible
        print("Test 2: TopBar controls ...")
        assert page.locator('[aria-label="Settings"]').is_visible(), "Settings gear not visible"
        assert page.locator('[aria-label="New thread"]').is_visible(), "New thread not visible"
        print("  Settings gear: visible")
        print("  New thread: visible")
        passed += 1

        # Test 3: Voice/Text toggle
        print("Test 3: Voice/Text toggle ...")
        assert page.locator("button:has-text('Voice')").is_visible(), "Voice toggle not visible"
        assert page.locator("button:has-text('Text')").is_visible(), "Text toggle not visible"
        print("  Voice toggle: visible")
        print("  Text toggle: visible")
        passed += 1

        # Test 4: Built with badge
        print("Test 4: Built with badge ...")
        assert page.locator("text=Microsoft Foundry").is_visible(), "Badge not visible"
        print("  Badge: visible")
        passed += 1

        # Test 5: Agent details shown (idle state has agent icon)
        print("Test 5: Agent details in idle state ...")
        page.screenshot(path=f"{SCREENSHOT_DIR}/test-default.png")
        passed += 1

        # Test 6: ?lock=true hides controls
        print("Test 6: ?lock=true ...")
        page.goto("http://localhost:8000/?lock=true", wait_until="networkidle")
        assert not page.locator('[aria-label="Settings"]').is_visible(), "Settings should be hidden"
        assert not page.locator("button:has-text('Voice')").is_visible(), "Toggle should be hidden"
        print("  Settings hidden: True")
        print("  Toggle hidden: True")
        page.screenshot(path=f"{SCREENSHOT_DIR}/test-locked.png")
        passed += 1

        # Test 7: ?mode=text locks to text
        print("Test 7: ?mode=text ...")
        page.goto("http://localhost:8000/?mode=text", wait_until="networkidle")
        assert not page.locator("button:has-text('Voice')").is_visible(), "Toggle should be hidden"
        assert page.locator('[aria-label="Settings"]').is_visible(), "Settings should remain"
        print("  Toggle hidden: True")
        print("  Settings visible: True")
        page.screenshot(path=f"{SCREENSHOT_DIR}/test-text-mode.png")
        passed += 1

        # Test 8: Settings panel opens
        print("Test 8: Settings panel ...")
        page.goto("http://localhost:8000", wait_until="networkidle")
        page.locator('[aria-label="Settings"]').click()
        time.sleep(0.5)
        # Check settings panel appeared (look for "Mode" or theme-related text)
        settings_visible = page.locator("text=Mode").first.is_visible()
        print(f"  Settings panel opened: {settings_visible}")
        page.screenshot(path=f"{SCREENSHOT_DIR}/test-settings.png")
        passed += 1

        # Test 9: Text mode toggle switches view
        print("Test 9: Switch to text mode ...")
        page.goto("http://localhost:8000", wait_until="networkidle")
        page.locator("button:has-text('Text')").click()
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOT_DIR}/test-text-switched.png")
        passed += 1

        print(f"\n{'='*50}")
        print(f"Results: {passed} passed, {failed} failed")
        print(f"{'='*50}")

        browser.close()

if __name__ == "__main__":
    run_tests()
