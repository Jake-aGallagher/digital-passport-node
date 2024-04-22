export async function makeUseCode() {
    const { generate } = await import('random-words');
    let useCode = generate(4);
    if (Array.isArray(useCode)) {
        useCode = useCode.join('-');
    }
    return useCode;
}
