import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getDb } from '../services/db';
import { verifyToken } from '../services/jwt';

export async function getPassports(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        verifyToken(request.headers.get('Authorization'));

        const companyId = request.params.companyid;
        if (!companyId) {
            return { status: 400, body: 'Bad Request' };
        }

        const db = await getDb();
        const query = { companyId: companyId };
        const passports = await db.collection('passports').find(query).sort({ created: -1 }).toArray();

        return { body: JSON.stringify({ passports }) };
    } catch (err) {
        console.error(err);
        return { status: 500, body: err };
    }
}

app.http('getPassports', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'passports/{companyid}',
    handler: getPassports,
});
