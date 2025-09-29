#!/usr/bin/env node
// High-level Puppeteer runner that mimics the extension's automation

import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

const APPLE_URLS = [
  'https://www.apple.com/jp/shop/buy-iphone/iphone-17-pro',
  'https://www.apple.com/jp/shop/buy-iphone/iphone-17'
];

const DEFAULT_MODEL = 'pro'; // 'pro' | 'base'

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function sendWebhook(webhookUrl, embed) {
  if (!webhookUrl) return;
  try {
    const payload = { content: '📣 iPhone 17 Monitor', embeds: [embed] };
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.error('Webhook failed:', res.status, res.statusText);
    }
  } catch (err) {
    console.error('Webhook error:', err);
  }
}

async function selectOptions(page, model) {
  // Mirror content.js selectColor/selectCapacity/selectPaymentMethod/selectAppleCare
  await sleep(2000);

  const isPro = model === 'pro';

  const clickBySelector = async (selector, description) => {
    try {
      await page.waitForSelector(selector, { timeout: 7000 });
    } catch {
      return false;
    }
    const clicked = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = el.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden';
      if (!visible || el.disabled) return false;
      if ('checked' in el && !el.checked) {
        el.click();
        return true;
      }
      if (!('checked' in el)) {
        el.click();
        return true;
      }
      return true; // already checked
    }, selector);
    if (clicked) console.log(`[Monitor] Clicked ${description}`);
    return clicked;
  };

  const colorPriorityPro = ['cosmicorange', 'silver', 'deepblue'];
  const colorPriorityBase = ['lavender', 'black', 'white', 'sage', 'mistblue'];
  const colors = isPro ? colorPriorityPro : colorPriorityBase;
  for (const color of colors) {
    if (await clickBySelector(`input[data-autom="dimensionColor${color}"]`, `color ${color}`)) break;
  }

  await clickBySelector('input[data-autom="dimensionCapacity256gb"]', 'capacity 256gb');
  await clickBySelector('input[data-autom="purchaseGroupOptionfullprice"]', 'payment full price');
  await clickBySelector('input[data-autom="noapplecare"]', 'no AppleCare');
}

async function openStoreDialog(page) {
  const selectors = [
    'button[data-ase-overlay="buac-overlay"]',
    'button.as-retailavailabilitytrigger-infobutton',
    'button.retail-availability-search-trigger',
    'button[data-ase-click="show"]'
  ];

  for (let attempt = 1; attempt <= 10; attempt++) {
    for (const sel of selectors) {
      const clicked = await page.evaluate((selector) => {
        const btn = document.querySelector(selector);
        if (!btn) return false;
        btn.scrollIntoView({ block: 'center', inline: 'center' });
        const rect = btn.getBoundingClientRect();
        const visible = rect.width > 0 && rect.height > 0 && getComputedStyle(btn).visibility !== 'hidden';
        if (!visible || btn.disabled) return false;
        btn.click();
        return true;
      }, sel);
      if (clicked) {
        console.log(`[Monitor] Clicked store dialog trigger via selector: ${sel} (attempt ${attempt})`);
        return true;
      }
    }

    const fallbackClicked = await page.evaluate(() => {
      const allButtons = document.querySelectorAll('button');
      const btn = Array.from(allButtons).find(b => {
        const t = (b.textContent || '').toLowerCase();
        return (t.includes('apple') || t.includes('銀座') || t.includes('ginza')) && !b.disabled;
      });
      if (btn) {
        btn.scrollIntoView({ block: 'center', inline: 'center' });
        btn.click();
        return true;
      }
      return false;
    });
    if (fallbackClicked) {
      console.log(`[Monitor] Clicked store dialog trigger via fallback text match (attempt ${attempt})`);
      return true;
    }

    console.log(`[Monitor] Store dialog trigger not found yet, retrying... (${attempt}/10)`);
    await sleep(1000);
  }

  console.warn('[Monitor] Failed to find store dialog trigger after retries');
  return false;
}

async function analyzeStoreData(page, model) {
  // Mirrors analyzeStoreData/checkAvailabilityResults
  const data = await page.evaluate((model) => {
    function q(selector) { return document.querySelector(selector); }
    function qa(selector) { return Array.from(document.querySelectorAll(selector)); }

    const result = {
      timestamp: new Date().toISOString(),
      dialogType: 'store_availability',
      model,
      stores: [],
      summary: '',
      hasAvailability: false
    };

    const dialog = q('.rf-productlocator-overlay-content');
    const noPickup = q('.rf-productlocator-nopickupstores');
    const options = qa('.rf-productlocator-storeoption');

    if (noPickup) {
      const title = noPickup.querySelector('.rf-productlocator-buttontitle, span.rf-productlocator-buttontitle, span[class*="buttontitle"]');
      if (title && title.textContent) result.summary = title.textContent.trim();
    }

    options.forEach(opt => {
      const name = opt.querySelector('.form-selector-title')?.textContent?.trim();
      const location = opt.querySelector('.form-label-small')?.textContent?.trim();
      const status = opt.querySelector('.form-selector-right-col span')?.textContent?.trim();
      const isDisabled = opt.classList.contains('disabled');
      const isAvailable = !isDisabled && !(status || '').includes('ご利用いただけません');
      if (name) {
        result.stores.push({ name, location, status, isAvailable, isDisabled });
        if (isAvailable) result.hasAvailability = true;
      }
    });

    const delivery = qa('.rf-productlocator-deliveryquotesoption');
    delivery.forEach(opt => {
      const t = opt.querySelector('.form-selector-title')?.textContent?.trim();
      if (t) {
        result.deliveryOptions = result.deliveryOptions || [];
        result.deliveryOptions.push(t);
      }
    });

    if (!dialog && !noPickup && options.length === 0) {
      return null; // not ready yet
    }

    return result;
  }, model);

  return data;
}

async function clearSiteData(page) {
  // Clear storage and cookies similar to content.js + popup.js intent
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach(c => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
    } catch {}
  });

  const client = await page.createCDPSession();
  const { origin } = new URL(page.url());
  try {
    await client.send('Storage.clearDataForOrigin', {
      origin,
      storageTypes: 'cookies,local_storage,session_storage,indexeddb,cache_storage,service_workers'
    });
  } catch (e) {
    console.warn('CDP clearDataForOrigin failed:', e?.message || e);
  }
}

async function clearOriginsBeforeRun(browser) {
  // Clear data for Apple origins before navigation
  const origins = [
    'https://www.apple.com',
    'https://apple.com',
    'https://store.apple.com'
  ];
  const page = await browser.newPage();
  const client = await page.createCDPSession();
  for (const origin of origins) {
    try {
      await client.send('Storage.clearDataForOrigin', {
        origin,
        storageTypes: 'cookies,local_storage,session_storage,indexeddb,cache_storage,service_workers'
      });
      console.log(`[Monitor] Cleared origin data before run: ${origin}`);
    } catch (e) {
      console.warn(`[Monitor] Failed to clear origin before run: ${origin}`, e?.message || e);
    }
  }
  await page.close();
}

async function main() {
  const modelArg = process.env.MODEL || DEFAULT_MODEL; // 'pro' or 'base'
  const webhookUrl = process.env.WEBHOOK_URL || '';
  const proxy = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || '';
  const headlessEnv = (process.env.HEADLESS || 'new').toLowerCase();
  const headless = (headlessEnv === 'false' || headlessEnv === '0') ? false : (headlessEnv === 'true' ? 'new' : headlessEnv);
  const clearBefore = (process.env.CLEAR_BEFORE || 'true').toLowerCase() !== 'false';

  const launchArgs = ['--no-sandbox','--disable-setuid-sandbox'];
  if (proxy) launchArgs.push(`--proxy-server=${proxy}`);

  console.log('[Monitor] Launching browser...', { headless, proxy: proxy || 'none' });
  const browser = await puppeteer.launch({ headless, args: launchArgs });
  if (clearBefore) {
    await clearOriginsBeforeRun(browser);
  }
  const page = await browser.newPage();

  // Optional: set a realistic UA
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const url = modelArg === 'pro' ? APPLE_URLS[0] : APPLE_URLS[1];
  console.log('[Monitor] Navigating to:', url);
  await page.goto(url, { waitUntil: 'networkidle2' });

  await selectOptions(page, modelArg === 'pro' ? 'iPhone 17 Pro' : 'iPhone 17');
  await openStoreDialog(page);

  let data = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    await sleep(2000);
    data = await analyzeStoreData(page, modelArg === 'pro' ? 'iPhone 17 Pro' : 'iPhone 17');
    if (data) break;
  }

  if (data) {
    console.log('Store availability data:', JSON.stringify(data, null, 2));
    await sendWebhook(webhookUrl, {
      title: 'iPhone 17 Store Availability',
      color: data.hasAvailability ? 0x00ff00 : 0xff9900,
      timestamp: new Date().toISOString(),
      fields: [
        { name: 'Model', value: data.model || (modelArg === 'pro' ? 'iPhone 17 Pro' : 'iPhone 17'), inline: true },
        { name: 'Has Availability', value: String(!!data.hasAvailability), inline: true },
        { name: 'Summary', value: data.summary || 'N/A', inline: false }
      ]
    });
  } else {
    console.log('No store data found.');
    await sendWebhook(webhookUrl, {
      title: 'iPhone 17 Store Availability',
      color: 0xff0000,
      timestamp: new Date().toISOString(),
      fields: [
        { name: 'Status', value: 'No store dialog found', inline: false }
      ]
    });
  }

  // Optional cleanup
  await clearSiteData(page);
  await browser.close();
}

main().catch(async (err) => {
  console.error('Runner error:', err);
  const webhookUrl = process.env.WEBHOOK_URL || '';
  await sendWebhook(webhookUrl, {
    title: 'iPhone 17 Monitor Error',
    color: 0xff0000,
    timestamp: new Date().toISOString(),
    fields: [{ name: 'Error', value: String(err && err.message || err) }]
  });
  process.exit(1);
});


