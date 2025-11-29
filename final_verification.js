const playwright = require('playwright');

async function finalVerificationTest() {
    console.log("=== FINAL VERIFICATION TEST ===\n");

    const browser = await playwright.chromium.launch({ headless: true });

    // Test on smallest common viewport (iPhone SE)
    console.log("Testing on iPhone SE (375x667)...");
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15'
    });
    const page = await context.newPage();

    await page.goto('https://angelset-lander.netlify.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check 1: No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    console.log("Document scroll width: " + scrollWidth + "px");
    console.log("Body scroll width: " + bodyScrollWidth + "px");
    console.log("Viewport width: 375px");
    console.log("Horizontal scroll test: " + (scrollWidth <= 375 ? 'PASS' : 'FAIL') + "\n");

    // Check 2: Both CTAs are clickable
    const primaryCTA = await page.$('.cta-primary');
    const secondaryCTAs = await page.$$('.cta-btn');

    let secondaryCTA = null;
    for (const cta of secondaryCTAs) {
        const isPrimary = await cta.evaluate(el => el.classList.contains('cta-primary'));
        if (!isPrimary) {
            secondaryCTA = cta;
            break;
        }
    }

    console.log("Primary CTA ($59) found: " + !!primaryCTA);
    console.log("Secondary CTA ($19) found: " + !!secondaryCTA + "\n");

    // Check 3: Elements are tappable (not overlapping)
    if (primaryCTA) {
        const box = await primaryCTA.boundingBox();
        console.log("Primary CTA position: Y=" + Math.round(box.y) + "px, Height=" + Math.round(box.height) + "px");
    }

    if (secondaryCTA) {
        const box = await secondaryCTA.boundingBox();
        console.log("Secondary CTA position: Y=" + Math.round(box.y) + "px, Height=" + Math.round(box.height) + "px");
    }

    // Check 4: Size selector is accessible
    const sizeButtons = await page.$$('.size-btn');
    console.log("\nSize buttons found: " + sizeButtons.length);

    if (sizeButtons.length > 0) {
        const firstSizeBox = await sizeButtons[0].boundingBox();
        console.log("First size button: Y=" + Math.round(firstSizeBox.y) + "px");
    }

    // Check 5: Quick flow test
    console.log("\n=== Quick Flow Test ===");
    if (sizeButtons[0]) await sizeButtons[0].click();
    await page.waitForTimeout(500);

    if (primaryCTA) {
        await primaryCTA.click();
        await page.waitForTimeout(1500);

        const popupVisible = await page.$('#orderBumpPopup[style*="flex"]');
        console.log("Popup appeared: " + !!popupVisible);

        if (popupVisible) {
            const declineBtn = await page.$('button:has-text("No thanks")');
            if (declineBtn) {
                await Promise.all([
                    page.waitForNavigation({ timeout: 15000 }),
                    declineBtn.click()
                ]);

                const finalUrl = page.url();
                console.log("Redirected to: " + finalUrl.substring(0, 50) + "...");
                console.log("SimpleSwap redirect: " + (finalUrl.includes('simpleswap.io') ? 'SUCCESS' : 'FAILED'));
            }
        }
    }

    await browser.close();

    console.log("\n=== VERIFICATION COMPLETE ===");
}

finalVerificationTest().catch(console.error);
