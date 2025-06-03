import express from 'express';
import { exec } from 'child_process';

const app = express();
app.use(express.json());

const TOKEN = 'abc123'; // optional

app.post('/webhook', (req, res) => {
  const token = req.query.token;
  if (token !== TOKEN) {
    return res.status(403).send('Invalid token');
  }

  // Pull latest image and restart container
  exec('docker pull yourdockerhubusername/frontend-app && docker stop my-app && docker rm my-app && docker run -d --name my-app -p 3000:3000 yourdockerhubusername/frontend-app', 
  (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating');
    }
    res.send('Updated!');
  });
});

app.listen(9000, () => {
  console.log('Webhook server listening on port 9000');
});
