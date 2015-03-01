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
	            /*else if(sourceCode[i].match(/\n/)) {
	                if(inString) { 
	                	//if we are in a string, we want to preserve the whitespace and not make the wrong token
	                    var temp = new Token (TokenType.NEWLINE,sourceCode[i],currentLine);
	                    _Token.addToken(temp);
	                    tokenized = true;
	                } else { //if we are not in a string, we must check to see if we've hit a token
	                    //if(!getToken(buffer.flush(), currentLine)) //if we failed to create a valid token, handle the error
	                    //    error(currentLine, "Lex Error: Invalid token.");
	                }
	            }
	            */
	            //check end of line
	            else if (sourceCode.[i] == '$'{
	            	if (i!== sourceCode.length-1){
	            		//need warning that rest of file after this line are 
	            		//add current token to stream and break 
	            	}
	            }

			}
		}
	}
	}
