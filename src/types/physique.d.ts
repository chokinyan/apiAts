export namespace Physique {
    /**
     * Interface représentant un cours de physique avec ses fichiers associés
     */
    export interface PhysiqueCours {
        downloadFiles(): Promise<void>;
        addFile(fileUrl: string): void;
        setDescription(desc: string): void;
        setName(courseName: string): void;
        getName(): string;
        getDescription(): string | undefined;
        getFiles(): Array<string>;
    }

    /**
     * Télécharge tous les cours de physique depuis alexandrediet.net
     */
    export function downloadPhysique(): Promise<void>;
}
