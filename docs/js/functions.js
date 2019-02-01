var provider = "https://ropsten.infura.io/v3/993f7838ddda4a839bf45115b9142a97";
var reader = new FileReader();
var signatureReader = new FileReader();
var etherscanApi = "GS6HVQYD1G8ZFVC9C46JV1IJNITEQR763M"

//51BE51046A46421167BE22BFA0730AFE2DC47C5C250F74B9D853DFED87419AE8

function encryptKey(){     
    var key = $("#keyField").val();
    var password = $("#passwordTextEncrypt").val();

    var data = {
        key: key,
        password: password
    }
  
    $.ajax({
        type: "post",
        data: data,
        //url: "http://35.237.253.165:3000/encryptKey",
        url: "http://localhost:3000/encryptKey",
        success: (encryptedKey)=>{
            var filename = "encryptedKey" + encryptedKey.address + ".paymentKey";
            if(confirm("The encrypted key will download shortly...")){
                $("#keyField").val("");
                $("#passwordTextEncrypt").val("");
                keyStringified = JSON.stringify(encryptedKey);
                var file = new Blob([keyStringified], {type: "txt"});
                
                downloadFile(file, filename)
            }
        }
    });
}

function downloadFile(file, filename){
    if (window.navigator.msSaveOrOpenBlob) // IE10+
                    window.navigator.msSaveOrOpenBlob(file, filename);
                else { // Others
                    var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function() {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);  
                    }, 0); 
                }
}

//read the encryptedKey. returns the encryptedKey object
function readFromFile(idOfFileChooser){
    var encryptedKey;
    var id = idOfFileChooser;
    var fileInput = document.getElementById(id);
    var file = fileInput.files[0];
    if(file === undefined){
        alert("select file...")
    }else{
        reader.readAsText(file);    
    }
    
}

function readSignatureFromFile(idOfFileChooser){
    var signature;
    var id = idOfFileChooser;
    var fileInput = document.getElementById(id);
    var file = fileInput.files[0];
    if(file === undefined){
        alert("select file...")
    }else{
        signatureReader.readAsText(file);    
    }
    
}

function sendCredsToServer(){

}

function sign(idOfFileChooser){
    var id = idOfFileChooser;
    
    var keystore = readFromFile(id);
    reader.onload = ()=>{
        
        keystore = reader.result;
        var amount = $("#amountText").val();
        var password = $("#passwordText").val();
        var creds = {
            keyStore: keystore,
            amount: amount,
            password: password
        }
        console.log(creds)
        if( amount == "" || password=="" || keystore == "")
            alert("Complete all the fields")  
        else{
            $.ajax({
                type: "POST",
                data: creds,
                url: "http://localhost:3000/signTransaction",
                success: (signature)=>{
                    console.log(signature);
                    var signatureStrigified = JSON.stringify(signature)
                    var file = new Blob([signatureStrigified], {type: "txt"});
                    var filename = "signature.signature";
                    
                    //use json.parse() before using the siganture 
                    downloadFile(file, filename);
                }
            });
        }
    }
  
}

function verifyAmount(idOfFileChooser){
    var id = idOfFileChooser;
    var amount = $("#amountVerifyField").val();
    var signatureStrigified = readFromFile(id);
   
    reader.onload = ()=>{
        signatureStrigified = reader.result;
       
        $.ajax({
            type: "get",
            url: "http://localhost:3000/verifyAmount?amount=" + amount ,
            success: (amountHash)=>{
                var siganture = JSON.parse(signatureStrigified);
                var hashOfAmount = siganture.signature.messageHash;
                if(amountHash == hashOfAmount){
                    console.log("Amount Verified")
                    alert("Amount Verified \n" + "Amount: " + amount +"\n Hash: " + amountHash)
                }
            }
        });
    }
    
}

function withdraw(idOfFileChooser){
    var id = idOfFileChooser;
    var keystore = readFromFile(id)
    var amount = $("#amountTextWithdraw").val();
    var password = $("#passwordTextWithdraw").val();
    var channelId = $("#channelIdWithdraw").val();
    var signature = readSignatureFromFile('signatureFieldWithdraw');
    var r,s,v;
    var data;
    modal.style.display = "block";
    $("#dialogTitle").text("Status")
    $("#dialogContent").text("Transaction is Waiting....")
    reader.onload =()=>{
        keystore = reader.result;
        signatureReader.onload = ()=>{
            signatureStringified = signatureReader.result;
            signatureObject = JSON.parse(signatureStringified);
    
            r         = signatureObject.r;
            s         = signatureObject.s;
            v         = signatureObject.v;
            signature = signatureObject.signature;

            data = {
                keyStore: keystore,
                password: password,
                channelId: channelId,
                amount: amount,
                signatureFile: signatureStringified,
                r: r,
                s: s,
                v: v       
            }
            console.log(data);
            $.ajax({
                type: "POST",
                data: data,
                url: "http://localhost:3000/withdraw",
                success: (data)=>{
                    console.log(data);
                    $("#status").innerHtml = data;
                }

            });
        }
       
    }
    
}

function createChannel(idOfFileChooser){
    var id = idOfFileChooser;
    var keystore = readFromFile(id);
    var password = $("#passwordText").val();
    var receiver = $("#receiverText").val();
    let amount = $("#amountChannel").val();
    modal.style.display = "block";
    $("#dialogTitle").text("Status")
    $("#dialogContent").text("Transaction is Waiting....")
    reader.onload =()=>{
        keystore = reader.result;
        var creds = {
            keyStore: keystore,
            receiver: receiver,
            password: password,
            amount: amount
        }
        $.ajax({
            type: "POST",
            data: creds,
            url: "http://localhost:3000/createChannel",
            success: (data)=>{
                console.log(data);
                //$("#status").text(data);
            }
    
        });        
    }   
}


//UI
$(document).ready(()=>{                    
               
                $("#channelCreationForm").css("display","block")
                $("#signForm").css("display","none")
                $("#verifyForm").css("display","none")
                $("#withdrawForm").css("display","none")   
            });
            //todo display modal dialog to show statusclear
            var modal = document.getElementById('myModal');
            var close = document.getElementById('closeBtn');

            var socket = io('http://localhost:3000');
            socket.on('transactionHash', function (transactionHash) {
            console.log(transactionHash);
           // alert("Transaction Started \n TransactionHash: " + transactionHash)
            $("#dialogContent").text("TransactionHash: " + transactionHash)
            $("#channelIdHeading").css("display","none")
            $("#dialogTitle").text("Transaction Started")
            modal.style.display = "block";
            close.style.display = "none"; 
            });

            socket.on('confirmation',(data)=>{
                var sender = data.sender;
                console.log("got Confirmations")
            });

            socket.on('receipt', function (data) {
            console.log(data);
            var receipt = JSON.stringify(data);
            //var receiptStringified = JSON.stringify(receipt);
            modal.style.display = "block";
            close.style.display = "block"; 
            $("#dialogTitle").text("Transaction Successful ");
            $("#dialogContent").text("Transaction Hash \n" + data )
           
            });

            socket.on('channelId', (event)=>{
                var channelId = JSON.stringify(event.returnValues[2]);
                $("#dialogContent").text(" ChannelId: " + channelId);
                $("#channelIdHeading").text(" ChannelId: " + channelId);
                $("#dialogTitle").text("Transaction completed." )
                $("#status").text("channel ID: " + channelId)
                //alert("Note this Value. The ChannelId is: " + channelId);
                console.log("channelId  " + JSON.stringify(event.returnValues[2]))
                console.log(channelId);
            });

            socket.on('error', function (err) {
            console.log(err);
            var errString = JSON.stringify(err)
            alert("An error occured :( \n " + errString)
            $("#dialogContent").text("An error occured :( \n " + errString);
            $("#dialogTitle").text("Transaction Error")
            close.style.display = "block"; 
            });

            $("#closeBtn").click(()=>{
                modal.style.display = "none";
            });

            function radioClicked(radioBtn){
                switch(radioBtn.value){
                    

                    case "createOption" :
                    $("#signForm").css("display","none")
                    $("#channelCreationForm").css("display","block")
                    $("#verifyForm").css("display","none")
                    $("#withdrawForm").css("display","none")   
                    break;

                    case "signOption" :
                    $("#signForm").css("display","block")
                    $("#channelCreationForm").css("display","none")
                    $("#verifyForm").css("display","none")
                    $("#withdrawForm").css("display","none")   
                    break;

                    case "withdrawOption" :
                    $("#signForm").css("display","none")
                    $("#channelCreationForm").css("display","none")
                    $("#verifyForm").css("display","none")
                    $("#withdrawForm").css("display","block")                  
                    break;

                    case "verifyOption" :
                    $("#signForm").css("display","none")
                    $("#channelCreationForm").css("display","none")
                    $("#verifyForm").css("display","block")
                    $("#withdrawForm").css("display","none")   
                    break;

                }
                 
            }