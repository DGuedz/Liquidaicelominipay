
import https from 'https';

const domains = [
  "alfajores-forno.celo-testnet.org",
  "celo-alfajores.infura.io",
  "testnet.mento.org"
];

domains.forEach(domain => {
  const options = {
    hostname: domain,
    port: 443,
    path: '/',
    method: 'HEAD'
  };

  const req = https.request(options, res => {
    console.log(`${domain}: ${res.statusCode}`);
  });

  req.on('error', error => {
    console.error(`${domain}: ${error.message}`);
  });

  req.end();
});
