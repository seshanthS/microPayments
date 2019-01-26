var provider = "https://ropsten.infura.io/v3/993f7838ddda4a839bf45115b9142a97";
var reader = new FileReader();

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
                    $("#signatureDisplay").html = signatureStrigified;
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
                var hashOfAmount = siganture.messageHash;
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