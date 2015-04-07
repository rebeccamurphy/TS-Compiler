/* parser.ts  */

module TSC
{
	export class Parser {
		public part = 'Parser';
        private rootNode:TreeNode;
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
	        this.parseProgram(this.rootNode);
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
		public parseProgram(node:TreeNode) {
			debugger;
            this.rootNode = new TreeNode("Program", null);
            node = this.rootNode;
        	this.parseBlock(node);
        	this.checkToken(TokenType.EOF, node);
            //TODO ADD EOF NODE
            
        	putSuccess(this.part);
    	}
    	//Block ::== {StatementList}
    	public parseBlock(node:TreeNode){
            node.addChild('Block');
            //set current node to be the new block node
            node = node.getNewestChild();

    		this.checkToken(TokenType.LCURLY, node); //expect block to start with {
            //TODO ADD { NODE
    		this.parseStatementList(node);
    		this.checkToken(TokenType.RCURLY, node); //expect block to end with }
            //TODO ADD } NODE
    	}

    	//StatementList ::== Statement StatementList
    	//				::== epsilon
    	public parseStatementList(node:TreeNode){
    		node.addChild("StatementList");
            node = node.getNewestChild();
    		if( _CurrentToken.type===TokenType.PRINT ||
    			_CurrentToken.type===TokenType.ID ||
    			_CurrentToken.type===TokenType.WHILE ||
    			_CurrentToken.type===TokenType.IF ||
    			_CurrentToken.type===TokenType.LCURLY ||
    			_CurrentToken.type===TokenType.INT ||
    			_CurrentToken.type===TokenType.STR ||
    			_CurrentToken.type===TokenType.BOOL
    		){
    			this.parseStatement(node);
    			this.parseStatementList(node);
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
    	public parseStatement(node:TreeNode){
    		node.addChild("Statement");
            node = node.getNewestChild();
	    	switch (_CurrentToken.type){
	    			case TokenType.PRINT:
	    				this.parsePrintStatement(node);
	    				break;
	    			case TokenType.ID:
	    				this.parseAssignmentStatement(node);
	    				break;
	    			case TokenType.STR:
	    			case TokenType.INT:
	    			case TokenType.BOOL:
	    				this.parseVarDecl(node);
	    				break;
	    			case TokenType.WHILE:
	    				this.parseWhileStatement(node);
	    				break;
	    			case TokenType.IF:
	    				this.parseIfStatement(node);
	    				break;
	    			default:
	    				this.parseBlock(node);
	    		}
    	}

    	// PrintStatement ::== print ( Expr )
    	public parsePrintStatement(node:TreeNode){
    		debugger;
    		this.checkToken(TokenType.PRINT, node);
    		this.checkToken(TokenType.LPAREN, node);
    		this.parseExpr(node);
    		this.checkToken(TokenType.RPAREN, node);
    	}

    	//AssignmentStatement ::== Id = Expr
    	public parseAssignmentStatement(node:TreeNode){
    		debugger;
            node.addChild("AssignmentStatement");
            node = node.getNewestChild();
    		this.parseID(node);
    		this.checkToken(TokenType.EQUALSIGN, node);
    		this.parseExpr(node);
    	}
    	
    	//VarDecl  ::== type Id
    	public parseVarDecl(node:TreeNode){
    		debugger;
            node.addChild("VarDecl");
            node = node.getNewestChild();
    		switch (_CurrentToken.type){
    			case TokenType.STR:
    				this.checkToken(TokenType.STR, node);
    				this.parseID(node);
    				break;
    			case TokenType.INT:
    				this.checkToken(TokenType.INT, node);
    				this.parseID(node);
    				break;
    			case TokenType.BOOL:
    				this.checkToken(TokenType.BOOL, node);
    				this.parseID(node);
    				break;
    			default:
    				//when we hit this it means we were expecting a type and failed
    				this.checkToken(TokenType.TYPE, node);
    		}

    	}
    	//WhileStatement ::== while BooleanExpr Block
    	public parseWhileStatement(node:TreeNode){
    		debugger;
            node.addChild("WhileStatement");
            node = node.getNewestChild();
    		this.checkToken(TokenType.WHILE, node);
    		this.parseBooleanExpr(node);
    		this.parseBlock(node);
    	}
    	//IfStatement ::== if BooleanExpr Block
    	public parseIfStatement(node:TreeNode){
    		debugger;
            node.addChild("IfStatement");
            node = node.getNewestChild();
    		this.checkToken(TokenType.IF,node);
    		this.parseBooleanExpr(node);
    		this.parseBlock(node);
    	}
    	//Expr 	::== IntExpr
    	//		::== StringExpr
    	//		::== BooleanExpr
    	//		::==Id
    	public parseExpr(node:TreeNode){
    		debugger;
            node.addChild("Expr");
            node = node.getNewestChild();
    		switch(_CurrentToken.type){
    			case TokenType.DIGIT:
    				this.parseIntExpr(node);
    				break;
    			case TokenType.QUOTE:
    				this.parseStringExpr(node);
    				break;
    			case TokenType.LPAREN:
    			case TokenType.TRUE:
    			case TokenType.FALSE:
    				this.parseBooleanExpr(node);
    				break;
    			case TokenType.ID:
    				this.parseID(node);

    		}
    	}

    	public parseE(node:TreeNode) {
            node.addChild("E");
            node =node.getNewestChild();
	        // All E productions begin with a digit, so make sure that we have one.
	        this.checkToken("digit", node);
	        // Look ahead 1 char (which is now in _CurrentToken because checkToken 
	        // consumes another one) and see which E production to follow.
	        if (_CurrentToken != EOF) {
	            // We're not done, we we expect to have an op.
	            this.checkToken("op", node);
	            this.parseE(node);
	        } else {
	            // There is nothing else in the token stream, 
	            // and that's cool since E --> digit is valid.
	            putMessage("EOF reached");
	        }
    	}

    	//BooleanExpr	::== (Expr boolOp Expr)
    	//				::== boolVal
    	public parseBooleanExpr(node:TreeNode){
    		debugger;
            node.addChild("BooleanExpr");
            node = node.getNewestChild();
    		if(_CurrentToken.type=== TokenType.TRUE)
    			this.checkToken(TokenType.TRUE, node)
    		else if(_CurrentToken.type===TokenType.FALSE)
    			this.checkToken(TokenType.FALSE, node);
    		else {
    			this.checkToken(TokenType.LPAREN, node);
    			this.parseExpr(node);
    			if (_CurrentToken.type ===TokenType.EQUALS){
    				this.checkToken(TokenType.EQUALS,node);
    				this.parseExpr(node);
    				this.checkToken(TokenType.RPAREN, node);
    			}
    			else if (_CurrentToken.type ===TokenType.NOTEQUALS){
    				this.checkToken(TokenType.NOTEQUALS, node);
    				this.parseExpr(node);
    				this.checkToken(TokenType.RPAREN, node);
    			}			
    			else {
    				//when this is hit it means a boolean operator was expected but not found
    				this.checkToken(TokenType.BOOLOP, node);
    			}
    		}
    	}

    	//IntExpr	::== digit intop Expr
    	//			::== digit
    	public parseIntExpr(node:TreeNode){
    		debugger;
            node.addChild("IntExpr");
            node = node.getNewestChild();
    		if (_CurrentToken.type ===TokenType.DIGIT){
    			this.checkToken(TokenType.DIGIT,node);
    			if (_CurrentToken.type ===TokenType.ADD){
    				this.checkToken(TokenType.ADD, node);
    				this.parseExpr(node);
    			}
    		}
    		else {
    			this.checkToken(TokenType.DIGIT, node);
    		}
    	}
		
		//StringExpr ::== " CharList "    	
		public parseStringExpr(node:TreeNode){
			debugger;
            node.addChild("StringExpr");
            node = node.getNewestChild();
			this.checkToken(TokenType.QUOTE, node);
			this.parseCharList(node);
			this.checkToken(TokenType.QUOTE,node);

		}

		//Id ::== char
		public parseID(node:TreeNode){
			debugger;
            node.addChild("Id");
            node = node.getNewestChild();
			this.checkToken(TokenType.ID, node);
		}

		//CharList	::== char CharList
		//			::== space CharList
		//			::== epsilon
		public parseCharList(node:TreeNode){
			debugger;
            node.addChild("CharList");
            node = node.getNewestChild();
			switch (_CurrentToken.type){
			    case TokenType.CHAR:
			    	this.checkToken(TokenType.CHAR, node);
			        break;
			    case TokenType.SPACE:
			    	this.checkToken(TokenType.SPACE,node);
			    	break;
			    default: 
			    	//epsilon production no code boi
			}
			if (_CurrentToken.type ==TokenType.CHAR ||_CurrentToken ===TokenType.SPACE )
				this.parseCharList(node);
		}
		
        public checkToken(tokenType, node) {
            debugger;
            if (_CurrentToken.type == tokenType) {
                node.addChild(TokenTypeString[_CurrentToken.type]);
                node = node.getNextToken();
            	switch(tokenType){
            		case TokenType.CHAR:
            			putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[TokenType.ID] + 
            				" a single character in range: a-z.", _CurrentToken.value);
            			break;
            		case TokenType.ID:
            			putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[TokenType.ID] + 
            				" a single character in range: a-z.", _CurrentToken.value);
            			break;
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
