const playwright = require('playwright');

async function debugCTAs() {
    const browser = await playwright.chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const page = await context.newPage();
    
    await page.goto('https://angelset-lander.netlify.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Get all interactive elements
    console.log("\n=== ALL BUTTONS ===");
    const buttons = await page.$$('button, a');
    for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        const tag = await buttons[i].evaluate(el => el.tagName);
        const href = await buttons[i].evaluate(el => el.href || '');
        const classes = await buttons[i].evaluate(el => el.className);
        console.log(`${i}: [${tag}] "${text?.trim()}" | href: ${href} | classes: ${classes}`);
    }
    
    // Check for size selector
    console.log("\n=== SIZE SELECTORS ===");
    const sizes = await page.$$('.size-option, [class*="size"], input[type="radio"]');
    console.log(`Found ${sizes.length} size selectors`);
    
    // Click first size
    if (sizes.length > 0) {
        await sizes[0].click();
        await page.waitForTimeout(1000);
        console.log("Clicked first size");
    }
    
    // Look for CTAs with specific text
    console.log("\n=== SEARCHING FOR CTAs ===");
    const allText = await page.content();
    console.log("Page contains 'GET MINE NOW':", allText.includes('GET MINE NOW'));
    console.log("Page contains 'PRE-ORDER':", allText.includes('PRE-ORDER'));
    console.log("Page contains '$59':", allText.includes('$59'));
    console.log("Page contains '$19':", allText.includes('$19'));
    
    // Take screenshot
    await page.screenshot({ path: 'mobile_debug.png', fullPage: true });
    console.log("\nScreenshot saved to mobile_debug.png");
    
    await browser.close();
}

debugCTAs().catch(console.error);
