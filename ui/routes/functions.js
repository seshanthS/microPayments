var abi = require('./abi.js');
var Web3 = require('web3'); 
const provider = "";
var contractAddress = ""


module.export = {
     decryptKeystore : async function(keystore,password){
        var web3 = new Web3(Web3.providers.HttpProvider(provider));
        var decryptedAccount = await web3.eth.accounts.decrypt(keystore,password);
        return decryptedAccount;
    },

    //data mattum kodutha podhum....automatic ah andha "/x19Ethereum signed....." add aagikum sign pannumpodhu
    signMsg :function(data,keyStore){
        var web3 = new Web3(Web3.providers.HttpProvider(provider));
        var decryptedAccount = decryptKeystore(keyStore);
        var address = decryptedAccount.address;
        web3.eth.accounts.sign(address,data).then(signature =>{
            return signature;
        });
    }
}
