const axios = require('axios');


const username = 'ICXCandidate';
const password = 'Welcome2021';

const base64Credentials = Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');

const config = {
    headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json',
    },
};


async function fetch(url, body) {
    try {
        const response = await axios.get(url, config);

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            throw new Error(`Request failed with status code ${response.status}`);
        }
    } catch (error) {
        // Manejar errores de red, timeout, etc.
        throw new Error(`Error making request: ${error.message}`);
    }
}
