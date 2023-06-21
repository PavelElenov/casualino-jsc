const fetch = require('node-fetch');
const APIURL = 'http://localhost:3000';

async function get(url, token) {
    let fetchInit = {
        method: "GET",
        headers: {}
    };

    if (token) {
        fetchInit.headers['Authorization'] = token;
    };

    const res = await fetch(`${APIURL}${url}`, fetchInit);
    return res;
};

async function post(url, data, token) {
    let fetchInit = {
        method: "POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    };

    if (token) {
        fetchInit.headers['Authorization'] = token;
    }

    const response = await fetch(`${APIURL}${url}`, fetchInit);
    return response;
}

module.exports = {
    get,
    post
}