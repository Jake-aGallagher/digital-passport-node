import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getDb } from '../services/db';
import { Document, ObjectId } from 'mongodb';
import { comparePassword } from '../services/hash';
import { makeToken } from '../services/jwt';

interface RequestBody {
    username: string;
    password: string;
}

interface User extends Document {
    _id?: ObjectId;
    username: string;
    password: string;
    companyId: string;
}

export async function login(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        let body: RequestBody = (await request.json()) as RequestBody;
        if (!body || !body.username || !body.password) {
            return { status: 400, body: 'Bad Request' };
        }

        const db = await getDb();

        const query = { username: body.username };
        const user: User = (await db.collection('users').findOne(query)) as User;
        if (!user || !user.password || !user.username) {
            return { status: 401, body: 'Unauthorized' };
        }
        const passwordMatch = await comparePassword(body.password, user.password);
        if (!passwordMatch) {
            return { status: 401, body: 'Unauthorized' };
        }
        const token = makeToken(user.companyId, user._id.toHexString());

        return { body: JSON.stringify({ token, companyId: user.companyId, userId: user._id.toHexString() }) };
    } catch (err) {
        console.error(err);
        return { status: 500, body: err };
    }
}

app.http('login', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: login,
});
