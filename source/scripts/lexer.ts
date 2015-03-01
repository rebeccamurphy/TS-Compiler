/* lexer.ts  */

module TSC
	{
	export class Lexer {
		public static part = "Lexer";
		public static lex() {
		    {
		        // Grab the "raw" source code.
		        var sourceCode = (<HTMLInputElement>document.getElementById("taSourceCode")).value;
		        // Trim the leading and trailing spaces.
		        sourceCode = TSC.Utils.trim(sourceCode);
		        //remove all spaces
		        //sourceCode = sourceCode.replace(/\s+/g, '');
		        debugger;
		        //call tokenize TODO
		        //this.tokenize(sourceCode);
		        return sourceCode;
		    }
		}

		public static tokenize(sourceCode){
			var currentLine =1;
			var inString =false;
			var tokenized = false;
			var buffer = function(){
				var str ='';
				return {
	                "push": //adds character to buffer
		                function(ch) {
		                	str+=ch;
		                },
	                "clear": //clears the buffer
	                	function() {
	                		str="";
	                	},
	                "get": //returns the buffer
	                	function() {
	                		return str;
	                	},
	                "flush": //returns the buffer and clears the buffer
	                	function() {
	                		var txt=str; 
	                		str=""; 
	                		return txt;
	                	}
            	}
       		}();
				
			//loop through each character in the source code
			//TODO check space, newline, eof
			//need a way of making sure that 
			for (var i=0; i<sourceCode.length; i++){
				//check if EOF char was forgotten
				if (i===sourceCode.length-1 && sourceCode[i]!=="$"){
					putWarning(currentLine, this.part, "Forgot EOF character ($). Inserting.");
					sourceCode += "$";
				}
				//check if space
	            if(sourceCode[i].match(/\s/)) {
	                if(inString) { 
	                	//if we are in a string, we want to preserve the whitespace and not make the wrong token
	                    var temp = new Token (TokenType.SPACE,sourceCode[i],currentLine);
	                    //adds token to global _Tokens
	                    _Token.addToken(temp);
	                    tokenized = true;
	                } else { //if we are not in a string, we must check to see if we've hit a token
	                	var token = _Token.getToken(buffer.flush(), currentLine);
	                    if(token===null) //if we failed to create a valid token, handle the error
	                       putError(currentLine, this.part, "Invalid token.");
	                    else
	                    	_Token.addToken(token);
	                }
	                //if not in string just ignore space
	            }

				//check if newline
	            else if(sourceCode[i].match(/\n/)) {
	                if(inString) { 
						//newlines are not allowed in strings in this lang so throw and error
						putError(currentLine, this.part, "Invalid character in string.");
	                } 
	                else { //if we are not in a string, we must check to see if we've hit a token
	                	var token = _Token.getToken(buffer.flush(), currentLine);
	                    if(token===null) //if we failed to create a valid token, handle the error
	                    	putError(currentLine, this.part, "Invalid token.");
	                    else
	                    	_Token.addToken(token);

	                    //only increment line if new line isnt in string
	                    currentLine++;

	                }
	            }
	            
	            //if hit a token ending character
	            if(sourceCode[i].match(/\{|\}|\(|\)|\$|\+/)) {
	                if(inString) 
	                	//characters are not valid in string so error
	                    putError(currentLine, this.part, "Invalid character in string.");
	                else { 
	                	//if we are not in a string, check to see if we've hit a token
	                	var token = _Token.getToken(buffer.flush(), currentLine);
	                    if(token===null) //if we failed to create a valid token, handle the error
	                        putError(currentLine, this.part, "Invalid token.");
	                    else
	                    	_Token.addToken(token);
	                    
	                    _Token.addToken(_Token.getToken(sourceCode[i],currentLine)); //add current char to token list
	                    tokenized = true; //note that the current token has been tokenized
	                }
	            }
	            //check if code had eof char before end 
	            if (sourceCode[i].match(/\$/) && i<sourceCode.length-1){
	            	putWarning(currentLine, this.part, "Code found after EOF character ($). Ignoring rest of code.");
	            	return;
	            }

	            


			}
		}
	}
	}
