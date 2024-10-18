// puppeteerConfig.js
const puppeteer = require('puppeteer');

const launchBrowser = async () => {
  const browser = await puppeteer.launch({
    headless: true, // Ejecutar en modo headless (sin GUI)
    args: [
      '--no-sandbox', // Importante para el entorno de Railway
      '--disable-setuid-sandbox', // También necesario para Railway
    ],
  });
  return browser;
};

module.exports = { launchBrowser };
