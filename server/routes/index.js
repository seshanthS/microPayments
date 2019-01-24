var express = require('express');
var Web3 = require('web3');
var Tx = require('ethereumjs-tx')
var web3Functions = require('./functions.js');
var abi = require('./abi.js');
var router = express.Router();
var httpProviderUrl = "https://ropsten.infura.io/v3/993f7838ddda4a839bf45115b9142a97"
var contractAddress = ""

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/*
	/createChannel - send keystore of sender, receivers's address,amount in ethers
*/

router.post('/encryptKey',(req,res,next)=>{
  var data = req.body.data;
  var privKey = data.key;
  var password = req.password;
  web3.eth.accounts.encrypt(key, password).then(encryptedKey =>{
    res.send(encryptedKey);
  });
})

router.post('/createChannel',(req,res,next)=>{
  //creds contains the decrypted keystore.
  var creds = req.body.creds;
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

  web3.eth.accounts.decrypt(keyStore, password).then(decryptedAccount=>{
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
});

/*
	send privkey(decrypt keystore in browser), amount.;
	returns signature;
*/
router.post('/signTransaction',(req,res,next)=>{
  var creds = req.body.creds;
  var amount = creds.amount;
  var keyStore = creds.keyStore;
  var password = creds.password;

  var web3 = new Web3(Web3.providers.HttpProvider(httpProviderUrl));

  var amountWei = web3.utils.toWei(amount);
  web3.eth.accounts.decrypt(keyStore, password).then(decryptedAccount=>{
    var key = decryptedAccount.privateKey;
    web3.eth.accounts.sign(amountWei, key).then(signature =>{
  	res.send(signature);
    });
  });

});

router.get('/withdraw',(req,res,next)=>{
  var data = req.body.data;
  var keyStore = data.keyStore;
  var password = data.password;
  var channelId = data.channelId;
  var amountHash = data.amountHash;
  var amount = data.amount;	
  var signature = data.signature;
  var r = data.r;
  var s = data.s;
  var v = data.v;
  //web3.toAscii()
  var contractInstance = new web3.eth.Contract(abi, contractAddress);
  var web3 = new Web3(Web3.providers.HttpProvider(httpProviderUrl));

  var txData = contractInstance.methods.withdraw(channelId, amount, signature, r, s, v);
  var txDataEncoded = txData.encodeABI();

  web3.eth.accounts.decrypt(keyStore, password).then(decryptedAccount=>{
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

  web3.eth.accounts.decrypt(keyStore, password).then(decryptedAccount=>{
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
});

module.exports = router;
