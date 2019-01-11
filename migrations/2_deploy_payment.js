var payment = artifacts.require('payment');

module.exports = async(deployer)=>{
	var accounts =await web3.eth.getAccounts();

    deployer.deploy(payment,accounts[0]);
}