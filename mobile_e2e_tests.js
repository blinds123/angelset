const playwright = require('playwright');

async function runMobileTests() {
    const results = {
        site_url: "https://angelset-lander.netlify.app",
        test_59_flow: { passed: false, redirect_url: "", error: "" },
        test_19_flow: { passed: false, redirect_url: "", error: "" },
        horizontal_scroll: { viewport: 375, scroll_width: 0, passed: false, error: "" },
        above_fold: { price_visible: false, cta_visible: false, passed: false, error: "" },
        overall_score: "0/10",
        issues: []
    };

    let browser;
    try {
        browser = await playwright.chromium.launch({ headless: true });
        
        // TEST 1: $59 Flow on Mobile (390x844 - iPhone 12)
        console.log("\n=== TEST 1: $59 Flow on Mobile (iPhone 12 - 390x844) ===");
        try {
            const context1 = await browser.newContext({
                viewport: { width: 390, height: 844 },
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            });
            const page1 = await context1.newPage();
            
            await page1.goto('https://angelset-lander.netlify.app', { waitUntil: 'networkidle', timeout: 30000 });
            await page1.waitForTimeout(2000);
            
            // Find and click size selector
            const sizeButtons = await page1.$$('.size-option, [class*="size"]');
            if (sizeButtons.length > 0) {
                console.log(`Found ${sizeButtons.length} size buttons`);
                await sizeButtons[0].click();
                await page1.waitForTimeout(1000);
            } else {
                console.log("No size buttons found, proceeding anyway");
            }
            
            // Find primary CTA ($59)
            const primaryCTA = await page1.$('button:has-text("GET MINE NOW"), a:has-text("GET MINE NOW"), [href*="simpleswap"]');
            if (!primaryCTA) {
                throw new Error("Primary CTA not found");
            }
            
            console.log("Clicking primary CTA ($59)...");
            
            // Setup popup/redirect detection
            const [response] = await Promise.race([
                Promise.all([
                    page1.waitForNavigation({ timeout: 5000 }).catch(() => null),
                    primaryCTA.click()
                ]),
                page1.waitForTimeout(5000).then(() => [null])
            ]);
            
            await page1.waitForTimeout(2000);
            
            // Check for popup
            const popupVisible = await page1.$('.popup, [class*="popup"], [class*="modal"]');
            if (popupVisible) {
                console.log("Popup appeared, looking for decline button...");
                const declineBtn = await page1.$('button:has-text("No thanks"), button:has-text("just the pants"), .decline');
                if (declineBtn) {
                    await declineBtn.click();
                    await page1.waitForTimeout(2000);
                }
            }
            
            const finalUrl = page1.url();
            console.log(`Final URL: ${finalUrl}`);
            
            results.test_59_flow.passed = finalUrl.includes('simpleswap.io');
            results.test_59_flow.redirect_url = finalUrl;
            
            if (!results.test_59_flow.passed) {
                results.issues.push("$59 flow did not redirect to simpleswap.io");
            }
            
            await context1.close();
        } catch (error) {
            console.error("TEST 1 Error:", error.message);
            results.test_59_flow.error = error.message;
            results.issues.push(`$59 flow failed: ${error.message}`);
        }
        
        // TEST 2: $19 Flow on Mobile
        console.log("\n=== TEST 2: $19 Flow on Mobile ===");
        try {
            const context2 = await browser.newContext({
                viewport: { width: 390, height: 844 },
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            });
            const page2 = await context2.newPage();
            
            await page2.goto('https://angelset-lander.netlify.app', { waitUntil: 'networkidle', timeout: 30000 });
            await page2.waitForTimeout(2000);
            
            // Select size
            const sizeButtons = await page2.$$('.size-option, [class*="size"]');
            if (sizeButtons.length > 0) {
                await sizeButtons[0].click();
                await page2.waitForTimeout(1000);
            }
            
            // Find secondary CTA ($19)
            const secondaryCTA = await page2.$('button:has-text("PRE-ORDER"), a:has-text("PRE-ORDER"), button:has-text("$19"), a:has-text("$19")');
            if (!secondaryCTA) {
                throw new Error("Secondary CTA ($19) not found");
            }
            
            console.log("Clicking secondary CTA ($19)...");
            await secondaryCTA.click();
            await page2.waitForTimeout(2000);
            
            // Check for popup and decline
            const popupVisible = await page2.$('.popup, [class*="popup"], [class*="modal"]');
            if (popupVisible) {
                console.log("Popup appeared, declining...");
                const declineBtn = await page2.$('button:has-text("No thanks"), button:has-text("just the pants"), .decline');
                if (declineBtn) {
                    await declineBtn.click();
                    await page2.waitForTimeout(2000);
                }
            }
            
            const finalUrl = page2.url();
            console.log(`Final URL: ${finalUrl}`);
            
            results.test_19_flow.passed = finalUrl.includes('simpleswap.io');
            results.test_19_flow.redirect_url = finalUrl;
            
            if (!results.test_19_flow.passed) {
                results.issues.push("$19 flow did not redirect to simpleswap.io");
            }
            
            await context2.close();
        } catch (error) {
            console.error("TEST 2 Error:", error.message);
            results.test_19_flow.error = error.message;
            results.issues.push(`$19 flow failed: ${error.message}`);
        }
        
        // TEST 3: Horizontal Scroll Check (375px - iPhone SE)
        console.log("\n=== TEST 3: Horizontal Scroll Check (iPhone SE - 375x667) ===");
        try {
            const context3 = await browser.newContext({
                viewport: { width: 375, height: 667 },
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            });
            const page3 = await context3.newPage();
            
            await page3.goto('https://angelset-lander.netlify.app', { waitUntil: 'networkidle', timeout: 30000 });
            await page3.waitForTimeout(2000);
            
            const scrollWidth = await page3.evaluate(() => document.documentElement.scrollWidth);
            const viewportWidth = 375;
            
            console.log(`Scroll Width: ${scrollWidth}px`);
            console.log(`Viewport Width: ${viewportWidth}px`);
            
            results.horizontal_scroll.scroll_width = scrollWidth;
            results.horizontal_scroll.passed = scrollWidth <= viewportWidth;
            
            if (!results.horizontal_scroll.passed) {
                const overflow = scrollWidth - viewportWidth;
                results.issues.push(`Horizontal scroll detected: ${overflow}px overflow on 375px viewport`);
            }
            
            await context3.close();
        } catch (error) {
            console.error("TEST 3 Error:", error.message);
            results.horizontal_scroll.error = error.message;
            results.issues.push(`Horizontal scroll test failed: ${error.message}`);
        }
        
        // TEST 4: Above-the-Fold Check
        console.log("\n=== TEST 4: Above-the-Fold Check ===");
        try {
            const context4 = await browser.newContext({
                viewport: { width: 390, height: 844 },
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            });
            const page4 = await context4.newPage();
            
            await page4.goto('https://angelset-lander.netlify.app', { waitUntil: 'networkidle', timeout: 30000 });
            await page4.waitForTimeout(2000);
            
            // Check if price ($59) is visible without scrolling
            const priceElements = await page4.$$('text=/\\$59|59/');
            let priceVisible = false;
            
            for (const el of priceElements) {
                const box = await el.boundingBox();
                if (box && box.y < 844) {
                    priceVisible = true;
                    console.log(`Price visible at Y: ${box.y}px`);
                    break;
                }
            }
            
            // Check if at least one CTA is visible
            const ctaButtons = await page4.$$('button, a[href*="simpleswap"], .cta');
            let ctaVisible = false;
            
            for (const btn of ctaButtons) {
                const box = await btn.boundingBox();
                if (box && box.y < 844) {
                    ctaVisible = true;
                    console.log(`CTA visible at Y: ${box.y}px`);
                    break;
                }
            }
            
            results.above_fold.price_visible = priceVisible;
            results.above_fold.cta_visible = ctaVisible;
            results.above_fold.passed = priceVisible && ctaVisible;
            
            if (!priceVisible) {
                results.issues.push("Price ($59) not visible above the fold");
            }
            if (!ctaVisible) {
                results.issues.push("No CTA visible above the fold");
            }
            
            await context4.close();
        } catch (error) {
            console.error("TEST 4 Error:", error.message);
            results.above_fold.error = error.message;
            results.issues.push(`Above-the-fold test failed: ${error.message}`);
        }
        
    } catch (error) {
        console.error("Fatal Error:", error.message);
        results.issues.push(`Fatal error: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Calculate overall score
    let score = 0;
    if (results.test_59_flow.passed) score += 3;
    if (results.test_19_flow.passed) score += 3;
    if (results.horizontal_scroll.passed) score += 2;
    if (results.above_fold.passed) score += 2;
    
    results.overall_score = `${score}/10`;
    
    // Print results
    console.log("\n\n=== FINAL RESULTS ===");
    console.log(JSON.stringify(results, null, 2));
    
    return results;
}

runMobileTests().catch(console.error);
