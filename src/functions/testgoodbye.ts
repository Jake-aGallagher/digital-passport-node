import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function testgoodbye(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Goodbye, ${name}!` };
};

app.http('testgoodbye', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: testgoodbye
});
