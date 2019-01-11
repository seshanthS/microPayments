var express = require('express');
var Web3 = require('web3');
var web3Functions = require('./functions.js')
var walletProvider = require('truffle-hdwallet-provider');
var abi = require('./abi.js');
var router = express.Router();
var provider = "";
var contractAddress = ""

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}
/*
	/createChannel - send keystore of sender, receivers's address,amount in ethers
*/
router.post('/createChannel',(req,res,next)=>{
  var creds = req.body.creds;
  //amount in ethers, i.e amount = 2; 2 ethers nu koduka venam.
  var amount = creds.amount;
  var keyStore = creds.keyStore;
  var receiver = creds.receiver;

  var web3 = new Web3(Web3.providers.HttpProvider(provider));

  var amountInWei = web3.utils.toWei(amount);
  var contractInstance = new web3.eth.Contract(abi,contractAddress);
  contractInstance.methods.createChannel(sender, receiver).send({from:sender, value: amountInWei}).then(receipt=>{
  	//receipt also contains the returned channelId from contract;
  	res.send(receipt);
  });
});

/*
	send privkey(decrypt keystore in browser), amount.;
	returns signature;
*/
router.post('/signTransaction',(req,res,next)=>{
  var creds = req.body.creds;
  var amount = creds.amount;
  var key = creds.key;

  var web3 = new Web3(Web3.providers.HttpProvider(provider));

  var amountWei = web3.utils.toWei(amount);
  
  web3.eth.accounts.sign(amountWei, key).then(signature =>{
  	res.send(signature);
  });

router.get('/withdraw',(req,res,next)=>{
  var data = req.body.data;
  var channelId = data.channelId;
  var amountHash = data.amountHash;
  var amount = data.amount;	
  var signature = data.signature;
  var r = data.r;
  var s = data.s;
  var v = data.v;

  var web3 = new Web3(Web3.providers.HttpProvider(provider));
  var contractInstance = new web3.eth.Contract(abi, contractAddress);

  /*
    TODO :
     .on('transactionHash'){ updateUi to waiting};
     .on('receipt'){send receipt};
  */
  contractInstance.methods.withdraw(channelId, amountHash, amount, signature, r, s, v).send({from:fromAddress}).then(receipt=>{
  	console.log(receipt);
  	res.send(receipt);
  })
});

router.post('/addEther',(req, res, next)=>{
	var creds = req.body.creds;

});

router.get('/test',(req,res,next)=>{
	var fromA = 
	var toB =
	var web3 = new Web3(provider);



})

module.exports = router;
