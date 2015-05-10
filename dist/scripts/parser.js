/* parser.ts  */
var TSC;
(function (TSC) {
    var Parser = (function () {
        function Parser() {
            this.part = 'Parser';
        }
        Parser.prototype.getNextToken = function (check) {
            if (check === void 0) { check = false; }
            var thisToken = EOF; // Let's assume that we're at the EOF.
            if (_TokenIndex < _Tokens.length) {
                // If we're not at EOF, then return the next token in the stream and advance the index.
                thisToken = _Tokens[_TokenIndex];
                if (_Verbose && !check)
                    _Messenger.putMessage("Current Token " + (_TokenIndex + 1) + ": " + thisToken.toString());
                if (!check)
                    _TokenIndex++;
            }
            return thisToken;
        };
        Parser.prototype.parse = function () {
            _Messenger.putHeaderMessage("Parsing");
            // A valid parse derives the G(oal) production, so begin there.
            _CurrentToken = this.getNextToken();
            this.parseProgram(this.rootNode);
            // Report the results.
            var msg = "";
            if (_ErrorCount === 0)
                msg = "no errors.";
            else if (_ErrorCount == 1)
                msg = _ErrorCount + " error.";
            else
                msg = _ErrorCount + " errors.";
            _Messenger.putHeaderMessage("Parsing found " + msg);
        };
        //Program ::== Block 
        Parser.prototype.parseProgram = function (node) {
            this.rootNode = new TSC.TreeNode(TokenTypeString[TokenType.PROGRAM], null);
            node = this.rootNode;
            this.parseBlock(node);
            node.addChild(TokenType.EOF);
            this.checkToken(TokenType.EOF);
            _Messenger.putSuccess(this.part);
        };
        //Block ::== {StatementList}
        Parser.prototype.parseBlock = function (node) {
            ////;
            _ScopeForParse++;
            node.addChild("BLOCK");
            //set current node to be the new block node
            node = node.getNewestChild();
            this.checkToken(TokenType.LCURLY); //expect block to start with {
            node.addChild(TokenType.LCURLY);
            this.parseStatementList(node);
            this.checkToken(TokenType.RCURLY); //expect block to end with }
            node.addChild(TokenType.RCURLY);
        };
        //StatementList ::== Statement StatementList
        //				::== epsilon
        Parser.prototype.parseStatementList = function (node) {
            if (_CurrentToken.type === TokenType.PRINT ||
                _CurrentToken.type === TokenType.ID ||
                _CurrentToken.type === TokenType.WHILE ||
                _CurrentToken.type === TokenType.IF ||
                _CurrentToken.type === TokenType.LCURLY ||
                _CurrentToken.type === TokenType.INT ||
                _CurrentToken.type === TokenType.STR ||
                _CurrentToken.type === TokenType.BOOL) {
                node.addChild("STATEMENTLIST");
                node = node.getNewestChild();
                this.parseStatement(node);
                this.parseStatementList(node);
            }
            else {
            }
        };
        // Statement ::== PrintStatement
        //           ::== AssignmentStatement
        //           ::== VarDecl
        //           ::== WhileStatement
        //           ::== IfStatement
        //           ::== Block
        Parser.prototype.parseStatement = function (node) {
            node.addChild("STATEMENT");
            node = node.getNewestChild();
            switch (_CurrentToken.type) {
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
        };
        // PrintStatement ::== print ( Expr )
        Parser.prototype.parsePrintStatement = function (node) {
            node.addChild("PRINTSTATEMENT");
            node = node.getNewestChild();
            this.checkToken(TokenType.PRINT);
            node.addChild(TokenType.PRINT);
            this.checkToken(TokenType.LPAREN);
            node.addChild(TokenType.LPAREN);
            this.parseExpr(node);
            this.checkToken(TokenType.RPAREN);
            node.addChild(TokenType.RPAREN);
        };
        //AssignmentStatement ::== Id = Expr
        Parser.prototype.parseAssignmentStatement = function (node) {
            node.addChild("ASSIGNMENTSTATEMENT");
            node = node.getNewestChild();
            this.parseID(node);
            this.checkToken(TokenType.EQUALSIGN);
            node.addChild(TokenType.EQUALSIGN);
            this.parseExpr(node);
        };
        //VarDecl  ::== type Id
        Parser.prototype.parseVarDecl = function (node) {
            node.addChild("VARDECL");
            node = node.getNewestChild();
            switch (_CurrentToken.type) {
                case TokenType.STR:
                    this.checkToken(TokenType.STR);
                    node.addChild(TokenType.STR);
                    this.parseID(node);
                    break;
                case TokenType.INT:
                    this.checkToken(TokenType.INT);
                    node.addChild(TokenType.INT);
                    this.parseID(node);
                    break;
                case TokenType.BOOL:
                    node.addChild(TokenType.BOOL, _CurrentToken.value);
                    this.checkToken(TokenType.BOOL);
                    this.parseID(node);
                    break;
                default:
                    //when we hit this it means we were expecting a type and failed
                    this.checkToken(TokenType.TYPE);
            }
        };
        //WhileStatement ::== while BooleanExpr Block
        Parser.prototype.parseWhileStatement = function (node) {
            node.addChild("WHILESTATEMENT");
            node = node.getNewestChild();
            this.checkToken(TokenType.WHILE);
            node.addChild(TokenType.WHILE);
            this.parseBooleanExpr(node);
            this.parseBlock(node);
        };
        //IfStatement ::== if BooleanExpr Block
        Parser.prototype.parseIfStatement = function (node) {
            node.addChild("IFSTATEMENT");
            node = node.getNewestChild();
            this.checkToken(TokenType.IF);
            node.addChild(TokenType.IF);
            this.parseBooleanExpr(node);
            this.parseBlock(node);
        };
        //Expr 	::== IntExpr
        //		::== StringExpr
        //		::== BooleanExpr
        //		::== Id
        Parser.prototype.parseExpr = function (node) {
            //;
            node.addChild("EXPR");
            node = node.getNewestChild();
            switch (_CurrentToken.type) {
                case TokenType.DIGIT:
                    this.parseIntExpr(node);
                    break;
                case TokenType.QUOTE:
                    this.parseStringExpr(node);
                    break;
                case TokenType.LPAREN:
                case TokenType.BOOL:
                    this.parseBooleanExpr(node);
                    break;
                case TokenType.ID:
                    this.parseID(node);
                    break;
            }
        };
        //BooleanExpr	::== (Expr boolOp Expr)
        //				::== boolVal
        Parser.prototype.parseBooleanExpr = function (node) {
            node.addChild("BOOLEANEXPR");
            node = node.getNewestChild();
            if (_CurrentToken.type === TokenType.BOOL) {
                //TODO change tokens to bool type with value of true false
                node.addChild(TokenType.BOOL, _CurrentToken.value);
                this.checkToken(TokenType.BOOL);
            }
            else {
                this.checkToken(TokenType.LPAREN);
                node.addChild(TokenType.LPAREN);
                this.parseExpr(node);
                if (_CurrentToken.type === TokenType.BOOLOP) {
                    node.addChild(TokenType.BOOLOP, _CurrentToken.value);
                    this.checkToken(TokenType.BOOLOP);
                    this.parseExpr(node);
                    this.checkToken(TokenType.RPAREN);
                    node.addChild(TokenType.RPAREN);
                }
                else {
                    //when this is hit it means a boolean operator was expected but not found
                    this.checkToken(TokenType.BOOLOP);
                    node.addChild(TokenTypeString[TokenType.BOOLOP]);
                }
            }
        };
        //IntExpr	::== digit intop Expr
        //			::== digit
        Parser.prototype.parseIntExpr = function (node) {
            //;
            node.addChild("INTEXPR");
            node = node.getNewestChild();
            if (_CurrentToken.type === TokenType.DIGIT) {
                node.addChild(TokenType.DIGIT, _CurrentToken.value);
                this.checkToken(TokenType.DIGIT);
                if (_CurrentToken.type === TokenType.ADD) {
                    this.checkToken(TokenType.ADD);
                    node.addChild(TokenType.ADD);
                    if (_CurrentToken.type === TokenType.ADD) {
                        this.checkToken(TokenType.DIGIT);
                    }
                    this.parseExpr(node);
                }
            }
            else {
                this.checkToken(TokenType.DIGIT);
            }
        };
        //StringExpr ::== " CharList "    	
        Parser.prototype.parseStringExpr = function (node) {
            node.addChild("STRINGEXPR");
            node = node.getNewestChild();
            this.checkToken(TokenType.QUOTE);
            node.addChild(TokenType.QUOTE);
            this.parseCharList(node);
            this.checkToken(TokenType.QUOTE);
            node.addChild(TokenType.QUOTE);
        };
        //Id ::== char
        Parser.prototype.parseID = function (node) {
            node.addChild(TokenType.ID, _CurrentToken.value);
            node = node.getNewestChild();
            this.checkToken(TokenType.ID);
        };
        //CharList	::== char CharList
        //			::== space CharList
        //			::== epsilon
        Parser.prototype.parseCharList = function (node) {
            //;
            node.addChild("CHARLIST");
            node = node.getNewestChild();
            switch (_CurrentToken.type) {
                case TokenType.CHAR:
                    node.addChild(TokenType.CHAR, _CurrentToken.value);
                    this.checkToken(TokenType.CHAR);
                    break;
                case TokenType.SPACE:
                    node.addChild(TokenType.SPACE, _CurrentToken.value);
                    this.checkToken(TokenType.SPACE);
                    break;
                default:
            }
            if (_CurrentToken.type === TokenType.CHAR || _CurrentToken.type === TokenType.SPACE)
                this.parseCharList(node);
        };
        Parser.prototype.checkToken = function (tokenType) {
            if (_CurrentToken.type == tokenType) {
                if (_Verbose) {
                    switch (tokenType) {
                        case TokenType.CHAR:
                            _Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[TokenType.ID] +
                                " a single character in range: a-z.", _CurrentToken.value);
                            break;
                        case TokenType.ID:
                            _Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[TokenType.ID] +
                                " a single character in range: a-z.", _CurrentToken.value);
                            break;
                        case TokenType.TYPE:
                            _Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[TokenType.INT] + ", " +
                                TokenTypeChar[TokenType.STR] + ", or " + TokenTypeChar[TokenType.BOOL], _CurrentToken.value);
                            break;
                        case TokenType.BOOLOP:
                            _Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[TokenType.EQUALS] + ", or "
                                + TokenTypeChar[TokenType.NOTEQUALS], _CurrentToken.value);
                            break;
                        default:
                            _Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[tokenType], _CurrentToken.value);
                    }
                }
            }
            else {
                switch (tokenType) {
                    case TokenType.TYPE:
                        _Messenger.putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[TokenType.INT] + ", " +
                            TokenTypeChar[TokenType.STR] + ", or " + TokenTypeChar[TokenType.BOOL], _CurrentToken.value);
                        break;
                    case TokenType.BOOLOP:
                        _Messenger.putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[TokenType.EQUALS] + ", or "
                            + TokenTypeChar[TokenType.NOTEQUALS], _CurrentToken.value);
                        break;
                    default:
                        _Messenger.putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[tokenType], _CurrentToken.value);
                }
                _Messenger.putFailed(this.part);
                throw new Error('Failed');
            }
            _CurrentToken = this.getNextToken();
        };
        return Parser;
    })();
    TSC.Parser = Parser;
})(TSC || (TSC = {}));
