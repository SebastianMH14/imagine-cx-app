const axios = require("axios");

const username = process.env.CXUSERNAME;
const password = process.env.CXPASSWORD;

console.log(username, password);

const base64Credentials = Buffer.from(
  `${username}:${password}`,
  "utf-8"
).toString("base64");

const config = {
  headers: {
    Authorization: `Basic ${base64Credentials}`,
    "Content-Type": "application/json",
  },
};

async function fetch(url, body) {
  try {
    const response = await axios.get(url, config);
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(
        `Request failed with status code ${response.status} in ${url}`
      );
    }
  } catch (error) {
    console.log(`Error making request: ${error.message} in ${url}`);
  }
}

async function post(url, body) {
  try {
    const response = await axios.post(url, body, config);

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`Request failed with status code ${response.status}`);
    }
  } catch (error) {
    console.log(`Error making request: ${error.message}`);
  }
}

async function patch(url, body) {
  try {
    const response = await axios.patch(url, body, config);

    if (response.status >= 200 && response.status < 300) {
      return response.status;
    } else {
      throw new Error(`Request failed with status code ${response.status}`);
    }
  } catch (error) {
    console.log(`Error making request: ${error.message}`);
  }
}

async function deleteContact(id) {
  try {
    const response = await axios.delete(
      `https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts/${id}`,
      config
    );

    if (response.status >= 200 && response.status < 300) {
      return response.status;
    } else {
      throw new Error(`Request failed with status code ${response.status}`);
    }
  } catch (error) {
    console.log(`Error making request: ${error.message}`);
  }
}

module.exports = { fetch, post, patch, deleteContact };
