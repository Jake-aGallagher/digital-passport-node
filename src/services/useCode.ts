import * as randomWords from "random-word-slugs";

export async function makeUseCode() {
    let useCode = randomWords. generateSlug(4);
    if (Array.isArray(useCode)) {
        useCode = useCode.join('-');
    }
    return useCode;
}
