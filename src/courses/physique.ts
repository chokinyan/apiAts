import fs from 'fs';
import axios from 'axios';
import { load } from 'cheerio';
import { Physique } from '../types/physique';
import { sanitizeFileName } from '../utils/sanitizeFileName';

class PhysiqueCours implements Physique.PhysiqueCours {
    #name: string;
    #description?: string;
    #files: Array<string>;
    constructor(name: string, description?: string, files: Array<string> = []) {
        this.#name = sanitizeFileName(name);
        this.#description = description;
        this.#files = files;
    }

    async downloadFiles() {
        if (!fs.existsSync(`Newdownload/physique`)) {
            fs.mkdirSync(`Newdownload/physique`);
        }
        const sanitizedName = sanitizeFileName(this.#name);
        if (!fs.existsSync(`Newdownload/physique/${sanitizedName}`)) {
            fs.mkdirSync(`Newdownload/physique/${sanitizedName}`);
        }
        for (const file of this.#files) {
            const fileResponse = await axios.get(file, { responseType: 'arraybuffer' }).catch((err) => {
                console.log(err);
            });
            if (!fileResponse) return;
            const fileName = sanitizeFileName(file.split('/').pop() || 'file.pdf');
            fs.writeFileSync(`Newdownload/physique/${sanitizedName}/${fileName}`, fileResponse.data);
            console.log(`Fichier ${fileName} téléchargé avec succés !`);
        }
    }

    addFile(file: string) {
        this.#files.push(file);
    }

    setDescription(description: string) {
        this.#description = description;
    }

    setName(name: string) {
        this.#name = name;
    }

    getName() {
        return this.#name;
    }

    getDescription() {
        return this.#description;
    }

    getFiles() {
        return this.#files;
    }
}

async function downloadPhysique(): Promise<void> {
    const cours: Array<PhysiqueCours> = [];
    const reponse = await axios.get('https://alexandrediet.net/?p=223').catch((err) => {
        console.log(err);
    });
    if (!reponse) return;
    const $ = load(reponse.data);
    const mainContent = $('.entry-content')[0].children as unknown as Array<any>;
    let coursCount = 0;

    for (let i = 2; i < mainContent.length; i++) {
        if ($(mainContent[i]).attr()?.class?.includes('wp-block-heading')) {
            coursCount++;
            cours.push(new PhysiqueCours($(mainContent[i]).text().trim()));
        }
        if ($(mainContent[i]).attr()?.class?.includes('wp-block-columns')) {
            $(mainContent[i])
                .find('.wp-block-file')
                .each((_, file) => {
                    cours[coursCount - 1].addFile($(file).children()[0].attribs.href);
                });
        }
        if ($(mainContent[i]).attr()?.class?.includes('wp-block-file')) {
            cours[coursCount - 1].addFile($(mainContent[i]).children()[0].attribs.href);
        }
        if ($(mainContent[i]).attr()?.class == undefined && $(mainContent[i]).text().trim() != '') {
            cours[coursCount - 1].setDescription($(mainContent[i]).text().trim());
        }
    }
    for (const cour of cours) {
        await cour.downloadFiles();
    }
}

export { downloadPhysique };
