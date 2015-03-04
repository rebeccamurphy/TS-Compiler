/* parser.ts  */

module TSC
{
	export class Parser {
		public part = 'Parser';
		constructor(){

		}
        
	    public getNextToken() :any {
	        var thisToken = EOF;    // Let's assume that we're at the EOF.
	        if (_TokenIndex < _Tokens.length){
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
			debugger;
	        putMessage("Parsing [" + _TokenStr + "]");
	        // A valid parse derives the G(oal) production, so begin there.
	        _CurrentToken = this.getNextToken();
	        this.parseProgram();
	        // Report the results.
	        var msg ="";
	        if (_ErrorCount ===0)
	        	msg = "no errors."
	        else if (_ErrorCount==1)
	        	msg = _ErrorCount + " error.";
	        else
	        	msg = _ErrorCount + " errors.";
	        putMessage("Parsing found "+ msg);   
		}

		//Program ::== Block 
		public parseProgram() {
			debugger;
        	this.parseBlock();
        	this.checkToken(TokenType.EOF);
        	putSuccess(this.part);
    	}
    	//Block ::== {StatementList}
    	public parseBlock(){
    		debugger;
    		this.checkToken(TokenType.LCURLY); //expect block to start with {
    		this.parseStatementList();
    		this.checkToken(TokenType.RCURLY); //expect block to end with }
    	}

    	//StatementList ::== Statement StatementList
    	//				::== epsilon
    	public parseStatementList(){
    		debugger;
    		if( _CurrentToken.type===TokenType.PRINT ||
    			_CurrentToken.type===TokenType.ID ||
    			_CurrentToken.type===TokenType.WHILE ||
    			_CurrentToken.type===TokenType.IF ||
    			_CurrentToken.type===TokenType.LCURLY ||
    			_CurrentToken.type===TokenType.INT ||
    			_CurrentToken.type===TokenType.STR ||
    			_CurrentToken.type===TokenType.BOOL
    		){
    			this.parseStatement();
    			this.parseStatementList();
    		}
    		else{
    			//Epsilon production (no code for now project 1)
    		}

    	}
    	// Statement ::== PrintStatement
    	//           ::== AssignmentStatement
    	//           ::== VarDecl
    	//           ::== WhileStatement
    	//           ::== IfStatement
    	//           ::== Block
    	public parseStatement(){
    		debugger;
	    	switch (_CurrentToken.type){
	    			case TokenType.PRINT:
	    				this.parsePrintStatement();
	    				break;
	    			case TokenType.ID:
	    				this.parseAssignmentStatement();
	    				break;
	    			case TokenType.STR:
	    			case TokenType.INT:
	    			case TokenType.BOOL:
	    				this.parseVarDecl();
	    				break;
	    			case TokenType.WHILE:
	    				this.parseWhileStatement();
	    				break;
	    			case TokenType.IF:
	    				this.parseIfStatement();
	    				break;
	    			default:
	    				this.parseBlock();
	    		}
    	}

    	// PrintStatement ::== print ( Expr )
    	public parsePrintStatement(){
    		debugger;
    		this.checkToken(TokenType.PRINT);
    		this.checkToken(TokenType.LPAREN);
    		this.parseExpr();
    		this.checkToken(TokenType.RPAREN);
    	}

    	//AssignmentStatement ::== Id = Expr
    	public parseAssignmentStatement(){
    		debugger;
    		this.parseID();
    		this.checkToken(TokenType.EQUALSIGN);
    		this.parseExpr();
    	}
    	
    	//VarDecl  ::== type Id
    	public parseVarDecl(){
    		debugger;
    		switch (_CurrentToken.type){
    			case TokenType.STR:
    				this.checkToken(TokenType.STR);
    				this.parseID();
    				break;
    			case TokenType.INT:
    				this.checkToken(TokenType.INT);
    				this.parseID();
    				break;
    			case TokenType.BOOL:
    				this.checkToken(TokenType.BOOL);
    				this.parseID();
    				break;
    			default:
    				//when we hit this it means we were expecting a type and failed
    				this.checkToken(TokenType.TYPE);
    		}

    	}
    	//WhileStatement ::== while BooleanExpr Block
    	public parseWhileStatement(){
    		debugger;
    		this.checkToken(TokenType.WHILE);
    		this.parseBooleanExpr();
    		this.parseBlock();
    	}
    	//IfStatement ::== if BooleanExpr Block
    	public parseIfStatement(){
    		debugger;
    		this.checkToken(TokenType.IF);
    		this.parseBooleanExpr();
    		this.parseBlock();
    	}
    	//Expr 	::== IntExpr
    	//		::== StringExpr
    	//		::== BooleanExpr
    	//		::==Id
    	public parseExpr(){
    		debugger;
    		switch(_CurrentToken.type){
    			case TokenType.DIGIT:
    				this.parseIntExpr();
    				break;
    			case TokenType.QUOTE:
    				this.parseStringExpr();
    				break;
    			case TokenType.LPAREN:
    			case TokenType.TRUE:
    			case TokenType.FALSE:
    				this.parseBooleanExpr();
    				break;
    			case TokenType.ID:
    				this.parseID();

    		}
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
    		debugger;
    		if(_CurrentToken.type=== TokenType.TRUE)
    			this.checkToken(TokenType.TRUE)
    		else if(_CurrentToken.type===TokenType.FALSE)
    			this.checkToken(TokenType.FALSE);
    		else {
    			this.checkToken(TokenType.LPAREN);
    			this.parseExpr();
    			if (_CurrentToken.type ===TokenType.EQUALS){
    				this.checkToken(TokenType.EQUALS);
    				this.parseExpr();
    				this.checkToken(TokenType.RPAREN);
    			}
    			else if (_CurrentToken.type ===TokenType.NOTEQUALS){
    				this.checkToken(TokenType.NOTEQUALS);
    				this.parseExpr();
    				this.checkToken(TokenType.RPAREN);
    			}			
    			else {
    				//when this is hit it means a boolean operator was expected but not found
    				this.checkToken(TokenType.BOOLOP);
    			}
    		}
    	}

    	//IntExpr	::== digit intop Expr
    	//			::== digit
    	public parseIntExpr(){
    		debugger;
    		if (_CurrentToken.type ===TokenType.DIGIT){
    			this.checkToken(TokenType.DIGIT);
    			if (_CurrentToken.type ===TokenType.ADD){
    				this.checkToken(TokenType.ADD);
    				this.parseExpr();
    			}
    		}
    		else {
    			this.checkToken(TokenType.DIGIT);
    		}
    	}
		
		//StringExpr ::== " CharList "    	
		public parseStringExpr(){
			debugger;
			this.checkToken(TokenType.QUOTE);
			this.parseCharList();
			this.checkToken(TokenType.QUOTE);

		}

		//Id ::== char
		public parseID(){
			debugger;
			this.checkToken(TokenType.ID);
		}

		//CharList	::== char CharList
		//			::== space CharList
		//			::== epsilon
		public parseCharList(){
			debugger;
			switch (_CurrentToken.type){
			    case TokenType.CHAR:
			    	this.checkToken(TokenType.CHAR);
			        break;
			    case TokenType.SPACE:
			    	this.checkToken(TokenType.SPACE);
			    	break;
			    default: 
			    	//epsilon production no code boi
			}
			if (_CurrentToken.type ==TokenType.CHAR ||_CurrentToken ===TokenType.SPACE )
				this.parseCharList();
		}
		
        public checkToken(tokenType) {
            debugger;
            if (_CurrentToken.type == tokenType) {
            	switch(tokenType){
            		case TokenType.TYPE:
            			putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[TokenType.INT] + ", "+
            				TokenTypeChar[TokenType.STR] +", or " + TokenTypeChar[TokenType.BOOL],
            			 	_CurrentToken.value);
            			break;
            		case TokenType.BOOLOP:
            			putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[TokenType.EQUALS] +", or " 
            				+ TokenTypeChar[TokenType.NOTEQUALS],
            			 	_CurrentToken.value);
            			break;
            		default:
            			putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[tokenType], _CurrentToken.value);
               	}
            } 
            else {
            	debugger;
            	switch(tokenType){
            		case TokenType.TYPE:
            			putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[TokenType.INT] + ", "+
            				TokenTypeChar[TokenType.STR] +", or " + TokenTypeChar[TokenType.BOOL],
            			 	_CurrentToken.value);
            			break;
            		case TokenType.BOOLOP:
            			putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[TokenType.EQUALS] +", or " 
            				+ TokenTypeChar[TokenType.NOTEQUALS],
            			 	_CurrentToken.value);
            			break;
            		default:
            			putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[tokenType], _CurrentToken.value);
               	}
               	putFailed(this.part)
               	throw new Error ('Failed');
       		}
       		_CurrentToken = this.getNextToken();
       	}


	}
}
