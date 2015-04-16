/* lexer.ts  */
//TODO unended string with quotes
//only works if there are spaces in code, need to fix that.
module TSC
	{
	export class Lexer {
		public static part = "Lexer";
		public static prevToken;
		public static lex() {
		    {
		        // Grab the "raw" source code.
		        var sourceCode = (<HTMLInputElement>document.getElementById("taSourceCode")).value;
		        // Trim the leading and trailing spaces.
		        sourceCode = TSC.Utils.trim(sourceCode);
		        _Messenger.putHeaderMessage("Lex Started.");
		        //sourceCode = sourceCode.toLowerCase();
		        this.tokenize(sourceCode);
		        
		        for (var i=0; i< _Tokens.length; i++){
		        	_TokenStr.push(_Tokens[i].toString());
		        }
		        _Messenger.putSuccess(this.part);
		    }
		}

		public static tokenize(sourceCode){
			var currentLine =1;
			var inString =false;
			var tokenized = false;
			var buffer = new Buffer();
			var currChar ='';
			//loop through each character in the source code
			for (var i=0; i<sourceCode.length; i++){
				currChar = sourceCode[i];
				//check if code had eof char before end 
	            if (currChar.match(/\$/) && i<sourceCode.length-1){
	            	_Messenger.putWarning(currentLine, "Code found after EOF character ($). Ignoring rest of code.");
	            	return; //return skips rest of code
	            }
				
	            //check if newline
	            //need else if cause apparent newline can be interpretted as space
	            if(currChar.match(/\n/)) {
	                if(inString) { 
						//newlines are not allowed in strings in this lang so throw and error
						_Messenger.putError(currentLine, "[" +currChar+"] Invalid character in string.", this.part);
	                } 
	                else { //if we are not in a string, we must check to see if we've hit a token
	                	if (!buffer.isEmpty()){
		                	_Token.getAndAddToken(buffer.flush(), currentLine);
	                    }
	                    tokenized=true;

	                }
	                currentLine++;
	            }

				//check if space
	            else if(currChar.match(/\s/)) {
	                if(inString) { 
	                	//if in a string preserve the whitespace and not make the wrong token
	                    var temp = _Token.createAndAddToken(TokenType.SPACE,currChar,currentLine);
	                    tokenized = true;
	                } else if (!buffer.isEmpty()){ 
	                	//if not in a string, must check to see if hit a token
	                	_Token.getAndAddToken(buffer.flush(), currentLine);
	                }
	                //if not in string and empty buffer just ignore space
	            }

	            
	            //if hit a token ending character
	            if(currChar.match(/\{|\}|\(|\)|\$|\+/)) {
	                if(inString) 
	                	//characters are not valid in string so error
	                    _Messenger.putError(currentLine, "[" +currChar+"] Invalid character in string.", this.part);
	                else { 
	                	if (!buffer.isEmpty()){
		                	//if we are not in a string, check to see if we've hit a token
		                	_Token.getAndAddToken(buffer.flush(), currentLine);
	                    }
	                    _Token.getAndAddToken(currChar,currentLine); //add current char to token list
	                    tokenized = true; //note that the current token has been tokenized *lazer noises*
	                }
	            }
	            

	            //got some quotes, so hafta figure out whether they start or end a string
                if(currChar.match(/"/)) {
                   if(!inString && !buffer.isEmpty()) { 
                   		//if we are not in a string, see if we can create a token from buffer contents
                   		//because a string has just started
                   		_Token.getAndAddToken(buffer.flush(), currentLine);

                   }

                   inString = !inString; //flip inString
                
                   _Token.getAndAddToken(currChar,currentLine); //add quote token to the token list
                   tokenized = true; //set current token to tokensized
              	}

				//handle  =, ==, and != with a 1 char lookahead              	
              	if(currChar.match(/\!|\=/)) {
              	    if(inString) //invalid char in string, log error
              	    	//TODO i keep using the same errors a lot so a class or enum could be cool
              	        _Messenger.putError(currentLine, "Invalid character in string.", this.part);
              	    else { 
              	        // since ! can only mean != or an error, and 
              	        // = can only mean == or =, empty the buffer before proceeding
              	        if (!buffer.isEmpty()){
	              	        _Token.getAndAddToken(buffer.flush(), currentLine);
              	        }
              	        if(sourceCode[i+1] === '=') { //look ahead by 1. do we have != or ==
              	        	//if it is != or == create a token
              	            _Token.getAndAddToken(currChar+'=',currentLine) 
              	            i++; //skip the next character as it has already dealt with it
              	            tokenized = true;
              	        } else if(currChar === '!') { 
              	        	//error! lone (!)
              	            _Messenger.putError(currentLine,"Invalid token.", this.part);
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
	  	                    _Token.getAndAddToken(buffer.flush(), currentLine);
  	                    }
  	                }
  	                _Token.getAndAddToken('$', currentLine); //add EOF token for the user
  	                //should eof be inserted in sourcecode or just as a token?
  	                _Messenger.putWarning(currentLine, "EOF character not found. Inserting.");
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
                if (!tokenized&& inString){
                	//ignore whitespace except in strings.
                    buffer.push(currChar);
                }
                else if(!tokenized && !currChar.match(/\s/)){
                    buffer.push(currChar);
                }

                this.prevToken = (_Tokens.length>0&&!tokenized) ? _Tokens[_Tokens.length-1]: new Token(TokenType.NONE, '', currentLine);
                if (this.prevToken.type ===TokenType.EQUALSIGN && buffer.get().match(/[0-9]/)){
                	_Token.getAndAddToken(buffer.flush(), currentLine);
                }

                else {//check longest match 
                	var tokenList = _Token.getWordMatchToken(buffer.get(), currentLine);
	                if (tokenList.length!==0 && !inString){
	                	buffer.clear();
	                	for (var j=0; j<tokenList.length; j++)
	                		_Token.addToken(tokenList[j]);
	                }

	            }
	            if (!inString && !buffer.isEmpty()){
                	while (!_Token.testForToken(buffer.get())){
                		_Token.getAndAddToken(buffer.pop(), currentLine);
                	}

                }

                tokenized = false; //reset tokenized

			}
		}
	}
	}
