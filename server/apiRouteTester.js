const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Change if your server runs elsewhere

// List your API routes here
const routes = [
    { method: 'get', path: '/api/route1' },
    { method: 'post', path: '/api/route2', data: { /* sample payload */ } },
    { method: 'put', path: '/api/route3/1', data: { /* sample payload */ } },
    { method: 'delete', path: '/api/route4/1' },
    // ...add all your routes here
];

async function testRoute(route) {
    try {
        const url = BASE_URL + route.path;
        let response;
        switch (route.method) {
            case 'get':
                response = await axios.get(url);
                break;
            case 'post':
                response = await axios.post(url, route.data || {});
                break;
            case 'put':
                response = await axios.put(url, route.data || {});
                break;
            case 'delete':
                response = await axios.delete(url);
                break;
            default:
                throw new Error(`Unsupported method: ${route.method}`);
        }
        console.log(`[PASS] ${route.method.toUpperCase()} ${route.path} - Status: ${response.status}`);
    } catch (error) {
        if (error.response) {
            console.log(`[FAIL] ${route.method.toUpperCase()} ${route.path} - Status: ${error.response.status}`);
        } else {
            console.log(`[ERROR] ${route.method.toUpperCase()} ${route.path} - ${error.message}`);
        }
    }
}

async function runTests() {
    for (const route of routes) {
        await testRoute(route);
    }
}

runTests();
