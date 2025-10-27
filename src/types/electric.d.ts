import { Browser, Page } from 'puppeteer';

export namespace ElectricCours {
    /**
     * Structure représentant un cours de génie électrique avec ses sections et fichiers
     */
    export interface ElecType {
        /** Nom du cours */
        cours?: string;
        /** URL du cours sur Moodle */
        CoursUrl?: string;
        /** Liste des URLs de sections */
        section?: Array<string>;
        /** Fichiers organisés par sous-section */
        files?: Array<FileSection>;
    }

    /**
     * Représente une section de fichiers avec une sous-section optionnelle
     */
    export interface FileSection {
        /** Nom de la sous-section (optionnel) */
        subSection?: string;
        /** Liste des URLs de fichiers */
        url: Array<string | undefined>;
    }

    /**
     * Télécharge tous les cours de génie électrique depuis Moodle MBN
     * @param browser Instance du navigateur Puppeteer
     * @param inflight Set pour tracker les téléchargements en cours
     * @param pageMoodle Page Moodle déjà authentifiée
     */
    export function downloadElectricCours(browser: Browser, inflight: Set<string>, pageMoodle: Page): Promise<void>;
}
