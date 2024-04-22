import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getDb } from '../services/db';
import { verifyToken } from '../services/jwt';
import { makeUseCode } from '../services/useCode';

interface Passport {
    companyId: string;
    passportName: string;
    locked: boolean;
    files: string[];
    linkedArr: string[];
    created: number;
    useCode?: string;
}

export async function postPassport(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const token = verifyToken(request.headers.get('Authorization'));

        const companyId = token.companyId;
        if (!companyId) {
            return { status: 400, body: 'Bad Request' };
        }

        let body: Passport = (await request.json()) as Passport;
        if (!body || !body.passportName) {
            return { status: 400, body: 'Bad Request' };
        }

        let passport: Passport = {
            companyId: companyId,
            passportName: body.passportName,
            locked: body.locked || false,
            files: body.files || [],
            linkedArr: body.linkedArr || [],
            created: Date.now(),
        };

        if (passport.locked) {
            passport.useCode = await makeUseCode();
        }

        const db = await getDb();
        await db.collection('passports').insertOne(passport);

        return { body: 'saved successfully' };
    } catch (err) {
        console.error(err);
        return { status: 500, body: err };
    }
}

app.http('postPassport', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'passports',
    handler: postPassport,
});
