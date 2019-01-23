var provider = "https://ropsten.infura.io/v3/993f7838ddda4a839bf45115b9142a97";
function atStartup(){
    var web3 = new Web3(provider);
    console.log(web3);
}

function encryptKey(key, password){
   
    var web3 = new Web3(provider);
    var key = $("#keyField").val();
    var password = $("#passwordTextEncrypt").val();
    
    web3.eth.accounts.encrypt(key, password).then(encryptedKey=>{
        //save the encryptedKey to a file...
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
         
    });
}
//read the encryptedKey. returns the encryptedKey object
function readFromFile(){
    var encryptedKey;
    var fileInput = document.getElementById('files');
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

function sign(){
    var keystore = readFromFile();
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


/*
use radioButton to select from {sign, create, withdraw check}
css display: none based on the radiobutton
*/