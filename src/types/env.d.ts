declare namespace NodeJS {
    export interface ProcessEnv {
        // Authentification MBN
        MBN_USERNAME: string;
        MBN_PASSWORD: string;
        MBN_JOUR_ANNIV: string;
        MBN_MOIS_ANNIV: string;
        MBN_ANNEE_ANNIV: string;

        // Google Drive API
        GOOGLE_DRIVE_API_KEY: string;

        // Server
        PORT?: string;
    }
}
