pragma solidity >=0.4.21 <0.6.0;

//TODO
//Expire channel based on time.

contract payment{

    address owner;
    uint channelId;

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

    event channelCreated(address indexed _sender, address indexed _receiver);

    constructor(address _owner) public{
        owner = _owner;

    }

    function createChannel(address payable _sender, address payable _receiver)public payable returns(uint){
        uint _amount = msg.value;
        channelId ++;
        channel[channelId].sender = _sender;
        channel[channelId].receiver = _receiver;
        channel[channelId].amount = _amount;
        channel[channelId].expired = false;
        channelExpired[channelId] = false;
        
        
        emit channelCreated(_sender, _receiver);
        return channelId;
    }

    //@notice add ethers to the channel.
    function addEtherToChannel(uint _channelId)public payable{
        //Only the sender can add ethers to the channel.
        require(channelExpired[_channelId] == false);
        require(msg.sender == channel[_channelId].sender,"Only the sender can add funds");
        channel[_channelId].amount += msg.value;
    }

    
    function withdraw(uint _channelId, bytes32 amountHash, uint amount, bytes32 signature, bytes32 r, bytes32 s, uint8 v)public {
        
        require(ecrecover(signature, v, r, s) == channel[_channelId].sender,"Not a valid signature");
        //signature should be equal to amountHash.
        //This check is only for verify the amount.
        //since the data we sign is only the amount, amountHash should match signature;
        if(amountHash == signature){
            //senderBalance is (balance in contract - the bill amount);
            uint senderBalance = channel[_channelId].amount - amount;
            channel[_channelId].amount = 0;
            channel[_channelId].receiver.transfer(amount);
            channel[_channelId].sender.transfer(senderBalance);
            closeChannel(_channelId);
        }        
    }
    function closeChannel(uint _channelId) private{
        channelExpired[_channelId] = true;
    }
}