module.exports = async function (context, req) {
    context.log('TestApi endpoint called');
    
    context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { 
            message: 'API fungerar!',
            timestamp: new Date().toISOString()
        }
    };
};
