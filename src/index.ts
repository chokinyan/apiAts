import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { sleep } from './utils/sleep';
import puppeteerExtra from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import { connexionMbn } from './auth/connexionMbn';
import { downloadMechanicCours } from './courses/genieMecanique';
import { downloadPhysique } from './courses/physique';
import { downloadMath } from './courses/math';
import { downloadElectricCours } from './courses/genieElectrique';
import { buildDownloadIndex } from './utils/buildDownloadIndex';

/*const getMail = async (page: Page) => {
    await page.goto('https://zimbra.monbureaunumerique.fr');
    await page.waitForSelector('#zti__main_Mail__280');
    console.log('Page chargée');
    await page.click('#zti__main_Mail__280');
    page.once('response', (response) => {
        response.text().then((text) => {
            if (JSON.parse(text)['Body']['SearchResponse']['c'] == undefined) {
                console.log('Aucun mail trouvé');
                return;
            }
            console.log(JSON.parse(text)['Body']['SearchResponse']['c']);
        });
    });
};*/

const downloadAllCours = async () => {
    // Check internet connection
    try {
        await axios.get('https://www.google.com', { timeout: 5000 });
        console.log('Internet connection: OK');
    } catch {
        console.error('No internet connection detected');
        process.exit(1);
    }
    if (!fs.existsSync(path.join(__dirname, '../download'))) {
        fs.mkdirSync(path.join(__dirname, '../download'));
    }
    if (!fs.existsSync(path.join(__dirname, '../Newdownload'))) {
        fs.mkdirSync(path.join(__dirname, '../Newdownload'));
    }

    await downloadPhysique();
    await downloadMath();

    const inflight = new Set<string>();
    puppeteerExtra.use(stealthPlugin());
    const browser = await puppeteerExtra.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--disable-pdfjs',
            '--disable-print-preview',
            '--disable-plugins',
            '--disable-extensions',
            '--disable-translate',
            '--disable-notifications',
            '--disable-popup-blocking',
        ],
    });

    const pageMoodle = await connexionMbn(browser);
    console.log('Connexion effectuée');
    await downloadElectricCours(browser, inflight, pageMoodle);
    await downloadMechanicCours(browser, inflight, pageMoodle);

    while (inflight.size > 0) {
        await sleep(1000);
    }
    await browser.close();

    const NewFileList: Map<string, Array<string>> = new Map<string, Array<string>>();
    const OldFileList: Map<string, Array<string>> = new Map<string, Array<string>>();

    const downloadedFiles = fs.readdirSync(path.join(__dirname, '../Newdownload'), {
        withFileTypes: true,
        recursive: true,
    });
    const oldDownloadedFiles = fs.readdirSync(path.join(__dirname, '../download'), {
        withFileTypes: true,
        recursive: true,
    });

    downloadedFiles.forEach((file) => {
        if (!file.isDirectory()) {
            if (NewFileList.has(file.parentPath.split('Newdownload').pop()!)) {
                NewFileList.get(file.parentPath.split('Newdownload').pop()!)?.push(file.name);
            } else {
                NewFileList.set(file.parentPath.split('Newdownload').pop()!, [file.name]);
            }
        }
    });
    oldDownloadedFiles.forEach((file) => {
        if (!file.isDirectory()) {
            if (OldFileList.has(file.parentPath.split('download').pop()!)) {
                OldFileList.get(file.parentPath.split('download').pop()!)?.push(file.name);
            } else {
                OldFileList.set(file.parentPath.split('download').pop()!, [file.name]);
            }
        }
    });

    if ([...NewFileList.entries()].toString() !== [...OldFileList.entries()].toString()) {
        fs.rmSync(path.join(__dirname, '../download'), { recursive: true });
        fs.renameSync(path.join(__dirname, '../Newdownload'), path.join(__dirname, '../download'));
        fs.mkdirSync(path.join(__dirname, '../Newdownload'));
        console.log('Nouveaux fichiers détectés, le dossier download a été mis à jour.');
    }

    console.log('Fin du programme');
    fs.rmSync(path.join(__dirname, '../Newdownload'), { recursive: true });
    await buildDownloadIndex(path.join(__dirname, '../download'));
};

export { downloadAllCours };
