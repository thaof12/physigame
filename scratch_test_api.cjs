const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5002/api/users/firebase/d7516a7a-e234-4017-a6c1-7f4a02b59cdc');
    console.log('API RESPONSE STATUS:', res.status);
    console.log('API RESPONSE DATA:', res.data);
  } catch (err) {
    console.error('API ERROR:', err.message);
    if (err.response) {
      console.error('API ERROR RESPONSE STATUS:', err.response.status);
      console.error('API ERROR RESPONSE DATA:', err.response.data);
    }
  }
}

test();
