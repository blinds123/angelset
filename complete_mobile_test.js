const playwright = require('playwright');

async function comprehensiveMobileTest() {
    const results = {
        site_url: "https://angelset-lander.netlify.app",
        test_59_flow: { passed: false, redirect_url: "", error: "", details: {} },
        test_19_flow: { passed: false, redirect_url: "", error: "", details: {} },
        horizontal_scroll: { viewport: 375, scroll_width: 0, passed: false, error: "" },
        above_fold: { price_visible: false, cta_visible: false, passed: false, error: "" },
        overall_score: "0/10",
        issues: []
    };

    const browser = await playwright.chromium.launch({ headless: true });
    
    try {
        // TEST 1: $59 Flow
        console.log("\n=== TEST 1: $59 Flow (iPhone 12 - 390x844) ===");
        const context1 = await browser.newContext({
            viewport: { width: 390, height: 844 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        });
        const page1 = await context1.newPage();
        
        try {
            await page1.goto('https://angelset-lander.netlify.app', { waitUntil: 'networkidle' });
            await page1.waitForTimeout(2000);
            
            // Select size
            const firstSize = await page1.$('.size-btn');
            if (firstSize) {
                await firstSize.click();
                await page1.waitForTimeout(500);
                console.log("Size selected");
            } else {
                throw new Error("Size selector not found");
            }
            
            // Click $59 CTA
            const primaryCTA = await page1.$('.cta-primary');
            if (!primaryCTA) throw new Error("Primary CTA not found");
            
            console.log("Clicking $59 CTA...");
            await primaryCTA.click();
            await page1.waitForTimeout(2000);
            
            // Wait for popup
            const popup = await page1.waitForSelector('#orderBumpPopup[style*="flex"]', { timeout: 3000 });
            console.log("Popup appeared:", !!popup);
            results.test_59_flow.details.popup_appeared = !!popup;
            
            if (popup) {
                // Click decline button
                const declineBtn = await page1.$('button:has-text("No thanks")');
                if (!declineBtn) throw new Error("Decline button not found");
                
                console.log("Clicking decline button...");
                
                // Wait for navigation to simpleswap
                const [response] = await Promise.all([
                    page1.waitForNavigation({ timeout: 20000 }),
                    declineBtn.click()
                ]);
                
                await page1.waitForTimeout(2000);
                const finalUrl = page1.url();
                console.log("Final URL:", finalUrl);
                
                results.test_59_flow.passed = finalUrl.includes('simpleswap.io');
                results.test_59_flow.redirect_url = finalUrl;
                results.test_59_flow.details.navigation_happened = true;
            }
            
        } catch (error) {
            results.test_59_flow.error = error.message;
            results.issues.push(`$59 flow failed: ${error.message}`);
            console.error("Test 1 Error:", error.message);
        }
        await context1.close();
        
        // TEST 2: $19 Flow
        console.log("\n=== TEST 2: $19 Flow ===");
        const context2 = await browser.newContext({
            viewport: { width: 390, height: 844 }
        });
        const page2 = await context2.newPage();
        
        try {
            await page2.goto('https://angelset-lander.netlify.app', { waitUntil: 'networkidle' });
            await page2.waitForTimeout(2000);
            
            // Select size
            const firstSize = await page2.$('.size-btn');
            if (firstSize) {
                await firstSize.click();
                await page2.waitForTimeout(500);
            }
            
            // Find $19 CTA (the one that's NOT .cta-primary)
            const allCTAs = await page2.$$('.cta-btn');
            let secondaryCTA = null;
            for (const cta of allCTAs) {
                const classes = await cta.getAttribute('class');
                const text = await cta.textContent();
                if (!classes.includes('cta-primary') && text.includes('PRE-ORDER')) {
                    secondaryCTA = cta;
                    break;
                }
            }
            
            if (!secondaryCTA) throw new Error("Secondary CTA ($19) not found");
            
            console.log("Clicking $19 CTA...");
            await secondaryCTA.click();
            await page2.waitForTimeout(2000);
            
            const popup = await page2.waitForSelector('#orderBumpPopup[style*="flex"]', { timeout: 3000 });
            results.test_19_flow.details.popup_appeared = !!popup;
            
            if (popup) {
                const declineBtn = await page2.$('button:has-text("No thanks")');
                if (!declineBtn) throw new Error("Decline button not found");
                
                console.log("Clicking decline button...");
                const [response] = await Promise.all([
                    page2.waitForNavigation({ timeout: 20000 }),
                    declineBtn.click()
                ]);
                
                await page2.waitForTimeout(2000);
                const finalUrl = page2.url();
                console.log("Final URL:", finalUrl);
                
                results.test_19_flow.passed = finalUrl.includes('simpleswap.io');
                results.test_19_flow.redirect_url = finalUrl;
                results.test_19_flow.details.navigation_happened = true;
            }
            
        } catch (error) {
            results.test_19_flow.error = error.message;
            results.issues.push(`$19 flow failed: ${error.message}`);
            console.error("Test 2 Error:", error.message);
        }
        await context2.close();
        
        // TEST 3: Horizontal Scroll
        console.log("\n=== TEST 3: Horizontal Scroll Check (375x667) ===");
        const context3 = await browser.newContext({ viewport: { width: 375, height: 667 } });
        const page3 = await context3.newPage();
        
        try {
            await page3.goto('https://angelset-lander.netlify.app', { waitUntil: 'networkidle' });
            await page3.waitForTimeout(2000);
            
            const scrollWidth = await page3.evaluate(() => document.documentElement.scrollWidth);
            console.log(`Scroll Width: ${scrollWidth}px vs Viewport: 375px`);
            
            results.horizontal_scroll.scroll_width = scrollWidth;
            results.horizontal_scroll.passed = scrollWidth <= 375;
            
            if (!results.horizontal_scroll.passed) {
                results.issues.push(`Horizontal scroll: ${scrollWidth - 375}px overflow`);
            }
        } catch (error) {
            results.horizontal_scroll.error = error.message;
            console.error("Test 3 Error:", error.message);
        }
        await context3.close();
        
        // TEST 4: Above-the-Fold
        console.log("\n=== TEST 4: Above-the-Fold Check ===");
        const context4 = await browser.newContext({ viewport: { width: 390, height: 844 } });
        const page4 = await context4.newPage();
        
        try {
            await page4.goto('https://angelset-lander.netlify.app', { waitUntil: 'networkidle' });
            await page4.waitForTimeout(2000);
            
            // Check price visibility
            const priceBox = await page4.$('.price-box');
            if (priceBox) {
                const box = await priceBox.boundingBox();
                results.above_fold.price_visible = box && box.y < 844;
                console.log(`Price at Y: ${box?.y}px - Visible: ${results.above_fold.price_visible}`);
            }
            
            // Check CTA visibility
            const primaryCTA = await page4.$('.cta-primary');
            if (primaryCTA) {
                const box = await primaryCTA.boundingBox();
                results.above_fold.cta_visible = box && box.y < 844;
                console.log(`CTA at Y: ${box?.y}px - Visible: ${results.above_fold.cta_visible}`);
            }
            
            results.above_fold.passed = results.above_fold.price_visible && results.above_fold.cta_visible;
            
            if (!results.above_fold.price_visible) results.issues.push("Price not visible above fold");
            if (!results.above_fold.cta_visible) results.issues.push("CTA not visible above fold");
            
        } catch (error) {
            results.above_fold.error = error.message;
            console.error("Test 4 Error:", error.message);
        }
        await context4.close();
        
    } finally {
        await browser.close();
    }
    
    // Calculate score
    let score = 0;
    if (results.test_59_flow.passed) score += 3;
    if (results.test_19_flow.passed) score += 3;
    if (results.horizontal_scroll.passed) score += 2;
    if (results.above_fold.passed) score += 2;
    results.overall_score = `${score}/10`;
    
    console.log("\n\n=== FINAL RESULTS ===");
    console.log(JSON.stringify(results, null, 2));
    
    return results;
}

comprehensiveMobileTest().catch(console.error);
