var payment = artifacts.require('payment.sol');

contract (payment, async accounts=>{
	accounts = await web3.eth.getAccounts();
	it('prints the value in accout',async()=>{
		var instance = await payment.deployed(accounts[0]);
		var id = await instance.channelId.call();
		instance.methods.createChannel(accounts[0], accounts[1]).send({from: accounts[0], value: 1000});
		var idAfter = await instance.channelId.call();
	assert.equal(idAfter,id-1, "Not Equal");
	});
})