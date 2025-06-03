const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--ignore-certificate-errors',
            '--allow-file-access-from-files'
        ]
    });
    const page = await browser.newPage();
    page.on('console', msg => {
        const text = msg.text();
        if (/WebGL|OpenGL/.test(text)) {
            return;
        }
        console.log('BROWSER ' + msg.type() + ':', text);
    });
    page.on('pageerror', err => {
        console.error('PAGE ERROR:', err.message);
    });

    const url = 'file://' + __dirname + '/index.html';
    await page.goto(url);
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
