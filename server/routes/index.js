var express = require('express');
var Web3 = require('web3');
var Tx = require('ethereumjs-tx')
//var web3Functions = require('./functions.js');
var router = express.Router();
var httpProviderUrl = "https://ropsten.infura.io/v3/993f7838ddda4a839bf45115b9142a97"
var contractAddress = ""
var web3 = new Web3(Web3.providers.HttpProvider(httpProviderUrl));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/*
	/createChannel - send keystore of sender, receivers's address,amount in ethers
*/

router.post('/encryptKey',(req,res,next)=>{
  var data = req.body;
  var privKey = data.key;
  var password = data.password;
  var web3 = new Web3(Web3.providers.HttpProvider(httpProviderUrl));
  var encryptedKey = web3.eth.accounts.encrypt(privKey, password)
    res.send(encryptedKey);
})

router.post('/createChannel',(req,res,next)=>{
  //creds contains the decrypted keystore.
  var creds = req.body;
  //amount in ethers, i.e amount = 2; 2 ethers nu koduka venam.
  var amount = creds.amount;
  var keyStore = creds.keyStore;
  var receiver = creds.receiver;
  var password = creds.password;
  var web3 = new Web3(Web3.providers.HttpProvider(httpProviderUrl));

  var amountInWei = web3.utils.toWei(amount);
  var contractInstance = new web3.eth.Contract(abi,contractAddress);
  var txData = contractInstance.methods.createChannel(sender, receiver);
  var txDataEncoded = txData.encodeABI();

  var decryptedAccount = web3.eth.accounts.decrypt(keyStore, password)
  	var sender = decryptedAccount.address;
  	var key = new Buffer(decryptedAccount.privateKey, 'hex');
  	web3.eth.getTransactionCount(sender).then(txCount=>{
  	  var rawTx = {
  	  	from: sender,
  	  	to: contractAddress,
  	  	nonce: count,
  	  	data: txDataEncoded,
  	  	gasPrice: 210000,
          gasLimit: 60000000000,
  	  }
  	  var tx = new Tx(rawTx);
  	  tx.sign(key);

  	  var serializedTx = tx.serialize();
  	  web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt',(receipt)=>{
  	  	res.send(receipt);
  	  });
    });
});

router.post('/signTransaction',(req,res,next)=>{
  var creds = req.body;
  var amount = creds.amount;
  var keyStore = creds.keyStore;
  var password = creds.password;

  var web3 = new Web3(Web3.providers.HttpProvider(httpProviderUrl));

  var amountWei = web3.utils.toWei(amount);
  var decryptedAccount = web3.eth.accounts.decrypt(keyStore, password);
  var key = decryptedAccount.privateKey;
  var signature = web3.eth.accounts.sign(amountWei, key)
  res.send(signature);
  

});

router.get('/verifyAmount',(req,res,next)=>{
  var amount = req.query.amount;
  var amountInEthers = web3.utils.toWei(amount);
  var amountHash = web3.eth.accounts.hashMessage(amountInEthers);
  console.log(amountHash)
  res.send(amountHash);
})

router.post('/withdraw',(req,res,next)=>{
  var data = req.body;
  var keyStore = data.keyStore;
  var password = data.password;
  var channelId = data.channelId;
  var amountHash = data.amountHash;
  var amount = data.amount;	
  
  var contractInstance = new web3.eth.Contract(abi, contractAddress);
  var web3 = new Web3(Web3.providers.HttpProvider(httpProviderUrl));
  var r = data.r;
  var s = data.s;
  var v = data.v;
  var signature = data.signature;
  
  var txData = contractInstance.methods.withdraw(channelId, amount, signature, r, s, v);
  var txDataEncoded = txData.encodeABI();

  var decryptedAccount = web3.eth.accounts.decrypt(keyStore, password)
  var sender = decryptedAccount.address;
  var key = new Buffer(decryptedAccount.privateKey, 'hex');
  web3.eth.getTransactionCount(sender).then(txCount=>{
    var rawTx = {
    	from: sender,
    	to: contractAddress,
    	nonce: count,
    	data: txDataEncoded,
    	gasPrice: 210000,
      gasLimit: 60000000000,
    }
    var tx = new Tx(rawTx);
    tx.sign(key);
    var serializedTx = tx.serialize();
    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt',(receipt)=>{
    	res.send(receipt);
    });
  });
});

router.post('/addEther',(req, res, next)=>{
  var creds = req.body.creds;
  var channelId = data.channelId;
  var privKey  //get keystore then extract the privatekey 
  var provider = new walletProvider(privKey, httpProviderUrl)
  var web3 = new Web3(Web3.providers.HttpProvider(provider));
  var contractInstance = new web3.eth.Contract(abi, contractAddress);
  var fromAddress = provider.getAddresses();

  var txData = contractInstance.methods.addEtherToChannel(channelId);
  var txDataEncoded = txData.encodeABI();

  var decryptedAccount = web3.eth.accounts.decrypt(keyStore, password)
  var sender = decryptedAccount.address;
  var key = new Buffer(decryptedAccount.privateKey, 'hex');
  web3.eth.getTransactionCount(sender).then(txCount=>{
    var rawTx = {
    	from: sender,
    	to: contractAddress,
    	nonce: count,
    	data: txDataEncoded,
    	gasPrice: 210000,
        gasLimit: 60000000000,
    }
    var tx = new Tx(rawTx);
    tx.sign(key);
    var serializedTx = tx.serialize();
    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt',(receipt)=>{
    	res.send(receipt);
    });

	});
	
});


module.exports = router;
