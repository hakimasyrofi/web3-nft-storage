import { useEffect, useState } from 'react';
import './App.css';
import Web3 from 'web3';
import axios from 'axios';

const ABI  = require('./abi.json');
const contractAddress = '0xE1A2c62917BD0A41D02d8Ae8eA98cECDC117a777';
const web3 = new Web3(window.ethereum);
const NFTContract = new web3.eth.Contract(ABI, contractAddress);
const fileName = '1.png' // upload image file in folder server.js to IPFS
const fileDirectory = 'images/'+fileName

function App() {
  const [account, setAccount] = useState('')
  const [tokenImage, setTokenImage] = useState(['']);

  useEffect(()=>{
    onConnect()
  }, [])

const onConnect = async () => {
  if (window.ethereum) {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const userAccount = await web3.eth.getAccounts();
    setAccount(userAccount[0]);
    await getUserTokenURI(userAccount[0]);

  } else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
}

async function addToWeb3Storage() {
  const response = await axios.post('http://localhost:3001/storeImage', {
    file: fileDirectory,
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

const getTokenURI = async (address: string, id: number) => {
  const tokenId = await NFTContract.methods.tokenOfOwnerByIndex(address, id).call()
  let tokenMetadataURI = await NFTContract.methods.tokenURI(tokenId).call()
  return tokenMetadataURI
}

const getUserTokenURI = async(address: string) => {
  const tokenBalance = await NFTContract.methods.balanceOf(address).call()
  let promises = []
  for(let i = 0; i < tokenBalance; i++){
    promises.push(getTokenURI(address, i))
  }
  let tempArray: string[] = []
  Promise.all(promises)
  .then((results) => {
    for (let i=0; i <results.length; i++){
      tempArray.push(results[i])
    }
    setTokenImage(tempArray)
  })
  .catch((err) => console.log(err))
}

  return (
    <div className="App">
      <header className="App-header">
        <button className='button-mint' onClick={async()=>await sendTicket()}>Mint Token</button>
        {tokenImage.length !== 0 ?
          tokenImage.map(nft =>(
            <img src={nft} className="App-logo nft-image" alt="logo" />
          ))
          :
          <p>Account Has Not Mint Any Token Yet</p>
        }
      </header>
    </div>
  );
}

export default App;