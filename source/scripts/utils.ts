/* --------  
   Utils.ts

   Utility functions.
   -------- */

module TSC {

    export class Utils {

    public static trim(str)      // Use a regular expression to remove leading and trailing spaces.
        {
        	return str.replace(/^\s+|\s+$/g, "");
        	/* 
        	Huh?  Take a breath.  Here we go:
        	- The "|" separates this into two expressions, as in A or B.
        	- "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
        	*/
        	
        }

    public static rot13(str)     // An easy-to understand implementation of the famous and common Rot13 obfuscator.
        {                       // You can do this in three lines with a complex regular experssion, but I'd have
            var retVal = "";    // trouble explaining it in the future.  There's a lot to be said for obvious code.
            for (var i in str)
            {
                var ch = str[i];
                var code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0)
                {            
                    code = str.charCodeAt(i) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                }
                else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0)
                {
                    code = str.charCodeAt(i) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                }
                else
                {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }
    

    public static insertAt (original, index, string) { 
        return original.substr(0, index) + string + original.substr(index);
        }
    public static charsToString(node, str?){
        ;
        if (str ===undefined){
            str ='';
        }
        while (node!==undefined && node.getChildren().length!==0){
            str += node.getChildren()[0].getValue();
            node = node.getChildren()[1];
        }
        return str;
    }
    public static printArray(arr){
        var str = "";
        for (var i =0; i<arr.length; i++)
            str+="<div>Token "+(i+1)+": " + arr[i].toString() +"</div>";
        return str;
    }
    public static dec2hex (numDec){
        return numDec.toString(16).toUpperCase();    
    }

    public static hex2dec(numHex){
        return parseInt(numHex, 16);
    }

    public static str2hex(name:string){
        
        var hexStr ="";
        for(var i =0; i< name.length; i++){
            var temp = TSC.Utils.dec2hex(name.charCodeAt(i));
            temp = new Array(2-temp.length).join('0')+temp;
            hexStr+=temp;
        }
        return hexStr;
    }
    
    public static toHexStr(num) {
        return ("00"+num.toString(16).toUpperCase()).substr(-2);
    }
    public static hex2str(hexName:string){
        var str ="";
        var hexArray = hexName.match(/.{1,2}/g);
        for (var i=0; i<hexArray.length; i++){
            var charFromHex =String.fromCharCode(this.hex2dec(hexArray[i]));
            str+=charFromHex;
        }
        return str;
    }
    public static createHexIndex(numDec){
        var numHex = this.dec2hex(numDec);
        return "0x" + Array(3-(numHex.length-1)).join("0") + numHex;
    }
    public static copyToClipboard(text) {
        window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    }
    
    }
}
