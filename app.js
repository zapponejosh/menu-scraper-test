import puppeteer from "puppeteer";
import got from "got";
import sites from "./sites.js";
import fs from "fs";
import parse from "./parse.js";
async function init() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (let i = 0; i <= sites.length; i++) {
    let site = sites[i];
    try {
      const siteArr = site.split("concur.");
      let tld = siteArr.pop().replace("/", "-");

      await page.goto(site);

      const menuItems = await page
        .$$eval(".menu a", (items) => items.map((item) => item.href))
        .catch((error) => console.log(error));

      const results = await Promise.all(
        menuItems.map(async (page) => {
          const request = await got(page).catch((e) => "error");
          const statusCode = request === "error" ? 404 : request.statusCode;
          const redirectUrls = request.redirectUrls ? request.redirectUrls : [];

          const obj = {
            page: page,
            statusCode: statusCode,
            redirectUrls: redirectUrls,
          };
          return obj;
        })
      );

      fs.writeFile(`${tld}.json`, JSON.stringify(results, null, 2), (err) => {
        if (err) throw err;
        console.log(`File for ${tld} has been saved.`);
      });
    } catch (err) {
      console.log(err);
    }
  }

  /** Synchronous code that doesnt work currently
   * race condition because map doesnt wait but returns a promise then puppeteer tries to navigate away
   * when creating a page for each site puppeteer times out
   */
  // await Promise.all(
  //   sites.map(async function vistSites(site) {
  // const siteArr = site.split("concur.");
  // let tld = siteArr.pop().replace("/", "-");

  // await page.goto(site);

  // const menuItems = await page
  //   .$$eval(".menu a", (items) => items.map((item) => item.href))
  //   .catch((error) => console.log(error));

  // const results = await Promise.all(
  //   menuItems.map(async (page) => {
  //     const request = await got(page).catch((e) => "error");
  //     const statusCode = request === "error" ? 404 : request.statusCode;
  //     const redirectUrls = request.redirectUrls ? request.redirectUrls : [];

  //     const obj = {
  //       page: page,
  //       statusCode: statusCode,
  //       redirectUrls: redirectUrls,
  //     };
  //     return obj;
  //   })
  // );

  // fs.writeFile(`${tld}.json`, JSON.stringify(results, null, 2), (err) => {
  //   if (err) throw err;
  //   console.log(`File for ${tld} has been saved.`);
  // });

  //   })
  // );
  await browser.close();
  parse();
}

init();
