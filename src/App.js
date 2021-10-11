import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import myEpicNft from './utils/MyEpicNFT.json';

//constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-ompmlnepzk';
const CONTRACT_ADDRESS = "0x08a9fD20b5f9a233771E3Ea4CEB66fD427b21927";



const App = () => {

//state variables
const [currentAccount, setCurrentAccount] = useState("");
const [mining, setMining] = useState(false);
const [transactionUrl, setTransactionUrl] = useState("");
const [totalMinted, setTotalMinted] = useState(0);
const [totalSupply, setTotalSupply] = useState(0);
const [correctNetwork, setCorrectNetwork] = useState(false);

  

  const checkIfWalletIsConnected = async () => {
    /*
    * Checking to see if we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)

      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
    let chainId = await ethereum.request({method: 'eth_chainId'});
    console.log("Connected to chain:" + chainId);
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId){
      alert("You are not connected to the Rinkeby Testnet!");
      
    }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum && correctNetwork) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        connectedContract.totalMinted().then((data) => {
          console.log('totalMinted');
          console.log(data);
          if (data)
            setTotalMinted(data.toNumber());
        })

        connectedContract.totalSupply().then((data) => {
          console.log('totalMinted');
          console.log(data);
          if (data)
            setTotalMinted(data.toNumber());
        })

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        setMining(true);
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();
        setMining(false);
        setTransactionUrl(`https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        console.log(nftTxn);
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  const checkCorrectNetwork = async() => {
    const {ethereum} = window;
    let chainId = await ethereum.request({method: 'eth_chainId'});
    console.log("Connected to chain:" + chainId);
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId){
      alert("You are not connected to the Rinkeby Testnet!");
      setCorrectNetwork(false);
    }
    else {
      setCorrectNetwork(true);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    checkCorrectNetwork();
  }, [])

  

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">New League Emotes</p>
          <p className="sub-text">
            Generate New Random Twitch.tv emotes for League!
          </p>
          {correctNetwork && (
            <>
              {currentAccount === "" ? (
                <button onClick={connectWallet} className="cta-button connect-wallet-button">
                  Connect to Wallet
                </button>
              ) : (
                <button onClick={askContractToMintNft} className="cta-button connect-wallet-button"
                  disabled={mining}>
                  {mining ? 'Minting NFT...' : 'Mint NFT'}
                </button>
              )}

              {totalMinted && totalSupply && <p className="sub-text">
                {totalMinted}/{totalSupply} NFTs minted so far
              </p>}
            </>
          )}

          {!correctNetwork && <p className="sub-text">** Please connect to the Rinkeby Testnet **</p>}
        </div>
        <div>
          {transactionUrl && <a
            className="footer-text"
            href={transactionUrl}
            target="_blank"
            rel="noreferrer"
          >See transaction URL in rinkeby.etherscan.io</a>}
        </div>
        <div>
          🌊 <a className="footer-text" href={OPENSEA_LINK} target="_blank" rel="noreferrer">View Collection on OpenSea</a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;