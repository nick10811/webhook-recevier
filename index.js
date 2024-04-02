const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    console.log('received a webhook:', req.body);
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`webhook receiver listening on port ${PORT}`);
});