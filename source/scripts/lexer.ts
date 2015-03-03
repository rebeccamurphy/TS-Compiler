/* lexer.ts  */
//TODO unended string with quotes
//only works if there are spaces in code, need to fix that.
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
		        this.tokenize(sourceCode);
		        
		        for (var i=0; i< _Tokens.length; i++){
		        	_TokenStr.push(_Tokens[i].toString());
		        }
		        return _TokenStr;
		    }
		}

		public static tokenize(sourceCode){
			var currentLine =1;
			var inString =false;
			var tokenized = false;
			var buffer = new Buffer();
			var currChar =''
			//loop through each character in the source code
			//need a way of making sure that 
			for (var i=0; i<sourceCode.length; i++){
				currChar = sourceCode[i];
				//check if code had eof char before end 
	            if (currChar.match(/\$/) && i<sourceCode.length-1){
	            	putWarning(currentLine, this.part, "Code found after EOF character ($). Ignoring rest of code.");
	            	return; //return skips rest of code
	            }
				
	            //check if newline
	            //need else if cause apparent newline can be interpretted as space
	            if(currChar.match(/\n/)) {
	                if(inString) { 
						//newlines are not allowed in strings in this lang so throw and error
						putError(currentLine, this.part, "Invalid character in string.");
	                } 
	                else { //if we are not in a string, we must check to see if we've hit a token
	                	if (!buffer.isEmpty()){
		                	var token = _Token.getToken(buffer.flush(), currentLine);
		                    if(token===null) //if we failed to create a valid token, handle the error
		                    	putError(currentLine, this.part, "Invalid token.");
		                    else{
		                    	_Token.addToken(token);
		                    }
	                    }
	                    tokenized=true;
	                    //only increment line if new line isnt in string
	                    currentLine++;

	                }
	            }

				//check if space
	            else if(currChar.match(/\s/)) {
	                if(inString) { 
	                	//if we are in a string, we want to preserve the whitespace and not make the wrong token
	                    var temp = new Token (TokenType.SPACE,currChar,currentLine);
	                    //adds token to global _Tokens
	                    _Token.addToken(temp);
	                    tokenized = true;
	                } else if (!buffer.isEmpty()){ //if we are not in a string, we must check to see if we've hit a token
	                	var token = _Token.getToken(buffer.flush(), currentLine);
	                    if(token===null) //if we failed to create a valid token, handle the error
	                       putError(currentLine, this.part, "Invalid token.");
	                    else
	                    	_Token.addToken(token);
	                }
	                //if not in string just ignore space
	            }

				
	            
	            //if hit a token ending character
	            if(currChar.match(/\{|\}|\(|\)|\$|\+/)) {
	                if(inString) 
	                	//characters are not valid in string so error
	                    putError(currentLine, this.part, "Invalid character in string.");
	                else { 
	                	if (!buffer.isEmpty()){
		                	//if we are not in a string, check to see if we've hit a token
		                	var token = _Token.getToken(buffer.flush(), currentLine);
		                    if(token===null) //if we failed to create a valid token, handle the error
		                        putError(currentLine, this.part, "Invalid token.");
		                    else
		                    	_Token.addToken(token);
	                    }
	                    _Token.addToken(_Token.getToken(currChar,currentLine)); //add current char to token list
	                    tokenized = true; //note that the current token has been tokenized *lazer noises*
	                }
	            }
	            

	            //got some quotes, so hafta figure out whether they start or end a string
                if(currChar.match(/"/)) {
                   if(!inString && !buffer.isEmpty()) { 
                   		//if we are not in a string, see if we can create a token from buffer contents
                   		//because a string has just started
                   		var token = _Token.getToken(buffer.flush(),currentLine);
                       	if(token===null) //if we failed to create a valid token, handle the error
                           	putError(currentLine, this.part, "Invalid token.");
                        else //otherwise add the token to the list
							_Token.addToken(token);                        	

                   }

                   inString = !inString; //flip inString
                
                   _Token.getAndAddToken(currChar,currentLine); //add quote token to the token list
                   tokenized = true; //set current token to tokensized
              	}

				//handle  =, ==, and != with a 1 char lookahead              	
              	if(currChar.match(/\!|\=/)) {
              	    if(inString) //invalid char in string, log error
              	    	//TODO i keep using the same errors a lot so a class or enum could be cool
              	        putError(currentLine, this.part, "Invalid character in string.");
              	    else { 
              	        // since ! can only mean != or an error, and 
              	        // = can only mean == or =, empty the buffer before proceeding
              	        if (!buffer.isEmpty()){
	              	        var token = _Token.getToken(buffer.flush(),currentLine);
	              	        if(token===null) //if failed to create a valid token, handle the error
	              	            putError(currentLine, this.part, "Invalid token.");
	              	        else
	              	        	_Token.addToken(token);
              	        }
              	        if(sourceCode[i+1] === '=') { //look ahead by 1. do we have != or ==
              	        	//if it is != or == create a token
              	            _Token.getAndAddToken(currChar+'=',currentLine) 
              	            i++; //skip the next character as it has already dealt with it
              	            tokenized = true;
              	        } else if(currChar === '!') { 
              	        	//error! lone (!)
              	            putError(currentLine, this.part, "Invalid token.");
              	        } else { 
              	        	//otherwise it must be '=' which is valid, so make a token and get this bb outta here
              	            _Token.getAndAddToken(currChar,currentLine); //tokenize it!
              	            tokenized = true;
              	        }
              	    }
              	}

              	//if this is the last char in the code and it's not the EOF character, deal with it
  	            if(!inString && i==sourceCode.length-1 && currChar != '$') {
  	                if(!tokenized) { 
  	                	//if this has not yet been tokenized, add it to the buffer and flush. 
  	                	//its at the EOF and someone was a forgetful susan.

  	                	//push this last char to the buffer
  	                    buffer.push(currChar); 
  	                    //try to create a token from the buffer
  	                    if (!buffer.isEmpty()){
	  	                    var token = _Token.getToken(buffer.flush(), currentLine);
	  	                    if(token===null) 
	  	                        putError(currentLine, this.part, "Invalid token.");
	  	                    else
	  	                    	_Token.addToken(token);//add token
  	                    }
  	                }
  	                _Token.getAndAddToken('$', currentLine); //add EOF token for the user
  	                //should eof be inserted in sourcecode or just as a token?
  	                putWarning(currentLine, this.part, "EOF character not found. Inserting.");
  	            }

  	            //if this character is in a string and hasn't yet been handled and is an alpha char
                if(inString && !tokenized && currChar.match(/[a-zA-Z]/)) {
                    //create a character token
                    _Token.createAndAddToken(TokenType.CHAR, currChar, currentLine); 
                    tokenized = true; //current token has been tokenized
                }

                //having checked all cases where a token must be processed from the buffer,
                // can safely add whatever character 
                // its on to the current buffer if it hasn't already been tokenized
                if (currChar ===' ' && !tokenized&& inString){
                	//ignore whitespace except in strings.
                    buffer.push(currChar);
                }
                else if(!tokenized && currChar!==' '){
                    buffer.push(currChar);
                }
                //check longest match 
                var token = _Token.getWordMatchToken(buffer.get(), currentLine);
                if (token!==null && !inString){
                	buffer.clear();
                	_Token.addToken(token);
                }
                tokenized = false; //reset tokenized

			}
		}
	}
	}
