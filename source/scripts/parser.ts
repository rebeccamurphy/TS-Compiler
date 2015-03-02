/* parser.ts  */

module TSC
{
	export class Parser {
		public part = 'Parser';
        public blockStart = "{";
        public blockEnd = "}";
        public openParen = "(";
        public closeParen = ")";
        public strStartEnd = '"';
        public print = "print";
        public space = " ";
        public assignment = "=";
        public addOp = "+";
        public type = ["int", "string", "boolean"];
        public typeOps = "type";
        public while = "while";
        public boolVal = ["false", "true"];
        public boolOp = ["==", "!="];
        public booleanOperator = "boolean operator";
        public if = "if";
        public char = "char";
        public digit = "digit";

	    public getNextToken() {
	        var thisToken = EOF;    // Let's assume that we're at the EOF.
	        if (_TokenIndex < _Tokens.length)
	        {
	            // If we're not at EOF, then return the next token in the stream and advance the index.
	            thisToken = _Tokens[_TokenIndex];
	            putMessage("Current token:" + thisToken.toString());
	            _TokenIndex++;
	        }
	        return thisToken;
    	}
    	public getPrevToken() {
    		var thisToken;
	        if (_TokenIndex-1 >=0)
	        {
	            // If we're not at EOF, then return the next token in the stream and advance the index.
	            thisToken = _Tokens[_TokenIndex-1];
	            //putMessage("Current token:" + thisToken);
	        }
	        return thisToken;
    	}
		public parse() {
	        putMessage("Parsing [" + _TokenStr + "]");
	        // Grab the next token.
	        _CurrentToken = this.getNextToken();
	        // A valid parse derives the G(oal) production, so begin there.
	        //this.parseG();
	        // Report the results.
	        var msg ="";
	        if (_ErrorCount ===0)
	        	msg = "no errors."
	        else if (_ErrorCount==1)
	        	msg = _ErrorCount + " error.";
	        else
	        	msg = _ErrorCount + " errors.";
	        putMessage("Parsing found"+ msg);   
		}

		//Program ::== Block 
		public parseProgram() {
        	this.parseBlock();
        	this.match(EOF);
        	putSuccess(this.part);
    	}
    	//Block ::== {StatementList}
    	public parseBlock(){
    		this.match(this.blockStart); //expect block to start with {
    		this.parseStatementList();
    		this.match(this.blockEnd); //expect block to end with }
    	}

    	//StatementList ::== Statement StatementList
    	//				::== epsilon
    	public parseStatementList(){

    	}

    	// Statement ::== PrintStatement
    	//           ::== AssignmentStatement
    	//           ::== VarDecl
    	//           ::== WhileStatement
    	//           ::== IfStatement
    	//           ::== Block
    	public parseStatement(){

    	}

    	// PrintStatement ::== print ( Expr )
    	public parsePrint(){

    	}

    	//AssignmentStatement ::== Id = Expr
    	public parseAssignmentStatement(){

    	}
    	
    	//VarDecl  ::== type Id
    	public parseVarDecl(){

    	}
    	//WhileStatement ::== while BooleanExpr Block
    	public parseWhileStatement(){

    	}
    	//IfStatement ::== if BooleanExpr Block
    	public parseIfStatement(){

    	}
    	//Expr 	::== IntExpr
    	//		::== StringExpr
    	//		::== BooleanExpr
    	//		::==Id
    	public parseExpr(){

    	}

    	public parseE() {
	        // All E productions begin with a digit, so make sure that we have one.
	        this.checkToken("digit");
	        // Look ahead 1 char (which is now in _CurrentToken because checkToken 
	        // consumes another one) and see which E production to follow.
	        if (_CurrentToken != EOF) {
	            // We're not done, we we expect to have an op.
	            this.checkToken("op");
	            this.parseE();
	        } else {
	            // There is nothing else in the token stream, 
	            // and that's cool since E --> digit is valid.
	            putMessage("EOF reached");
	        }
    	}

    	//BooleanExpr	::== (Expr boolOp Expr)
    	//				::== boolVal
    	public parseBooleanExpr(){

    	}

    	//IntExpr	::== digit intop Expr
    	//			::== digit
    	public parseIntExpr(){

    	}
		
		//StringExpr ::== " CharList "    	
		public parseStringExpr(){

		}

		//Id ::== char
		public parseID(){

		}

		//CharList	::== char CharList
		//			::== space CharList
		//			::== epsilon
		public parseCharList(){

		}
    	public checkToken(expectedKind) {
	        // Validate that we have the expected token kind and et the next token.
	        switch(expectedKind) {
	            case "digit":{
	            	putMessage("Expecting a digit");

                    if (_CurrentToken=="0" || _CurrentToken=="1" || _CurrentToken=="2" || 
                        _CurrentToken=="3" || _CurrentToken=="4" || _CurrentToken=="5" || 
                        _CurrentToken=="6" || _CurrentToken=="7" || _CurrentToken=="8" || 
                        _CurrentToken=="9"){
                        putMessage("Got a digit!");
                    }
                    else{
                        _ErrorCount++;
                        putMessage("NOT a digit.  Error at position " + _TokenIndex + ".");
                    }
                    break;
                }
	            case "op":{      
	            	putMessage("Expecting an operator");

                    if (_CurrentToken=="+" || _CurrentToken=="-"){
                        putMessage("Got an operator!");
                    }
                    else {
                        _ErrorCount++;
                        putMessage("NOT an operator.  Error at position " + _TokenIndex + ".");
                    }
                    break;
                }
	            default:        
	            	putMessage("Parse Error: Invalid Token Type at position " + _TokenIndex + ".");
	                break;			
	        }
	        // Consume another token, having just checked this one, because that 
	        // will allow the code to see what's coming next... a sort of "look-ahead".
	        _CurrentToken = this.getNextToken();
	    }


        // Removes the first Lexeme object from the Lexemes 
        // array and checks to see if it matches the token 
        // parameter. If there is a match, output results. 
        // Otherwise, output an error and halt execution 
        // of compiler.
        public match(token) {
            var nextToken = _Parser.getNextToken();
            if (nextToken.value == token) {
                putExpectingCorrect(nextToken.line, this.part, token, nextToken.value);
            } 
            else {
            	putExpectingWrong(nextToken.line, this.part, token, nextToken.value);
               	putFailed(this.part);
               	return;
       		}
       	}

	}
}
