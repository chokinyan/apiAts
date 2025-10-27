import { Browser, Page } from 'puppeteer';

export namespace MechanicCours {
    /**
     * Structure représentant un cours de génie mécanique (non utilisée actuellement)
     */
    export interface MechType {
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
     * Représente un lien vers un dossier Moodle
     */
    export interface MechaLinkList {
        /** Titre du dossier */
        title: string;
        /** URL du dossier sur Moodle */
        url: string;
    }

    /**
     * Télécharge tous les cours de génie mécanique depuis Moodle MBN
     * @param browser Instance du navigateur Puppeteer
     * @param inflight Set pour tracker les téléchargements en cours
     * @param pageMeca Page Moodle déjà authentifiée
     */
    export function downloadMechanicCours(browser: Browser, inflight: Set<string>, pageMeca: Page): Promise<void>;
}
