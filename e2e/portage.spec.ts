import { test, expect } from '@playwright/test';

test.describe('Portage End-to-End User Journeys', () => {
  test('Spec 1: landing renders hero, 3 columns, featured RigToRack card, other transitions, blank start', async ({
    page,
  }, testInfo) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Your experience counts\./i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Discover' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Practice' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Show' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Start the RigToRack demo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Other career transitions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start with my own experience' })).toBeVisible();

    if (testInfo.project.name === 'desktop') {
      await page.screenshot({ path: 'submission/screenshots/01-landing.png', fullPage: true });
    }
  });

  test('Spec 2 & 3 & 4 & 5: Complete RigToRack Flagship Journey with screenshots', async ({
    page,
  }, testInfo) => {
    await page.goto('/');

    // Spec 2: Launch RigToRack
    await page.getByRole('button', { name: 'Start the RigToRack demo' }).click();
    await expect(page.getByRole('heading', { name: 'Tell us about your work' })).toBeVisible();

    const currentRoleInput = page.getByLabel('Current role');
    await expect(currentRoleInput).toHaveValue(/Facilities.*Supervisor/i);

    await page.getByRole('button', { name: 'Find my transferable skills' }).click();
    await expect(page.getByRole('heading', { name: 'Skills you may already have' })).toBeVisible();

    // Check skills
    if (await page.getByRole('button', { name: 'Accept all suggestions' }).isVisible()) {
      await page.getByRole('button', { name: 'Accept all suggestions' }).click();
    }

    if (testInfo.project.name === 'desktop') {
      await page.screenshot({ path: 'submission/screenshots/02-skills.png', fullPage: true });
    }

    // Spec 3: Continue to NextSkillCard
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: /Evidence-based electricity-data/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Why Portage picked this' })).toBeVisible();

    await page.getByRole('button', { name: 'Start the practice task' }).click();

    // Spec 4: Practice loop
    await expect(page.getByRole('heading', { name: /Brief the team on a real Alberta electricity interval/i })).toBeVisible();

    // Baseline attempt
    await page.getByRole('button', { name: 'Load sample first attempt' }).click();
    await page.getByRole('button', { name: 'Check my answer' }).click();

    await expect(page.getByRole('heading', { name: /0 of 4 criteria met/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What to work on' })).toBeVisible();

    if (testInfo.project.name === 'desktop') {
      await page.screenshot({ path: 'submission/screenshots/03-practice-feedback.png', fullPage: true });
    }

    // Revision attempt
    await page.getByRole('button', { name: 'Load sample revision' }).click();
    await page.getByRole('button', { name: 'Check my answer' }).click();

    await expect(page.getByRole('heading', { name: '4 of 4 criteria met' })).toBeVisible();
    await expect(page.getByText('Practice objective demonstrated.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'How your answer changed' })).toBeVisible();
    await expect(page.getByText('Gained').first()).toBeVisible();

    // Spec 5: Evidence screen
    await page.getByRole('button', { name: 'See your evidence' }).click();
    await expect(page.getByRole('heading', { name: 'Your practice evidence' })).toBeVisible();
    await expect(
      page.getByText(/An inspectable record of practice and improvement/i)
    ).toBeVisible();
    await expect(page.getByText(/0\/4 → 4\/4/)).toBeVisible();
    await expect(page.getByText(/Observed AESO data|Alberta Electric System Operator/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Limitations' })).toBeVisible();

    if (testInfo.project.name === 'desktop') {
      await page.screenshot({ path: 'submission/screenshots/04-evidence-print.png', fullPage: true });
    }
  });

  test('Spec 6: Hospitality to BI Analyst transition runs to completion', async ({ page }) => {
    await page.goto('/');

    const hospButton = page.getByRole('button', { name: 'Try this transition' }).first();
    await hospButton.click();

    await expect(page.getByRole('heading', { name: 'Tell us about your work' })).toBeVisible();
    await page.getByRole('button', { name: 'Find my transferable skills' }).click();

    await expect(page.getByRole('heading', { name: 'Skills you may already have' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('button', { name: 'Start the practice task' })).toBeVisible();
    await page.getByRole('button', { name: 'Start the practice task' }).click();

    await page.getByRole('button', { name: 'Load sample revision' }).click();
    await page.getByRole('button', { name: 'Check my answer' }).click();

    await expect(page.getByRole('heading', { name: '4 of 4 criteria met' })).toBeVisible();
    await page.getByRole('button', { name: 'See your evidence' }).click();

    await expect(page.getByRole('heading', { name: 'Your practice evidence' })).toBeVisible();
  });

  test('Spec 7: Blank start from scratch with custom duties and skill editing', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Start with my own experience' }).click();
    await expect(page.getByRole('heading', { name: 'Tell us about your work' })).toBeVisible();

    await page.getByLabel('Current role').fill('Warehouse Associate');
    await page.getByLabel('What do you do day to day? One duty per line.').fill(
      'Custom unknown duty with no match xyz123\nMaintained inventory count daily'
    );
    await page.getByLabel('Role you want next').fill('Supply Chain Analyst');

    await page.getByRole('button', { name: 'Find my transferable skills' }).click();
    await expect(page.getByRole('heading', { name: 'Skills you may already have' })).toBeVisible();

    // Verify unmatched skill suggestion
    await expect(page.getByText('Needs your input')).toBeVisible();

    // Edit the custom skill
    const editBtn = page.getByRole('button', { name: /Edit Needs your input/i });
    await editBtn.click();

    const editInput = page.getByRole('textbox', { name: /Edit Needs your input/i });
    await editInput.fill('Specialized Packing Operations');
    await page.getByRole('button', { name: /Save Needs your input/i }).click();

    await expect(page.getByText('Specialized Packing Operations')).toBeVisible();
  });

  test('Spec 8: Keyboard navigation and skip link', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    // Press enter on featured button
    const featuredCta = page.getByRole('button', { name: 'Start the RigToRack demo' });
    await featuredCta.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('heading', { name: 'Tell us about your work' })).toBeVisible();
  });

  test('Spec 9: Responsive width on mobile has no horizontal scroll', async ({ page }) => {
    await page.goto('/');

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('Spec 10: Reset button clears state and returns to welcome', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start the RigToRack demo' }).click();
    await expect(page.getByRole('heading', { name: 'Tell us about your work' })).toBeVisible();

    await page.getByRole('button', { name: 'Reset demo and clear everything' }).click();
    await expect(page.getByRole('heading', { name: /Your experience counts\./i })).toBeVisible();
  });

  test('Spec 11: SEO metadata, JSON-LD, crawl endpoints, deep-linking, and privacy-safe GA4 dataLayer', async ({
    page,
    request,
  }) => {
    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.status()).toBe(200);
    expect(await robotsRes.text()).toContain('Sitemap: https://portage.garo.pro/sitemap.xml');

    const sitemapRes = await request.get('/sitemap.xml');
    expect(sitemapRes.status()).toBe(200);
    expect(await sitemapRes.text()).toContain('?scenario=rigtorack');

    const manifestRes = await request.get('/site.webmanifest');
    expect(manifestRes.status()).toBe(200);

    await page.goto('/');
    await expect(page).toHaveTitle(/Portage — Your experience counts\./);

    const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonicalHref).toBe('https://portage.garo.pro/');

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toContain('portage-logo.png');

    const jsonLdText = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLdText).toBeTruthy();
    const jsonLd = JSON.parse(jsonLdText!);
    expect(jsonLd['@graph']).toHaveLength(2);

    // Scenario deep-link updates title, canonical, and GA4 dataLayer
    await page.goto('/?scenario=hospitality-bi');
    await expect(page.getByRole('heading', { name: 'Tell us about your work' })).toBeVisible();
    await expect(page).toHaveTitle(/Hospitality Supervisor.*Business Intelligence Analyst/);

    const deepCanonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(deepCanonical).toBe('https://portage.garo.pro/?scenario=hospitality-bi');

    const dataLayerEvents = await page.evaluate(() => {
      return (window as unknown as { dataLayer?: unknown[][] }).dataLayer ?? [];
    });
    expect(dataLayerEvents.length).toBeGreaterThan(0);
    const serialized = JSON.stringify(dataLayerEvents);
    expect(serialized).toContain('step_view');
    expect(serialized).not.toContain('dutiesInput');
  });
});

