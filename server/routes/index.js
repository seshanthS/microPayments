var express = require('express');
var Web3 = require('web3');
var Tx = require('ethereumjs-tx')
var abi = require('./abi.js');
var path = require('path');
//var web3Functions = require('./functions.js');
var router = express.Router();
var wsProvider = "wss://ropsten.infura.io/ws"
var httpProviderUrl = "https://ropsten.infura.io/v3/993f7838ddda4a839bf45115b9142a97"
//var httpProviderUrl = "http://127.0.0.1:8545"
var contractAddressOld = "0xcD0d8bbaD3f418f03965C4f9907254cFaD2cEA3C"
//var contractAddress = "0x2f18fae6cb7c4930f87c51abd9525c0e49fef3c0"
//current:
var contractAddress = "0x7574bd213951f64ba20fb00caefa87862dffd7a5";
//var web3 = new Web3(Web3.providers.HttpProvider(httpProviderUrl));
/* GET home page. */


router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname,'../../docs','home.html'))
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
  let amount = creds.amount;
  var keyStore = creds.keyStore;
  var receiver = creds.receiver;
  var password = creds.password;
  var web3 = new Web3(new Web3.providers.WebsocketProvider(wsProvider));//HttpProvider(httpProviderUrl));

  let amountInWei = web3.utils.toWei(amount);
  
  var decryptedAccount = web3.eth.accounts.decrypt(keyStore, password)
  var contractInstance = new web3.eth.Contract(abi,contractAddress/*, {from: sender, gasLimit:60000000000}*/);
    var sender = decryptedAccount.address;
    console.log(sender)
    
  	var key = new Buffer(decryptedAccount.privateKey.substring(2,66), 'hex');
  	web3.eth.getTransactionCount(sender).then(txCount=>{
      
      var txData = contractInstance.methods.createChannel(sender, receiver);
      var txDataEncoded = txData.encodeABI();
      let test1 = Number(2100000000 * 3000000);
      let amountNumber = Number(amountInWei);
      console.log(amountNumber);

  	  var rawTx = {
  	  	to: contractAddress,
        nonce: txCount,
        value: amountNumber,
  	  	data: txDataEncoded,
  	  	gasPrice: 2100000000,
        gasLimit: 3000000
      }

        //0x3Ab44Aa6d920c5bC83a22eB7DEfb86874aebfebe
      
      var tx = new Tx(rawTx);
      tx.sign(key);
  	  
  	  var serializedTx = tx.serialize();

        contractInstance.events.channelCreated({filter:{sender: sender, receiver: receiver}},(err,res)=>{
         // console.log(err);
          console.log(res);
        }).on('data',(event)=>{
  //        console.log("event \n" + JSON.stringify(event));
          console.log("event \n" + JSON.stringify(event.returnValues[2]))
          res.io.emit('channelId',event);
        });
      
      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .on('transactionHash', (transactionHash)=>{
        res.io.emit("transactionHash",transactionHash);
      })
      .on('receipt',(receipt)=>{
        var data = {
          sender: sender,
          receiver: receiver,
          receipt: receipt
        }
        console.log("data \n " + JSON.stringify(receipt.transactionHash))
        //console.log("receipt \n " + JSON.stringify(data.receipt))
        res.io.emit('receipt',receipt.transactionHash)
        res.send(data)
       //event ending
      }).on('error',(err)=>{
        res.io.emit("error",err);
        res.send(err);
      })
      .catch(errorMsg=>{
        console.log(errorMsg)
      });
          
    }).catch(errorMsg=>{
        console.log(errorMsg);
      });    
});

router.post('/signTransaction',(req,res,next)=>{
  var creds = req.body;
  var amount = creds.amount;
  var keyStore = creds.keyStore;
  var password = creds.password;

  var web3 = new Web3(new Web3.providers.WebsocketProvider(wsProvider));

  var amountWei = web3.utils.toWei(amount);
  var decryptedAccount = web3.eth.accounts.decrypt(keyStore, password);
  var key = decryptedAccount.privateKey;
  var signature = web3.eth.accounts.sign(amountWei, key)
  var senderAddress = web3.eth.accounts.privateKeyToAccount(key)
  var data = {
    senderAddress: senderAddress.address,
    signature: signature
  }
  res.send(data);
  

});

router.get('/verifyAmount',(req,res,next)=>{
  var amount = req.query.amount;
  
  var web3 = new Web3(new Web3.providers.WebsocketProvider(wsProvider));
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
  ///var amountString = data.amount;	
  
  var signatureFileAsString = data.signatureFile;
  var signatureFile = JSON.parse(signatureFileAsString);

  var web3 = new Web3(new Web3.providers.HttpProvider(httpProviderUrl));
  var contractInstance = new web3.eth.Contract(abi, contractAddress);
  
  var msgHashString = signatureFile.signature.messageHash;
  var r = signatureFile.signature.r;
  var s = signatureFile.signature.s;
  var vAsHex = web3.utils.asciiToHex(signatureFile.signature.v)//correct 
  //var v = web3.utils.hexToNumber(vAsHex);//correct
  var v = signatureFile.signature.v;
  var amountInWei = signatureFile.signature.message;
  var amountAsHex = web3.utils.toHex(amountInWei);
  var amountHash = web3.utils.stringToHex("\x19Ethereum Signed Message:\n" + amountInWei.length + amountInWei);
  console.log(amountInWei + "\n");
  console.log(amountInWei.length )
  console.log(amountHash);
  console.log(msgHashString)
  /*
  //==============================================================================
  var senderAddressFromSignatureFile = signatureFile.senderAddress;
  var senderAddress = web3.eth.accounts.recover(amountInWei, signature, true)
  var hashOfMessage = web3.eth.accounts.hashMessage(signatureFile.signature.message)
  //Check the sender in signature file and the sender add
  if((hashOfMessage == messageHash) && data.sender == senderAddress){
    //do every thing here
    //do the transaction here...
  }
  //===============================================================================
 */
  var txData = contractInstance.methods.withdraw(channelId, amountAsHex, amountHash, msgHashString, r, s, v);
  var txDataEncoded = txData.encodeABI();

  var decryptedAccount = web3.eth.accounts.decrypt(keyStore, password)
  var sender = decryptedAccount.address;
  var key = new Buffer(decryptedAccount.privateKey.substring(2,66), 'hex');
  web3.eth.getTransactionCount(sender).then(txCount=>{
    var rawTx = {
    	from: sender,
    	to: contractAddress,
    	nonce: txCount,
    	data: txDataEncoded,
    	gasPrice: 2100000000,
      gasLimit: 3000000
    }
    var tx = new Tx(rawTx);
    tx.sign(key);
    var serializedTx = tx.serialize();
    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
    .on('transactionHash', (transactionHash)=>{
      res.io.emit('transactionHash', transactionHash);
    })
    .on('receipt',(receipt)=>{
      console.log(receipt)
      res.io.emit("receipt",receipt.transactionHash);
    	res.send(receipt);
    }).on('error',(err)=>{
      res.io.emit("error",err);
      res.send(err);
    })
    .catch(errorMsg=>{
      console.log(errorMsg)
    });
  }).catch(errorMsg=>{
    console.log(errorMsg);
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

router.get("/testHash", (res,req, next)=>{
  var amount = "700000000000000000";
  var web3 = new Web3(new Web3.providers.HttpProvider(httpProviderUrl));
  var test = web3.utils.stringToHex("\x19Ethereum Signed Message:\n" + amount.length + amount);
  console.log(amount.length)
  console.log(test);
})


module.exports = router;
