import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { verifyToken } from '../services/jwt';
import { BlobServiceClient, ContainerSASPermissions } from '@azure/storage-blob';

export async function getSASToken(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        verifyToken(request.headers.get('Authorization'));

        const reqType = request.params.type;
        if (!reqType) {
            return { status: 400, body: 'Bad Request' };
        }
        let permissionsString: string;
        let filename = '';
        if (reqType === 'read') {
            permissionsString = 'r';
            filename = request.params.filename;
        } else if (reqType === 'write') {
            permissionsString = 'w';
        } else {
            return { status: 400, body: 'Bad Request' };
        }

        if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
            return { status: 500, body: 'Internal Server Error' };
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient('documents');

        let sasToken = '';
        let permissions = ContainerSASPermissions.parse(permissionsString);
        const expiresOn = new Date(Date.now() + 300000000);
        if (reqType === 'read') {
            const blobClient = containerClient.getBlobClient(filename);
            sasToken = await blobClient.generateSasUrl({ permissions, expiresOn });
        } else {
            sasToken = await containerClient.generateSasUrl({ permissions, expiresOn });
        }

        return { body: sasToken };
    } catch (err) {
        console.error(err);
        return { status: 500, body: err };
    }
}

app.http('getSASToken', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'getSASToken/{type}/{filename}',
    handler: getSASToken,
});
