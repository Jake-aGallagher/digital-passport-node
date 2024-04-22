import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getDb } from '../services/db';
import { verifyToken } from '../services/jwt';
import { makeUseCode } from '../services/useCode';
import { ObjectId } from 'mongodb';

interface Passport {
    passportName: string;
    locked: boolean;
    files: string[];
    linkedArr: string[];
    created: number;
    useCode?: string;
}

export async function putPassport(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        verifyToken(request.headers.get('Authorization'));

        const db = await getDb();
        let passport = await db.collection('passports').findOne({ _id: new ObjectId(request.params.passportid) });
        if (!passport) {
            return { status: 404, body: 'Not Found' };
        }
        if (passport.locked) {
            return { status: 403, body: 'Forbidden' };
        }

        let body: Passport = (await request.json()) as Passport;
        if (!body || !body.passportName) {
            return { status: 400, body: 'Bad Request' };
        }
        console.log('body: ', body);
        passport.passportName = body.passportName;
        passport.files = body.files;
        passport.linkedArr = body.linkedArr;
        passport.locked = body.locked;
        if (passport.locked) {
            passport.useCode = await makeUseCode();
        }

        const query = { _id: new ObjectId(request.params.passportid) };
        const update = { $set: passport };
        await db.collection('passports').updateOne(query, update);

        return { body: 'saved successfully' };
    } catch (err) {
        console.error(err);
        return { status: 500, body: err };
    }
}

app.http('putPassport', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'passports/{passportid}',
    handler: putPassport,
});
