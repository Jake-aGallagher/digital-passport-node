import { getDb } from './db';

export async function getLinkedArr(linkedStrings: string[]) {
    if (!linkedStrings || linkedStrings.length === 0) {
        return {};
    }
    let linkedList: { [key: string]: string } = {};
    const db = await getDb();
    const query = { useCode: { $in: linkedStrings } };
    const passports = await db.collection('passports').find(query).toArray();
    passports.forEach((passport) => {
        linkedList[passport._id.toHexString()] = passport.useCode;
    });
    return linkedList;
}
