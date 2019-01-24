var provider = "https://ropsten.infura.io/v3/993f7838ddda4a839bf45115b9142a97";
//web3= null;
//51BE51046A46421167BE22BFA0730AFE2DC47C5C250F74B9D853DFED87419AE8
function atStartup(){
    //web3 = new Web3();
    //web3.setProvider(new Web3.providers.HttpProvider(provider));
    //console.log(web3);
}

function encryptKey(){
   
    //var web3 = new Web3(new Web3.providers.HttpProvider(provider));
     
    var key = $("#keyField").val();
    var password = $("#passwordTextEncrypt").val();
    console.log("test1")
    $.ajax({
        type: POST,
        url: "",
        success: (encryptedKey)=>{
            var filename = "encryptedKey" + Date.now() + ".paymentKey";
        var file = new Blob([encryptedKey], {type: "txt"});
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
    });
    /*web3.eth.accounts.encrypt(key, password).then(encryptedKey =>{
        //save the encryptedKey to a file...
        console.log("test2");
        var filename = "encryptedKey" + Date.now() + ".paymentKey";
        var file = new Blob([encryptedKey], {type: "txt"});
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
         
    });*/
}
//read the encryptedKey. returns the encryptedKey object
function readFromFile(idOfFileChooser){
    var encryptedKey;
    var id = idOfFileChooser;
    var fileInput = document.getElementById(id);
    var fileExtension = /text .paymentKey/;
    var file = fileInput.files[0];
    if(file.type.match(fileExtension)){
    var reader = new FileReader();
    reader.onload = ()=>{
        encryptedKey = reader.result;
        return encryptedKey;
   }
    
    }else {
        alert("Invalid File...")
    }
    reader.readAsText(file)
}

function sendCredsToServer(){

}

function sign(idOfFileChooser){
    var id = idOfFileChooser;
    var keystore = readFromFile(id);
    var amount = $("#amountText").val();
    var password = $("#passwordText").val();
    var creds = {
        keyStore: keystore,
        amount: amount,
        password: password
    }
    $.ajax({
        type: "POST",
        data: creds,
        url: "",
        success: (data)=>{
            console.log(data);
            $("#signatureDisplay").innerHtml() = data;
        }

    });
}

function verifyAmount(idOfFileChooser){
    var id = idOfFileChooser;
    var signature = $("#signatureField").val();
    var amount = $("#amountVerifyField").val();
  //  var keystore = readFromFile(id); 
    var hashOfAmount = web3.eth.accounts.hashMessage(amount);
   /* var amountHash = signature.messageHash;
    if(amountHash == hashOfAmount){
        console.log("Amount Verified")
    }*/
    console.log(hashOfAmount);
}

function withdraw(idOfFileChooser){
    var id = idOfFileChooser;
    var keystore = readFromFile(id)
    var amount = $("#amountTextWithdraw").val();
    var password = $("#passwordTextWithdraw").val();
    var channelId = $("#channelIdWithdraw").val();
    var signature = $("#signatureFieldWithdraw").val();
    var r = signature.r;
    var s = signature.s;
    var v = signature.v;
    var data = {
        keyStore: keystore,
        password: password,
        channelId: channelId,
        amount: amount,
        signature: signature,
        r: r,
        s: s,
        v: v       
    }

    $.ajax({
        type: "POST",
        data: data,
        url: "",
        success: (data)=>{
            console.log(data);
            $("#status").innerHtml() = data;
        }

    });
}

function createChannel(idOfFileChooser){
    var id = idOfFileChooser;
    var keystore = readFromFile(id);
    var password = $("#passwordText").val();
    var receiver = $("#receiverText").val();
    var amount = $("#amountChannel").val();
    var creds = {
        keyStore: keystore,
        receiver: receiver,
        password: password,
        amount: amount
    }

    $.ajax({
        type: "POST",
        data: creds,
        url: "",
        success: (data)=>{
            console.log(data);
            $("#status").innerHtml() = data;
        }

    });
}
/*
TODO
encrypt the signature file...decrypt it in backend.
*/