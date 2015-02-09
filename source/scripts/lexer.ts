/* lexer.ts  */

module TSC
	{
	export class Lexer {
		public static lex() {
		    {
		        // Grab the "raw" source code.
		        var sourceCode = (<HTMLInputElement>document.getElementById("taSourceCode")).value;
		        // Trim the leading and trailing spaces.
		        sourceCode = TSC.Utils.trim(sourceCode);
		        //remove all spaces
		        sourceCode = sourceCode.replace(/\s+/g, '');
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
			for (var i=0; i<sourceCode.length; i++){
				//check if space
	            if(sourceCode[i].match(/\s/)) {
	                if(inString) { 
	                	//if we are in a string, we want to preserve the whitespace and not make the wrong token
	                    var temp = new Token (TokenType.SPACE,sourceCode[i],currentLine);
	                    _Token.addToken(temp);
	                    tokenized = true;
	                } else { //if we are not in a string, we must check to see if we've hit a token
	                    //if(!getToken(buffer.flush(), currentLine)) //if we failed to create a valid token, handle the error
	                    //    error(currentLine, "Lex Error: Invalid token.");
	                }
	            } 

				//check if newline
			}
		}
	}
	}
