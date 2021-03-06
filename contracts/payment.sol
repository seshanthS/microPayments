pragma solidity >=0.4.21 <0.6.0;

//TODO
//Expire channel based on time.

contract payment{

    address owner;
    uint public channelId;

    struct Channel{
        address payable sender;
        address payable receiver;
        uint amount;
        bool expired;
        address payable beneficiary;
        //uint expiryTime;
    }

    
    mapping(uint => Channel)channel;
    mapping(uint => bool)channelExpired;
    mapping(uint => uint)amountInChannel;

    event channelCreated(address indexed _sender, address indexed _receiver, uint);

    constructor(address _owner) public{
        owner = _owner;

    }

    modifier validChannel(uint _channelId){
       require(channelExpired[_channelId] == false,"Channel expired");
        _;
    }

    function createChannel(address payable _sender, address payable _receiver)public payable returns(uint){
        uint _amount = msg.value;
        channelId ++;
        channel[channelId].sender = _sender;
        channel[channelId].receiver = _receiver;
        channel[channelId].amount = _amount;
        channel[channelId].expired = false;
        channelExpired[channelId] = false;
        
        emit channelCreated(_sender, _receiver, channelId);
        return channelId;
    }

    //@notice add ethers to the channel.
    function addEtherToChannel(uint _channelId)public payable validChannel(_channelId){
        //Only the sender can add ethers to the channel.   
        require(msg.sender == channel[_channelId].sender,"Only the sender can add funds");
        channel[_channelId].amount += msg.value;
    }

    
    function withdraw(uint _channelId, uint amount,bytes memory amountHash, bytes32 messageHash, bytes32 r, bytes32 s, uint8 v)public validChannel(_channelId) {
        
        //get sha3 hash of amount without prepend(offchain).compare it with keccak value of amount(onchain)
        //web3.utils.soliditySha3({type: "uint256", value: amount}) == keccak256(amount)
        require(ecrecover(messageHash, v, r, s) == channel[_channelId].sender,"Not a valid signature");

         //senderBalance is (balance in contract - the bill amount);
         // check the amount by comparing the (hash of amount) with messageHash
         
         if(keccak256(amountHash) == messageHash){
            uint senderBalance = channel[_channelId].amount - amount;
            channel[_channelId].amount = 0;
            channel[_channelId].receiver.transfer(amount);
	    if(senderBalance != 0){
            	channel[_channelId].sender.transfer(senderBalance);
	    }
            closeChannel(_channelId);
         }
                 
         
               
    }

    function closeChannel(uint _channelId) private{
        channelExpired[_channelId] = true;
    }
}
