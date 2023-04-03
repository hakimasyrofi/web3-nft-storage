import { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';
import axios from 'axios';

const ABI  = require('./abi.json');
const contractAddress = '0x1F65c807d512A49854c246b7568E48D5519b2d38';
const web3 = new Web3(window.ethereum);
const NFTContract = new web3.eth.Contract(ABI, contractAddress);
const fileName = '1.png' //file in folder server.js

function App() {
  const [account, setAccount] = useState('')

  useEffect(()=>{
    onConnect()
  }, [])

  const onConnect = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAccount = await web3.eth.getAccounts();
      setAccount(userAccount[0]);

    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
}

async function addToWeb3Storage() {
  const response = await axios.post('http://localhost:3001/storeImage', {
    file: fileName,
  });

  console.log(response);
  return response.data.cid;
}

  const sendTicket = async () => {
    const cid = await addToWeb3Storage();
    console.log(cid)
    const uri = cid+'.ipfs.w3s.link/'+fileName
    console.log(uri)
    return NFTContract.methods.sendTicket(account, uri).send({ from: account })
    .once('receipt', async (receipt: any) => {
      console.log(receipt);
      onConnect();
    })
    .catch((e: any) => {
      console.log(e);
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={async()=>await sendTicket()}>Add File to Web3 Storage 2</button>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;