require('dotenv').config();
const axios = require('axios');

async function test() {
  const key = process.env.TWELVE_DATA_KEY;
  console.log('Key:', key ? key.slice(0,8) + '...' : 'YOK');

  try {
    const resp = await axios.get('https://api.twelvedata.com/price', {
      params: { symbol: 'AAPL,TSLA', apikey: key },
      timeout: 10000,
    });
    console.log('Status:', resp.status);
    console.log('Response:', JSON.stringify(resp.data));
  } catch(e) {
    console.error('HATA:', e.message);
    if (e.response) console.error('Yanit:', JSON.stringify(e.response.data));
  }
}

test();
