var payment = artifacts.require('payment.sol');

module.exports = async(deployer,network, accounts)=>{

    deployer.deploy(payment,accounts[0]);
}
