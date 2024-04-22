import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

const secret = process.env.SECRETKEY;

export function makeToken(companyId: string, userId: string) {
    if (!secret) {
        throw new Error('No secret key');
    }
    return jwt.sign({ companyId, userId }, secret);
}

export function verifyToken(token: string | null) {
    if (!token) {
        throw new Error('No token');
    }
    if (!secret) {
        throw new Error('No secret key');
    }
    const tokenData = jwt.verify(token, secret);
    if (typeof tokenData === 'string' || !tokenData.companyId || !tokenData.userId) {
        throw new Error('Invalid token');
    }
    return tokenData;
}
