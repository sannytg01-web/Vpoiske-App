const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', async msg => {
        try {
            const args = msg.args();
            for (let i = 0; i < args.length; i++) {
                console.log(await args[i].jsonValue());
            }
        } catch(e){}
    });
    page.on('pageerror', err => console.log('ERROR:', err.toString()));
    await page.goto('http://localhost:5173/');
    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
})();
