import { BlobServiceClient } from '@azure/storage-blob';

let filesClient: BlobServiceClient | null = null;

export function getFilesClient() {
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
    }
    if (!filesClient) {
        filesClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    }
    return filesClient;
}
