import fs from 'fs';
import path from 'path';
import { Browser, Page } from 'puppeteer';
import { ElectricCours } from '../types/electric';
import { sanitizeFileName } from '../utils/sanitizeFileName';

export async function downloadElectricCours(browser: Browser, inflight: Set<string>, pageMoodle: Page) {
    let elecCours: Array<ElectricCours.ElecType> = [];
    if (!fs.existsSync(`Newdownload/elec`)) {
        fs.mkdirSync(`Newdownload/elec`);
    }

    // Navigation vers Moodle avec gestion des redirections d'authentification
    try {
        await pageMoodle.goto('https://0680034t.moodle.monbureaunumerique.fr/course/view.php?id=1200&lang=fr', {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });
    } catch (error) {
        console.log('Erreur de navigation, tentative de continuer...', error);
        // Si la page a quand même chargé partiellement, on continue
    }

    await pageMoodle.waitForSelector('a[href^="https://0680034t.moodle.monbureaunumerique.fr/course/view.php"]', {
        timeout: 15000,
    });
    const courseLink = await pageMoodle.$$('a[href^="https://0680034t.moodle.monbureaunumerique.fr/course/view.php"]');
    if (courseLink == null) return;
    for (const course of courseLink) {
        if (await course.evaluate((node) => node.href.includes('id=1200'))) {
            continue;
        }
        const courseName = await course.evaluate((node) => node.textContent?.trim());
        elecCours.push({
            cours: courseName ? sanitizeFileName(courseName) : undefined,
            CoursUrl: await course.evaluate((node) => node.href),
            section: [],
            files: [],
        });
    }
    // Fin du recuperateur de cours
    // telechargement des fichiers
    for (const cour of elecCours) {
        await pageMoodle.goto(`${cour.CoursUrl!}&lang=fr`, { waitUntil: 'networkidle0' });
        const SectionLinks = await pageMoodle.$$('a[id^="sectionlink"]');
        if (SectionLinks == null) continue;
        for (const l of SectionLinks) {
            const url = await l.evaluate((node) => node.href);
            if (url && cour.section != undefined) {
                cour.section.push(url);
            }
        }
    }
    for (const cour of elecCours) {
        if (cour.section == undefined) continue;
        for (const url of cour.section) {
            if (url == undefined) continue;
            const sectionPage = await browser.newPage();
            await sectionPage.goto(`${url}&lang=fr`, { waitUntil: 'networkidle2' });
            await sectionPage.waitForSelector('li');
            const li = await sectionPage.$$('li[class*="label"]');
            const cours = await sectionPage.$$(
                'a[href^="https://0680034t.moodle.monbureaunumerique.fr/mod/resource/"]'
            );
            if (li == null && cours == null) continue;
            if (li.length == 0 && cours.length == 0) continue;
            const allFiles = await sectionPage.evaluate(() => {
                const files = Array.from(
                    document.querySelectorAll("a[href^='https://0680034t.moodle.monbureaunumerique.fr/mod/resource/']")
                );
                return {
                    subSection: undefined,
                    url: files.map((f) => {
                        if (f instanceof HTMLAnchorElement) {
                            return f.href.split('&')[0];
                        }
                    }),
                };
            });
            if (cour.files == undefined) {
                cour.files = [];
            }
            for (const l of li) {
                const result = await l.evaluate((node) => {
                    let files = [];
                    let sibling = node.nextElementSibling;
                    while (sibling?.getAttribute('id') != undefined) {
                        files.push(sibling);
                        sibling = sibling?.nextElementSibling;
                    }
                    return {
                        subSection: node.textContent?.trim() || undefined,
                        url: files
                            .map((f) => {
                                if (
                                    f
                                        ?.querySelector('a')
                                        ?.href?.startsWith(
                                            'https://0680034t.moodle.monbureaunumerique.fr/mod/resource/'
                                        )
                                ) {
                                    return f?.querySelector('a')?.href.split('&')[0];
                                }
                            })
                            .filter((url) => url != undefined),
                    };
                });
                // Sanitize le nom de la sous-section
                if (result.subSection) {
                    result.subSection = sanitizeFileName(result.subSection);
                }
                if (cour.files == undefined) {
                    cour.files = [];
                }
                cour.files.push(result);
                allFiles.url = allFiles.url.filter((url) => !result.url.includes(url || ''));
            }
            if (allFiles.url.length > 0) {
                cour.files.push(allFiles);
            }
            await sectionPage.close();
        }
    }
    for (const cour of elecCours) {
        if (cour.cours == undefined) continue;
        if (cour.files == undefined) continue;
        if (!fs.existsSync(`Newdownload/elec/${cour.cours}`)) {
            fs.mkdirSync(`Newdownload/elec/${cour.cours}`);
        }
        for (const section of cour.files) {
            if (
                !fs.existsSync(`Newdownload/elec/${cour.cours}/${section.subSection}`) &&
                section.subSection != undefined
            ) {
                fs.mkdirSync(`Newdownload/elec/${cour.cours}/${section.subSection}`);
            }
            const DlPage = await browser.newPage();
            const client = await DlPage.createCDPSession();
            await client.send('Network.enable');
            section.subSection != undefined
                ? await client.send('Page.setDownloadBehavior', {
                      behavior: 'allow',
                      downloadPath: path.join(__dirname, `../../Newdownload/elec/${cour.cours}/${section.subSection}`),
                  })
                : await client.send('Page.setDownloadBehavior', {
                      behavior: 'allow',
                      downloadPath: path.join(__dirname, `../../Newdownload/elec/${cour.cours}`),
                  });
            client.on('Network.responseReceived', async ({ response, requestId }) => {
                const cd = String(response.headers['content-disposition'] || '').toLowerCase();
                if (cd.includes('attachment')) {
                    inflight.add(requestId);
                    await client.send('Network.getResponseBody', { requestId });
                    inflight.delete(requestId);
                }
            });
            for (const url of section.url) {
                if (url == undefined) continue;
                await DlPage.goto(`${url}&lang=fr`, { waitUntil: 'networkidle2' });
                await DlPage.waitForSelector("a[href^='https://0680034t.moodle.monbureaunumerique.fr/pluginfile.php']");
                await DlPage.evaluate(() => {
                    const link = document.querySelector(
                        "a[href^='https://0680034t.moodle.monbureaunumerique.fr/pluginfile.php']"
                    ) as HTMLAnchorElement;
                    if (link) {
                        link.setAttribute('target', '_self');
                        link.setAttribute('download', '');
                        link.setAttribute('onclick', 'return true;');
                        link.click();
                    }
                });
                await DlPage.waitForNetworkIdle();
            }
            await DlPage.close();
        }
    }
}
