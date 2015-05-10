/* parser.ts  */

module TSC
{
	export class Parser {
		public part = 'Parser';
        public rootNode:TreeNode;
		constructor(){

		}
        
	    public getNextToken(check=false) :any {
	        var thisToken = EOF;    // Let's assume that we're at the EOF.
	        if (_TokenIndex < _Tokens.length){
	            // If we're not at EOF, then return the next token in the stream and advance the index.
	            thisToken = _Tokens[_TokenIndex];
                if(_Verbose &&!check)
	               _Messenger.putMessage("Current Token "+(_TokenIndex+1)+": " + thisToken.toString());
                if (!check)
	               _TokenIndex++;
	        }
	        return thisToken;
    	}
		public parse() {	
	        _Messenger.putHeaderMessage("Parsing");
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
	        _Messenger.putHeaderMessage("Parsing found "+ msg);  
         
            
		}

		//Program ::== Block 
		public parseProgram(node:TreeNode) {
			
            this.rootNode = new TreeNode(TokenTypeString[TokenType.PROGRAM],null);
            node = this.rootNode;
        	this.parseBlock(node, -1);
            node.addChild(TokenType.EOF);
        	this.checkToken(TokenType.EOF);
            _Messenger.putSuccess(this.part);
    	}
    	//Block ::== {StatementList}
    	public parseBlock(node:TreeNode, scope){
            ////;
            scope++;
            node.addChild("BLOCK", "", scope);
            //set current node to be the new block node
            node = node.getNewestChild();

    		this.checkToken(TokenType.LCURLY); //expect block to start with {
            node.addChild(TokenType.LCURLY,"", scope);
    		this.parseStatementList(node, scope);
    		this.checkToken(TokenType.RCURLY); //expect block to end with }
            node.addChild(TokenType.RCURLY, "", scope);
            
    	}

    	//StatementList ::== Statement StatementList
    	//				::== epsilon
    	public parseStatementList(node:TreeNode, scope){
    		
    		if( _CurrentToken.type===TokenType.PRINT ||
    			_CurrentToken.type===TokenType.ID ||
    			_CurrentToken.type===TokenType.WHILE ||
    			_CurrentToken.type===TokenType.IF ||
    			_CurrentToken.type===TokenType.LCURLY ||
    			_CurrentToken.type===TokenType.INT ||
    			_CurrentToken.type===TokenType.STR ||
    			_CurrentToken.type===TokenType.BOOL
    		){
                node.addChild("STATEMENTLIST", "", scope);
                node = node.getNewestChild();
    			this.parseStatement(node, scope);
    			this.parseStatementList(node, scope);
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
    	public parseStatement(node:TreeNode, scope){
    		node.addChild("STATEMENT", "", scope);
            node = node.getNewestChild();
	    	switch (_CurrentToken.type){
	    			case TokenType.PRINT:
	    				this.parsePrintStatement(node, scope);
	    				break;
	    			case TokenType.ID:
	    				this.parseAssignmentStatement(node, scope);
	    				break;
	    			case TokenType.STR:
	    			case TokenType.INT:
	    			case TokenType.BOOL:
	    				this.parseVarDecl(node, scope);
	    				break;
	    			case TokenType.WHILE:
	    				this.parseWhileStatement(node, scope);
	    				break;
	    			case TokenType.IF:
	    				this.parseIfStatement(node, scope);
	    				break;
	    			default:
	    				this.parseBlock(node, scope);
	    		}
    	}

    	// PrintStatement ::== print ( Expr )
    	public parsePrintStatement(node:TreeNode, scope){

    		node.addChild("PRINTSTATEMENT", "", scope);
            node = node.getNewestChild();
            
    		this.checkToken(TokenType.PRINT);
            node.addChild(TokenType.PRINT, "", scope);
    		this.checkToken(TokenType.LPAREN);
            node.addChild(TokenType.LPAREN, "", scope);   
    		this.parseExpr(node, scope);
    		this.checkToken(TokenType.RPAREN);
            node.addChild(TokenType.RPAREN, "", scope);
            
    	}

    	//AssignmentStatement ::== Id = Expr
    	public parseAssignmentStatement(node:TreeNode, scope){
    		
            node.addChild("ASSIGNMENTSTATEMENT", "", scope);
            node = node.getNewestChild();
    		this.parseID(node, scope);

    		this.checkToken(TokenType.EQUALSIGN);
            node.addChild(TokenType.EQUALSIGN, "", scope);
    		this.parseExpr(node, scope);
    	}
    	
    	//VarDecl  ::== type Id
    	public parseVarDecl(node:TreeNode, scope){
    		
            node.addChild("VARDECL", "", scope);
            node = node.getNewestChild();
    		switch (_CurrentToken.type){
    			case TokenType.STR:
    				this.checkToken(TokenType.STR);
                    node.addChild(TokenType.STR, "", scope);           
    				this.parseID(node, scope);
    				break;
    			case TokenType.INT:
    				this.checkToken(TokenType.INT);
                    node.addChild(TokenType.INT, "", scope);
    				this.parseID(node, scope);
    				break;
    			case TokenType.BOOL:
                    node.addChild(TokenType.BOOL, _CurrentToken.value, scope);
    				this.checkToken(TokenType.BOOL);
    				this.parseID(node, scope);
    				break;
    			default:
    				//when we hit this it means we were expecting a type and failed
    				this.checkToken(TokenType.TYPE);
    		}

    	}
    	//WhileStatement ::== while BooleanExpr Block
    	public parseWhileStatement(node:TreeNode,scope){
    		
            node.addChild("WHILESTATEMENT", "", scope);
            node = node.getNewestChild();
    		this.checkToken(TokenType.WHILE);
            node.addChild(TokenType.WHILE, "", scope);
    		this.parseBooleanExpr(node, scope);
    		this.parseBlock(node, scope);
    	}
    	//IfStatement ::== if BooleanExpr Block
    	public parseIfStatement(node:TreeNode, scope){
    		
            node.addChild("IFSTATEMENT", "", scope);
            node = node.getNewestChild();
    		this.checkToken(TokenType.IF);
            node.addChild(TokenType.IF,"", scope);
    		this.parseBooleanExpr(node, scope);
    		this.parseBlock(node, scope);
    	}
    	//Expr 	::== IntExpr
    	//		::== StringExpr
    	//		::== BooleanExpr
    	//		::== Id
    	public parseExpr(node:TreeNode, scope){
    		//;
            node.addChild("EXPR", "", scope);
            node = node.getNewestChild();
    		switch(_CurrentToken.type){
    			case TokenType.DIGIT:
                	this.parseIntExpr(node, scope);
    				break;
    			case TokenType.QUOTE:
    				this.parseStringExpr(node, scope);
    				break;
    			case TokenType.LPAREN:
    			case TokenType.BOOL:
    				this.parseBooleanExpr(node,scope);
    				break;
    			case TokenType.ID:
    				this.parseID(node, scope);
                    break;    
    		}

    	}


    	//BooleanExpr	::== (Expr boolOp Expr)
    	//				::== boolVal
    	public parseBooleanExpr(node:TreeNode, scope){    		
            node.addChild("BOOLEANEXPR", "", scope);
            node = node.getNewestChild();
    		if(_CurrentToken.type=== TokenType.BOOL){
                //TODO change tokens to bool type with value of true false
    			node.addChild(TokenType.BOOL, _CurrentToken.value, scope);
                this.checkToken(TokenType.BOOL);
            }
    		else {
    			this.checkToken(TokenType.LPAREN);
                node.addChild(TokenType.LPAREN, "", scope);
    			this.parseExpr(node, scope);
    			if (_CurrentToken.type ===TokenType.BOOLOP){
    				node.addChild(TokenType.BOOLOP, _CurrentToken.value, scope);
                    this.checkToken(TokenType.BOOLOP);
    				this.parseExpr(node, scope);
    				this.checkToken(TokenType.RPAREN);
                    node.addChild(TokenType.RPAREN, "", scope);
    			}
    						
    			else {
    				//when this is hit it means a boolean operator was expected but not found
    				this.checkToken(TokenType.BOOLOP);
                    node.addChild(TokenTypeString[TokenType.BOOLOP], "", scope);
    			}
    		}
    	}

    	//IntExpr	::== digit intop Expr
    	//			::== digit
    	public parseIntExpr(node:TreeNode, scope){
    		//;
            node.addChild("INTEXPR", "", scope);
            node = node.getNewestChild();
    		if (_CurrentToken.type ===TokenType.DIGIT){
                node.addChild(TokenType.DIGIT, _CurrentToken.value, scope);
    			this.checkToken(TokenType.DIGIT);
                if (_CurrentToken.type ===TokenType.ADD){
    				this.checkToken(TokenType.ADD);
                    node.addChild(TokenType.ADD, "", scope);
                    if (_CurrentToken.type===TokenType.ADD){
                        this.checkToken(TokenType.DIGIT);
                    }
                    this.parseExpr(node,scope);
    			}
    		}
    		else {
    			this.checkToken(TokenType.DIGIT);
    		}
    	}
		
		//StringExpr ::== " CharList "    	
		public parseStringExpr(node:TreeNode, scope){
			
            node.addChild("STRINGEXPR", "", scope);
            node = node.getNewestChild();
			this.checkToken(TokenType.QUOTE);
            node.addChild(TokenType.QUOTE, "", scope);
			this.parseCharList(node, scope);
			this.checkToken(TokenType.QUOTE);
            node.addChild(TokenType.QUOTE, "", scope);

		}

		//Id ::== char
		public parseID(node:TreeNode, scope){
            node.addChild(TokenType.ID, _CurrentToken.value, scope);
            node = node.getNewestChild();
			this.checkToken(TokenType.ID);
		}

		//CharList	::== char CharList
		//			::== space CharList
		//			::== epsilon
		public parseCharList(node:TreeNode, scope){
			//;
            node.addChild("CHARLIST", "", scope);
            node = node.getNewestChild();
			switch (_CurrentToken.type){
			    case TokenType.CHAR:
                    node.addChild(TokenType.CHAR, _CurrentToken.value, scope);
			    	this.checkToken(TokenType.CHAR);                    
			        break;
			    case TokenType.SPACE:
                    node.addChild(TokenType.SPACE, _CurrentToken.value, scope);
			    	this.checkToken(TokenType.SPACE);
			    	break;
			    default: 
			    	//epsilon production no code boi
			}
			if (_CurrentToken.type ===TokenType.CHAR ||_CurrentToken.type ===TokenType.SPACE )
				this.parseCharList(node, scope);
		}
		
        public checkToken(tokenType) {
            
            if (_CurrentToken.type == tokenType) {
                if(_Verbose){
                	switch(tokenType){
                		case TokenType.CHAR:
                			_Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[TokenType.ID] + 
                				" a single character in range: a-z.", _CurrentToken.value);
                			break;
                		case TokenType.ID:
                			_Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[TokenType.ID] + 
                				" a single character in range: a-z.", _CurrentToken.value);
                			break;
                		case TokenType.TYPE:
                			_Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[TokenType.INT] + ", "+
                				TokenTypeChar[TokenType.STR] +", or " + TokenTypeChar[TokenType.BOOL],
                			 	_CurrentToken.value);
                			break;
                		case TokenType.BOOLOP:
                			_Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[TokenType.EQUALS] +", or " 
                				+ TokenTypeChar[TokenType.NOTEQUALS],
                			 	_CurrentToken.value);
                			break;
                		default:
                			_Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[tokenType], _CurrentToken.value);
                   	}
                }
                
            } 
            else {
            	switch(tokenType){
            		case TokenType.TYPE:
            			_Messenger.putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[TokenType.INT] + ", "+
            				TokenTypeChar[TokenType.STR] +", or " + TokenTypeChar[TokenType.BOOL],
            			 	_CurrentToken.value);
            			break;
            		case TokenType.BOOLOP:
            			_Messenger.putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[TokenType.EQUALS] +", or " 
            				+ TokenTypeChar[TokenType.NOTEQUALS],
            			 	_CurrentToken.value);
            			break;
            		default:
            			_Messenger.putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[tokenType], _CurrentToken.value);
               	}
               	_Messenger.putFailed(this.part)
               	throw new Error ('Failed');
       		}
       		_CurrentToken = this.getNextToken();
       	}


	}
}
