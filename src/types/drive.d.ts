export namespace GoogleDrive {
    export interface File {
        id: string;
        name: string;
        mimeType: string;
        kind?: string;
    }

    export interface DriverResponse {
        files: File[];
        incompleteSearch: boolean;
        kind: string;
        nextPageToken?: string;
    }
}
