import puppeteer from 'puppeteer';
import fs from 'fs';

const data = {
  url: '',
  list: [],
};

const scrapper = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setViewport({ width: 1366, height: 768 });

  await page.goto('https://www.flipkart.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[name="q"]', { visible: true });
  console.log('Enter the qury in the flipkart search box');

  const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(0);
  await page.keyboard.press('Enter');
  await navigationPromise;

  data.url = page.url();

  for (let pageCounter = 1; pageCounter <= 5; pageCounter++) {
    const products = await page.evaluate(() => {
      const items = document.querySelectorAll('div[data-id]');
      const productList = [];

      items.forEach((item) => {
        const id = item.getAttribute('data-id');
        var name = item.querySelector('div._4rR01T') && item.querySelector('div._4rR01T').innerText;
        if (!name) {
          const anchorElement = item.querySelector('a.s1Q9rs');
          name = anchorElement && anchorElement.innerText;
        }

        const rating = item.querySelector('div._3LWZlK') && item.querySelector('div._3LWZlK').innerText;
        const price = item.querySelector('div._30jeq3') && item.querySelector('div._30jeq3').innerText;
        var description = item.querySelector('div.fMghEO') && item.querySelector('div.fMghEO').innerText;
        if (!description) {
          description = item.querySelector('div._3Djpdu') && item.querySelector('div._3Djpdu').innerText;
        }

        productList.push({
          id: id,
          name: name,
          rating: rating,
          price: price,
          description: description,
        });
      });

      return productList;
    });

    data.list.push(...products);
  }

  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync('product_sever.json', json, 'utf-8');
  console.log('Data scraping completed. Results saved to product_sever.json');
  await browser.close();
};

scrapper();
