const { app } = require('@azure/functions');

/**
 * GetRoles - Custom authentication endpoint for Azure Static Web Apps
 * Returns an empty array of roles, which means users will only get the built-in "authenticated" role
 * This is sufficient for basic authentication without custom role mapping
 */
app.http('GetRoles', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'GetRoles',
    handler: async (request, context) => {
        context.log('GetRoles endpoint called for Static Web App authentication');
        
        // SWA expects an array of role names as JSON
        // Returning empty array means users only get the "authenticated" role
        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([])
        };
    }
});
