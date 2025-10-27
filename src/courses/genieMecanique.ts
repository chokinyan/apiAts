import fs from 'fs';
import path from 'path';
import { Browser, Page } from 'puppeteer';
import { MechanicCours } from '../types/mechanic';
import { sanitizeFileName } from '../utils/sanitizeFileName';
import { sleep } from '../utils/sleep';

export async function downloadMechanicCours(browser: Browser, inflight: Set<string>, pageMeca: Page) {
    if (!fs.existsSync(`Newdownload/mecha`)) {
        fs.mkdirSync(`Newdownload/mecha`);
    }

    // Navigation vers Moodle avec gestion des redirections d'authentification
    try {
        await pageMeca.goto('https://0680034t.moodle.monbureaunumerique.fr/course/view.php?id=3182&lang=fr', {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });
    } catch (error) {
        console.log('Erreur de navigation, tentative de continuer...', error);
        // Si la page a quand même chargé partiellement, on continue
    }

    await pageMeca.waitForSelector('h3[data-for="section_title"] a', {
        timeout: 15000,
    });
    const linkMeca = await pageMeca.$$('h3[data-for="section_title"] a');
    for (const link of linkMeca) {
        const title = sanitizeFileName((await link.evaluate((node) => node.textContent?.trim())) || 'section');
        if (!fs.existsSync(`Newdownload/mecha/${title}`)) {
            fs.mkdirSync(`Newdownload/mecha/${title}`);
        }
        const sectionPage = await browser.newPage();
        await sectionPage.goto(`${await link.evaluate((node) => node.href)}&lang=fr`, { waitUntil: 'networkidle2' });
        await sectionPage.waitForSelector('.section-item a');
        const folder = await sectionPage.$$('.section-item a');
        const LinkList: Array<MechanicCours.MechaLinkList> = [];
        for (const fol of folder) {
            const folTitle = sanitizeFileName((await fol.evaluate((node) => node.textContent?.trim())) || 'folder');
            LinkList.push({
                title: folTitle,
                url: await fol.evaluate((node) => node.href),
            });
        }
        for (const fol of LinkList) {
            if (!fs.existsSync(`Newdownload/mecha/${title}/${fol.title}`)) {
                fs.mkdirSync(`Newdownload/mecha/${title}/${fol.title}`);
            }
            const underPage = await browser.newPage();
            await underPage.goto(`${fol.url}&lang=fr`, { waitUntil: 'networkidle2' });
            const client = await underPage.createCDPSession();
            await client.send('Network.enable');

            // Compter le nombre de fichiers à télécharger
            await underPage.waitForSelector("a[href*='https://0680034t.moodle.monbureaunumerique.fr/pluginfile.php/']");
            const fileCount = await underPage.evaluate(() => {
                return document.querySelectorAll(
                    "a[href*='https://0680034t.moodle.monbureaunumerique.fr/pluginfile.php/']"
                ).length;
            });

            console.log(`Téléchargement de ${fileCount} fichier(s) dans ${fol.title}...`);
            let downloadedCount = 0;

            // Configurer le listener pour tracker les téléchargements
            client.on('Network.responseReceived', async ({ response, requestId }) => {
                const cd = String(response.headers['content-disposition'] || '').toLowerCase();
                if (cd.includes('attachment')) {
                    inflight.add(requestId);
                    try {
                        await client.send('Network.getResponseBody', { requestId });
                        downloadedCount++;
                        console.log(`  ✓ Téléchargé ${downloadedCount}/${fileCount}`);
                    } catch {
                        console.log(`  ✗ Erreur lors du téléchargement`);
                    } finally {
                        inflight.delete(requestId);
                    }
                }
            });

            await client.send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: path.join(__dirname, `../../Newdownload/mecha/${title}/${fol.title}`),
            });

            // Déclencher les téléchargements
            await underPage.evaluate(() => {
                const link = document.querySelectorAll(
                    "a[href*='https://0680034t.moodle.monbureaunumerique.fr/pluginfile.php/']"
                ) as NodeListOf<HTMLAnchorElement>;
                return link.forEach((l) => {
                    l.setAttribute('target', '_self');
                    l.setAttribute('download', '');
                    l.setAttribute('onclick', 'return true;');
                    l.click();
                });
            });

            // Attendre que tous les téléchargements soient terminés
            const maxWaitTime = 20000; // 20 secondes max
            const startTime = Date.now();
            while (downloadedCount < fileCount && Date.now() - startTime < maxWaitTime) {
                await sleep(500);
            }

            await underPage.close();
        }
        await sectionPage.close();
    }
    await pageMeca.close();
}
