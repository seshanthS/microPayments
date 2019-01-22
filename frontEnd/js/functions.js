var provider = "";
function atStartup(){
    web3 = new Web3(provider);
}

function encryptKey(key, password){
   
    var web3 = new Web3(provider);
    var key = ("#keyField").val();
    var password = ("#passwordTextEncrypt").val();
    
    web3.eth.accounts.encrypt(key, password).then(encryptedKey=>{
        //save the encryptedKey to a file...
        var filename = "encryptedKey" + Date.now();
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
    return encryptedKey;
}

function sendCredsToServer(){
    var creds = readFromFile();
}

function sign();