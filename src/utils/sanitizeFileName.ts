/**
 * Nettoie un nom de fichier/dossier pour le rendre compatible avec tous les systèmes de fichiers
 * Supprime les caractères invalides sur Windows : < > : " / \ | ? * et les emojis
 * @param name Le nom à nettoyer
 * @returns Le nom nettoyé
 */
export function sanitizeFileName(name: string): string {
    return (
        name
            // Supprime les caractères invalides Windows : < > : " / \ | ? *
            .replace(/[<>:"/\\|?*]/g, '')
            // Supprime les emojis et autres caractères Unicode spéciaux
            .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
            .replace(/[\u{2600}-\u{26FF}]/gu, '')
            .replace(/[\u{2700}-\u{27BF}]/gu, '')
            // Supprime les espaces multiples
            .replace(/\s+/g, ' ')
            // Trim les espaces en début et fin
            .trim()
    );
}
