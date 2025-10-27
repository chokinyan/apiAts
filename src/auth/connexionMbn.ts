import dotenv from 'dotenv';
import { Browser, Page } from 'puppeteer';

dotenv.config({ quiet: true });

async function connexionMbn(launcher: Browser): Promise<Page> {
    const page = await launcher.newPage();
    await page.goto(
        'https://cas.monbureaunumerique.fr/login?service=https%3A%2F%2Fwww.monbureaunumerique.fr%2Fsg.do%3FPROC%3DIDENTIFICATION_FRONT',
        { waitUntil: 'networkidle2' }
    );
    await page.waitForSelector('.form__label');
    await page.click(".form__label[for='idp-EDU']");
    await page.click('#button-submit');
    await page.waitForSelector('#bouton_eleve');
    await page.click('#bouton_eleve');
    await page.waitForSelector('#username');
    await page.type('#username', process.env.MBN_USERNAME);
    await page.type('#password', process.env.MBN_PASSWORD);
    await page.click('#bouton_valider');
    if (await page.$('div[id="dateNaissance"]')) {
        await page.waitForSelector('div[id="dateNaissance"]');
        await page.type('input[name="jour"]', process.env.MBN_JOUR_ANNIV);
        await page.type('input[name="mois"]', process.env.MBN_MOIS_ANNIV);
        await page.type('input[name="annee"]', process.env.MBN_ANNEE_ANNIV);
        await page.click('button[id="submit-button"]');
    }

    // Attendre que la redirection soit complète et que la page soit chargée
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {
        console.log('Navigation timeout, continuing anyway...');
    });

    // Naviguer vers Moodle pour établir la session sur ce domaine
    try {
        await page.goto('https://0680034t.moodle.monbureaunumerique.fr/', {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });
        console.log('Session Moodle établie');
    } catch (error) {
        console.log("Erreur lors de l'établissement de la session Moodle:", error);
    }

    return page;
}

export { connexionMbn };
