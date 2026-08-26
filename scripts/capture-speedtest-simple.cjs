// scripts/capture-speedtest-simple.cjs

const puppeteer = require('puppeteer');
const fs = require('fs');

// ✅ Ruta de Chrome (ajusta según tu instalación)
const CHROME_PATHS = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/laragon/bin/chrome/chrome.exe',
];

async function findChrome() {
    for (const path of CHROME_PATHS) {
        if (fs.existsSync(path)) {
            return path;
        }
    }
    return null;
}

async function captureSpeedtest() {
    let browser = null;
    
    try {
        console.log('🚀 Iniciando...');
        
        // ✅ Buscar Chrome
        const chromePath = await findChrome();
        if (!chromePath) {
            throw new Error('No se encontró Chrome instalado');
        }
        console.log('✅ Chrome encontrado en:', chromePath);

        // ✅ Lanzar navegador
        browser = await puppeteer.launch({
            headless: true,
            executablePath: chromePath,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: { width: 1280, height: 720 },
        });

        const page = await browser.newPage();
        
        console.log('🌐 Abriendo Speedtest.net...');
        await page.goto('https://www.speedtest.net/es', {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });

        console.log('⏳ Esperando botón GO...');
        await page.waitForTimeout(3000);

        // ✅ Hacer clic en GO
        console.log('🔄 Iniciando prueba...');
        await page.evaluate(() => {
            const btn = document.querySelector('.start-button a');
            if (btn) btn.click();
        });

        console.log('⏳ Esperando resultados...');
        await page.waitForTimeout(45000);

        // ✅ Tomar captura
        console.log('📸 Capturando pantalla...');
        await page.screenshot({
            path: 'speedtest.png',
            fullPage: false,
        });

        console.log('✅ Captura completada!');
        console.log('📄 Archivo: speedtest.png');

        await browser.close();

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (browser) await browser.close();
        process.exit(1);
    }
}

captureSpeedtest();