const { app } = require('@azure/functions');

app.http('TestApi', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'TestApi',
    handler: async (request, context) => {
        context.log('TestApi endpoint called');
        
        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: 'API fungerar!',
                timestamp: new Date().toISOString()
            })
        };
    }
});
