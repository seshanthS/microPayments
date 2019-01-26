var payment = artifacts.require('payment.sol');

module.exports = async(deployer)=>{
	var accounts = web3.eth.getAccounts().then((acc)=>{

    deployer.deploy(payment,acc[0]);
});
}
