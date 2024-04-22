import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getDb } from '../services/db';
import { Document, ObjectId } from 'mongodb';
import { makeToken } from '../services/jwt';
import { hashPassword } from '../services/hash';

interface RequestBody {
    companyName: string;
    email: string;
    username: string;
    password: string;
}

interface Company extends Document {
    _id?: ObjectId;
    companyName: string;
}

interface User extends Document {
    _id?: ObjectId;
    username: string;
    password: string;
    email: string;
    companyId: string | null;
}

export async function signup(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        let body: RequestBody = (await request.json()) as RequestBody;
        if (!body || !body.companyName || !body.email || !body.username || !body.password) {
            return { status: 400, body: 'Bad Request' };
        }
        let company: Company = {
            companyName: body.companyName,
        };
        const password = await hashPassword(body.password);
        let user: User = {
            username: body.username,
            password: password,
            email: body.email,
            companyId: null,
        };

        const db = await getDb();
        const companyId = (await db.collection('companies').insertOne(company)).insertedId.toHexString();
        user.companyId = companyId;
        const userId = (await db.collection('users').insertOne(user)).insertedId.toHexString();
        const token = makeToken(companyId, userId);

        return { body: JSON.stringify({ companyId, userId, token }) };
    } catch (err) {
        console.error(err);
        return { status: 500, body: err };
    }
}

app.http('signup', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'signup-company',
    handler: signup,
});
