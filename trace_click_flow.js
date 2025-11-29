const playwright = require('playwright');

async function traceClickFlow() {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    
    // Listen for console logs
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    
    await page.goto('https://angelset-lander.netlify.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log("\n=== TEST: Clicking $59 CTA ===");
    
    // Click size first
    const sizeBtn = await page.$('.size-btn');
    if (sizeBtn) {
        await sizeBtn.click();
        console.log("Size selected");
        await page.waitForTimeout(500);
    }
    
    // Get the $59 button
    const cta59 = await page.$('.cta-primary');
    if (!cta59) {
        console.log("ERROR: $59 CTA not found");
        await browser.close();
        return;
    }
    
    // Check onclick handler
    const hasOnclick = await cta59.evaluate(el => {
        return {
            onclick: el.onclick ? el.onclick.toString() : null,
            href: el.href || null,
            hasEventListener: el.addEventListener ? 'yes' : 'no'
        };
    });
    console.log("Button properties:", JSON.stringify(hasOnclick, null, 2));
    
    // Setup navigation promise
    const navigationPromise = page.waitForNavigation({ timeout: 10000 }).catch(() => null);
    
    // Click button
    console.log("Clicking $59 CTA...");
    await cta59.click();
    
    // Wait for navigation or timeout
    await Promise.race([
        navigationPromise,
        page.waitForTimeout(5000)
    ]);
    
    console.log("Current URL after click:", page.url());
    
    // Check if popup appeared
    const popup = await page.$('.popup-overlay, [style*="display: block"]');
    console.log("Popup visible:", popup !== null);
    
    if (popup) {
        console.log("\nPopup appeared - checking for decline button");
        const declineBtn = await page.$('button:has-text("No thanks")');
        if (declineBtn) {
            console.log("Found decline button, clicking...");
            const navPromise2 = page.waitForNavigation({ timeout: 10000 }).catch(() => null);
            await declineBtn.click();
            await Promise.race([navPromise2, page.waitForTimeout(3000)]);
            console.log("Final URL after decline:", page.url());
        }
    }
    
    await page.screenshot({ path: 'after_click.png' });
    console.log("\nScreenshot saved: after_click.png");
    
    await browser.close();
}

traceClickFlow().catch(console.error);
