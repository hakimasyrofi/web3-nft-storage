require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const { Web3Storage, getFilesFromPath } = require('web3.storage');

const app = express();
const port = 3001;
const token = process.env.TOKEN

app.use(cors());
app.use(bodyParser.json())

app.post('/storeImage', async (req, res) => {
    console.log(req.body)
    const data = req.body;

    if (token){
      const storage = new Web3Storage({ token })
      const files = await getFilesFromPath(data.file)
      const response = await storage.put(files)
      if (response) {
        res.send({ cid: response });
      } else {
        res.send({ cid: '' });
      }
    }
    else {
      console.log("API Token empty");
    }
});
    

app.listen(port, () => {
    console.log('Listening for reqs');
});