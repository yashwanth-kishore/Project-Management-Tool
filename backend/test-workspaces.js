const jwt = require("jsonwebtoken");
const http = require("http");
require("dotenv").config();

const token = jwt.sign({ id: 2 }, process.env.JWT_SECRET, { expiresIn: '1h' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/workspaces',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => { 
    console.log("Status:", res.statusCode); 
    console.log("Body:", data); 
  });
});
req.on('error', error => console.error(error));
req.end();
