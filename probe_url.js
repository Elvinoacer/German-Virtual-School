const https = require('https');
const hash = '9d6ad21cbbceab97458517b147a6a09ff43aa735';
const platforms = ['debian-openssl-3.0.x', 'linux-openssl-3.0.x', 'rhel-openssl-3.0.x'];
const files = ['query-engine.gz', 'schema-engine.gz', 'libquery_engine.so.node.gz'];

files.forEach(file => {
  platforms.forEach(platform => {
    const url = `https://binaries.prisma.sh/all_commits/${hash}/${platform}/${file}`;
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      console.log(`${res.statusCode} ${url}`);
    });
    req.on('error', (e) => console.error(e));
    req.end();
  });
});
