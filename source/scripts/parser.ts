/* parser.ts  */

module TSC
{
	export class Parser {
		public part = 'Parser';
        public rootNode:TreeNode;
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
            this.rootNode.printTree(0);
		}

		//Program ::== Block 
		public parseProgram(node:TreeNode) {
			
            this.rootNode = new TreeNode("PROGRAM", null);
            node = this.rootNode;
        	this.parseBlock(node);
        	this.checkToken(TokenType.EOF);
            node.addChildWithValue(TokenTypeString[TokenType.EOF], TokenTypeChar[TokenType.EOF]);
        	putSuccess(this.part);
    	}
    	//Block ::== {StatementList}
    	public parseBlock(node:TreeNode){
            node.addChild('BLOCK');
            //set current node to be the new block node
            node = node.getNewestChild();

    		this.checkToken(TokenType.LCURLY); //expect block to start with {
            node.addChildWithValue(TokenTypeString[TokenType.LCURLY], TokenTypeChar[TokenType.LCURLY]);
    		this.parseStatementList(node);
    		this.checkToken(TokenType.RCURLY); //expect block to end with }
            node.addChildWithValue(TokenTypeString[TokenType.RCURLY], TokenTypeChar[TokenType.RCURLY]);
            
    	}

    	//StatementList ::== Statement StatementList
    	//				::== epsilon
    	public parseStatementList(node:TreeNode){
    		
    		if( _CurrentToken.type===TokenType.PRINT ||
    			_CurrentToken.type===TokenType.ID ||
    			_CurrentToken.type===TokenType.WHILE ||
    			_CurrentToken.type===TokenType.IF ||
    			_CurrentToken.type===TokenType.LCURLY ||
    			_CurrentToken.type===TokenType.INT ||
    			_CurrentToken.type===TokenType.STR ||
    			_CurrentToken.type===TokenType.BOOL
    		){
                node.addChild("STATEMENTLIST");
                node = node.getNewestChild();
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
    		node.addChild("STATEMENT");
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

    		node.addChild("PRINTSTATEMENT");
            node = node.getNewestChild();
            
    		this.checkToken(TokenType.PRINT);
            node.addChild("PRINT");
    		this.checkToken(TokenType.LPAREN);
            node.addChildWithValue(TokenTypeString[TokenType.LPAREN],TokenTypeChar[TokenType.LPAREN]);   
    		this.parseExpr(node);
    		this.checkToken(TokenType.RPAREN);
            node.addChildWithValue(TokenTypeString[TokenType.RPAREN], TokenTypeChar[TokenType.RPAREN]);
            
    	}

    	//AssignmentStatement ::== Id = Expr
    	public parseAssignmentStatement(node:TreeNode){
    		
            node.addChild("ASSIGNMENTSTATEMENT");
            node = node.getNewestChild();
    		this.parseID(node);

    		this.checkToken(TokenType.EQUALSIGN);
            node.addChildWithValue(TokenTypeString[TokenType.EQUALSIGN], TokenTypeChar[TokenType.EQUALSIGN]);
    		this.parseExpr(node);
    	}
    	
    	//VarDecl  ::== type Id
    	public parseVarDecl(node:TreeNode){
    		
            node.addChild("VARDECL");
            node = node.getNewestChild();
    		switch (_CurrentToken.type){
    			case TokenType.STR:
    				this.checkToken(TokenType.STR);
                    node.addChild(TokenTypeString[TokenType.STR]);           
    				this.parseID(node);
    				break;
    			case TokenType.INT:
    				this.checkToken(TokenType.INT);
                    node.addChild(TokenTypeString[TokenType.INT]);
    				this.parseID(node);
    				break;
    			case TokenType.BOOL:
    				this.checkToken(TokenType.BOOL);
                    node.addChild(TokenTypeString[TokenType.BOOL]);
    				this.parseID(node);
    				break;
    			default:
    				//when we hit this it means we were expecting a type and failed
    				this.checkToken(TokenType.TYPE);
    		}

    	}
    	//WhileStatement ::== while BooleanExpr Block
    	public parseWhileStatement(node:TreeNode){
    		
            node.addChild("WHILESTATEMENT");
            node = node.getNewestChild();
    		this.checkToken(TokenType.WHILE);
            node.addChild(TokenTypeString[TokenType.WHILE]);
    		this.parseBooleanExpr(node);
    		this.parseBlock(node);
    	}
    	//IfStatement ::== if BooleanExpr Block
    	public parseIfStatement(node:TreeNode){
    		
            node.addChild("IFSTATEMENT");
            node = node.getNewestChild();
    		this.checkToken(TokenType.IF);
            node.addChild(TokenTypeString[TokenType.IF]);
    		this.parseBooleanExpr(node);
    		this.parseBlock(node);
    	}
    	//Expr 	::== IntExpr
    	//		::== StringExpr
    	//		::== BooleanExpr
    	//		::== Id
    	public parseExpr(node:TreeNode){
    		
            node.addChild("EXPR");
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


    	//BooleanExpr	::== (Expr boolOp Expr)
    	//				::== boolVal
    	public parseBooleanExpr(node:TreeNode){    		
            node.addChild("BOOLEANEXPR");
            node = node.getNewestChild();
    		if(_CurrentToken.type=== TokenType.TRUE){
                //TODO change tokens to bool type with value of true false
    			this.checkToken(TokenType.TRUE);
                node.addChild(TokenTypeString[TokenType.TRUE]);
            }
    		else if(_CurrentToken.type===TokenType.FALSE){
    			this.checkToken(TokenType.FALSE);
                node.addChild(TokenTypeString[TokenType.FALSE]);
            }
    		else {
    			this.checkToken(TokenType.LPAREN);
                node.addChild(TokenTypeString[TokenType.LPAREN]);
    			this.parseExpr(node);
    			if (_CurrentToken.type ===TokenType.EQUALS){
    				this.checkToken(TokenType.EQUALS);
                    node.addChildWithValue(TokenTypeString[TokenType.EQUALS], TokenTypeChar[TokenType.EQUALS]);
    				this.parseExpr(node);
    				this.checkToken(TokenType.RPAREN);
                    node.addChildWithValue(TokenTypeString[TokenType.RPAREN], TokenTypeChar[TokenType.RPAREN]);
    			}
    			else if (_CurrentToken.type ===TokenType.NOTEQUALS){
    				this.checkToken(TokenType.NOTEQUALS);
                    node.addChildWithValue(TokenTypeString[TokenType.NOTEQUALS], TokenTypeChar[TokenType.NOTEQUALS]);
    				this.parseExpr(node);
    				this.checkToken(TokenType.RPAREN);
                    node.addChildWithValue(TokenTypeString[TokenType.RPAREN], TokenTypeChar[TokenType.RPAREN]);
    			}			
    			else {
    				//when this is hit it means a boolean operator was expected but not found
    				this.checkToken(TokenType.BOOLOP);
                    node.addChild(TokenTypeString[TokenType.BOOLOP]);
    			}
    		}
    	}

    	//IntExpr	::== digit intop Expr
    	//			::== digit
    	public parseIntExpr(node:TreeNode){
    		
            node.addChild("INTEXPR");
            node = node.getNewestChild();
    		if (_CurrentToken.type ===TokenType.DIGIT){
                node.addChildWithValue(TokenTypeString[TokenType.DIGIT], _CurrentToken.value);
    			this.checkToken(TokenType.DIGIT);
                if (_CurrentToken.type ===TokenType.ADD){
    				this.checkToken(TokenType.ADD);
                    node.addChildWithValue(TokenTypeString[TokenType.ADD], TokenTypeChar[TokenType.ADD]);
    				this.parseExpr(node);
    			}
    		}
    		else {
    			this.checkToken(TokenType.DIGIT);
    		}
    	}
		
		//StringExpr ::== " CharList "    	
		public parseStringExpr(node:TreeNode){
			
            node.addChild("STRINGEXPR");
            node = node.getNewestChild();
			this.checkToken(TokenType.QUOTE);
            node.addChild(TokenTypeString[TokenType.QUOTE]);
			this.parseCharList(node);
			this.checkToken(TokenType.QUOTE);
            node.addChild(TokenTypeString[TokenType.QUOTE]);

		}

		//Id ::== char
		public parseID(node:TreeNode){
            node.addChildWithValue("ID",_CurrentToken.value );
            node = node.getNewestChild();
			this.checkToken(TokenType.ID);
		}

		//CharList	::== char CharList
		//			::== space CharList
		//			::== epsilon
		public parseCharList(node:TreeNode){
			
            node.addChild("CHARLIST");
            node = node.getNewestChild();
			switch (_CurrentToken.type){
			    case TokenType.CHAR:
			    	this.checkToken(TokenType.CHAR);
                    node.addChild(TokenTypeString[TokenType.CHAR]);
			        break;
			    case TokenType.SPACE:
			    	this.checkToken(TokenType.SPACE);
                    node.addChild(TokenTypeString[TokenType.SPACE]);
			    	break;
			    default: 
			    	//epsilon production no code boi
			}
			if (_CurrentToken.type ===TokenType.CHAR ||_CurrentToken ===TokenType.SPACE )
				this.parseCharList(node);
		}
		
        public checkToken(tokenType) {
            
            if (_CurrentToken.type == tokenType) {
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
