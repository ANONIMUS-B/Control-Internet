// scripts/capture-speedtest.cjs

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ✅ Configuración
const CONFIG = {
    url: 'https://www.speedtest.net/es',
    timeout: 60000,
    screenshotPath: process.argv[2] || 'speedtest.png',
};

async function captureSpeedtest() {
    let browser = null;
    
    try {
        console.log('🚀 Iniciando navegador...');
        
        // ✅ Usar Chrome instalado en el sistema
        const executablePath = process.env.CHROME_PATH || 
                              'C:/Program Files/Google/Chrome/Application/chrome.exe' ||
                              'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

        browser = await puppeteer.launch({
            headless: true,
            executablePath: executablePath, // ✅ Usar Chrome del sistema
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080',
            ],
            defaultViewport: {
                width: 1920,
                height: 1080,
            },
        });

        const page = await browser.newPage();
        
        page.setDefaultTimeout(CONFIG.timeout);
        page.setDefaultNavigationTimeout(CONFIG.timeout);

        console.log('🌐 Navegando a Speedtest.net...');
        await page.goto(CONFIG.url, {
            waitUntil: 'networkidle2',
            timeout: CONFIG.timeout,
        });

        await page.waitForSelector('.start-button a', { timeout: 10000 });
        await page.waitForTimeout(2000);

        // ✅ Aceptar cookies
        try {
            const acceptButton = await page.$('.accept-consent-button, .qc-cmp-button, [aria-label="Accept"]');
            if (acceptButton) {
                await acceptButton.click();
                await page.waitForTimeout(1000);
            }
        } catch (e) {
            console.log('ℹ️ No se encontró botón de cookies');
        }

        // ✅ Hacer clic en "GO"
        console.log('🔄 Iniciando prueba de velocidad...');
        
        const goButton = await page.$('.start-button a, .js-start-test, [data-testid="start-test-button"]');
        if (goButton) {
            await goButton.click();
        } else {
            await page.evaluate(() => {
                const btn = document.querySelector('.start-button a') || 
                           document.querySelector('.js-start-test') ||
                           document.querySelector('[data-testid="start-test-button"]');
                if (btn) btn.click();
            });
        }

        console.log('⏳ Esperando resultados...');
        await page.waitForSelector('.result-data', { timeout: 60000 });
        await page.waitForTimeout(5000);

        // ✅ Extraer datos
        console.log('📊 Extrayendo datos...');
        
        const speedData = await page.evaluate(() => {
            const getText = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.innerText.trim() : null;
            };

            const download = getText('.download-speed') || 
                           getText('.result-data .download-speed');
            const upload = getText('.upload-speed') || 
                         getText('.result-data .upload-speed');
            const ping = getText('.ping-speed') || 
                       getText('.result-data .ping-speed');
            const isp = getText('.isp-name') || 
                       getText('.result-data .isp-name');

            return { download, upload, ping, isp };
        });

        // ✅ Tomar captura
        console.log('📸 Tomando captura de pantalla...');
        
        const screenshotPath = path.resolve(CONFIG.screenshotPath);
        await page.screenshot({
            path: screenshotPath,
            fullPage: true,
            quality: 100,
            type: 'png',
        });

        // ✅ Guardar datos en JSON
        const resultData = {
            timestamp: new Date().toISOString(),
            download: speedData.download || 'N/A',
            upload: speedData.upload || 'N/A',
            ping: speedData.ping || 'N/A',
            isp: speedData.isp || 'N/A',
            screenshot: screenshotPath,
        };

        const jsonPath = screenshotPath.replace('.png', '.json');
        fs.writeFileSync(jsonPath, JSON.stringify(resultData, null, 2));

        console.log('✅ Captura completada exitosamente!');
        console.log(`📸 Imagen: ${screenshotPath}`);
        console.log(`📄 Datos: ${jsonPath}`);
        
        console.log('\n📊 RESULTADOS:');
        console.log(`📥 Descarga: ${speedData.download || 'N/A'} Mbps`);
        console.log(`📤 Subida: ${speedData.upload || 'N/A'} Mbps`);
        console.log(`📶 Ping: ${speedData.ping || 'N/A'} ms`);
        console.log(`🏢 ISP: ${speedData.isp || 'N/A'}`);

        await browser.close();
        return resultData;

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (browser) await browser.close();
        throw error;
    }
}

captureSpeedtest()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });