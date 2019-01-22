provider = "";
function Create(){
	web3 = new Web3(new Web3.providers.HttpProvider(provider));
}
function importAccountToWallet(){
	web3.eth.accounts.wallet.add(privKey);
	alert("account imported...")
}

function loadWallet(password){
	web3.eth.accounts.load(password).then(decryptedWallet=>{
		//wallet loaded, do transaction
	});
}
/*

steps
1. (frontend) web3.eth.accounts.encrypt() to encrypt a private key...save that offline
2. send the encrypted account and password to backend.
3. decrypt the account.then(
      use the key and address to do transactions
      using ethereumjs-tx method
*/

