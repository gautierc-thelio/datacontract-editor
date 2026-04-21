import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            print("Connecting...")
            await page.goto('http://localhost:5173', wait_until='networkidle', timeout=30000)

            # Check for error message or successful load
            title = await page.title()
            print(f"Page title: {title}")

            # Check if any errors are displayed in the console
            await page.wait_for_selector('text=Data Contract Editor', timeout=10000)
            print("Successfully loaded Data Contract Editor!")

        except Exception as e:
            print(f"Failed to load: {e}")
            await page.screenshot(path='error_after_fix.png')
        finally:
            await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
