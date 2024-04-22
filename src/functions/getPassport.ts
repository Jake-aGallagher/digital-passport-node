import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getDb } from '../services/db';
import { verifyToken } from '../services/jwt';
import { getLinkedArr } from '../services/getLinkedArr';
import { ObjectId } from 'mongodb';

export async function getPassport(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        verifyToken(request.headers.get('Authorization'));

        const passportId = request.params.passportid;
        if (!passportId) {
            return { status: 400, body: 'Bad Request' };
        }

        const db = await getDb();
        const query = { _id: new ObjectId(passportId) };
        const passport = await db.collection('passports').findOne(query);
        if (!passport) {
            return { status: 404, body: 'Not Found' };
        }
        const linked = await getLinkedArr(passport.linkedArr);

        return { body: JSON.stringify({ passport, linked }) };
    } catch (err) {
        console.error(err);
        return { status: 500, body: err };
    }
}

app.http('getPassport', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'passports/passport/{passportid}',
    handler: getPassport,
});
