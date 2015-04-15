/* parser.ts  */
var TSC;
(function (TSC) {
    var Parser = (function () {
        function Parser() {
            this.part = 'Parser';
        }
        Parser.prototype.getNextToken = function () {
            var thisToken = EOF; // Let's assume that we're at the EOF.
            if (_TokenIndex < _Tokens.length) {
                // If we're not at EOF, then return the next token in the stream and advance the index.
                thisToken = _Tokens[_TokenIndex];
                if (_Verbose)
                    _Messenger.putMessage("Current Token " + (_TokenIndex + 1) + ": " + thisToken.toString());
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
            this.rootNode = new TSC.TreeNode(TokenTypeString[26 /* PROGRAM */], null);
            node = this.rootNode;
            this.parseBlock(node);
            node.addChild(18 /* EOF */);
            this.checkToken(18 /* EOF */);
            _Messenger.putSuccess(this.part);
        };
        //Block ::== {StatementList}
        Parser.prototype.parseBlock = function (node) {
            //debugger;
            node.addChild("BLOCK");
            //set current node to be the new block node
            node = node.getNewestChild();
            this.checkToken(0 /* LCURLY */); //expect block to start with {
            node.addChild(0 /* LCURLY */);
            this.parseStatementList(node);
            this.checkToken(1 /* RCURLY */); //expect block to end with }
            node.addChild(1 /* RCURLY */);
        };
        //StatementList ::== Statement StatementList
        //				::== epsilon
        Parser.prototype.parseStatementList = function (node) {
            if (_CurrentToken.type === 2 /* PRINT */ || _CurrentToken.type === 21 /* ID */ || _CurrentToken.type === 6 /* WHILE */ || _CurrentToken.type === 7 /* IF */ || _CurrentToken.type === 0 /* LCURLY */ || _CurrentToken.type === 8 /* INT */ || _CurrentToken.type === 9 /* STR */ || _CurrentToken.type === 10 /* BOOL */) {
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
                case 2 /* PRINT */:
                    this.parsePrintStatement(node);
                    break;
                case 21 /* ID */:
                    this.parseAssignmentStatement(node);
                    break;
                case 9 /* STR */:
                case 8 /* INT */:
                case 10 /* BOOL */:
                    this.parseVarDecl(node);
                    break;
                case 6 /* WHILE */:
                    this.parseWhileStatement(node);
                    break;
                case 7 /* IF */:
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
            this.checkToken(2 /* PRINT */);
            node.addChild(2 /* PRINT */);
            this.checkToken(3 /* LPAREN */);
            node.addChild(3 /* LPAREN */);
            this.parseExpr(node);
            this.checkToken(4 /* RPAREN */);
            node.addChild(4 /* RPAREN */);
        };
        //AssignmentStatement ::== Id = Expr
        Parser.prototype.parseAssignmentStatement = function (node) {
            node.addChild("ASSIGNMENTSTATEMENT");
            node = node.getNewestChild();
            this.parseID(node);
            this.checkToken(5 /* EQUALSIGN */);
            node.addChild(5 /* EQUALSIGN */);
            this.parseExpr(node);
        };
        //VarDecl  ::== type Id
        Parser.prototype.parseVarDecl = function (node) {
            node.addChild("VARDECL");
            node = node.getNewestChild();
            switch (_CurrentToken.type) {
                case 9 /* STR */:
                    this.checkToken(9 /* STR */);
                    node.addChild(9 /* STR */);
                    this.parseID(node);
                    break;
                case 8 /* INT */:
                    this.checkToken(8 /* INT */);
                    node.addChild(8 /* INT */);
                    this.parseID(node);
                    break;
                case 10 /* BOOL */:
                    node.addChild(10 /* BOOL */, _CurrentToken.value);
                    this.checkToken(10 /* BOOL */);
                    this.parseID(node);
                    break;
                default:
                    //when we hit this it means we were expecting a type and failed
                    this.checkToken(23 /* TYPE */);
            }
        };
        //WhileStatement ::== while BooleanExpr Block
        Parser.prototype.parseWhileStatement = function (node) {
            node.addChild("WHILESTATEMENT");
            node = node.getNewestChild();
            this.checkToken(6 /* WHILE */);
            node.addChild(6 /* WHILE */);
            this.parseBooleanExpr(node);
            this.parseBlock(node);
        };
        //IfStatement ::== if BooleanExpr Block
        Parser.prototype.parseIfStatement = function (node) {
            node.addChild("IFSTATEMENT");
            node = node.getNewestChild();
            this.checkToken(7 /* IF */);
            node.addChild(7 /* IF */);
            this.parseBooleanExpr(node);
            this.parseBlock(node);
        };
        //Expr 	::== IntExpr
        //		::== StringExpr
        //		::== BooleanExpr
        //		::== Id
        Parser.prototype.parseExpr = function (node) {
            node.addChild("EXPR");
            node = node.getNewestChild();
            switch (_CurrentToken.type) {
                case 22 /* DIGIT */:
                    this.parseIntExpr(node);
                    break;
                case 19 /* QUOTE */:
                    this.parseStringExpr(node);
                    break;
                case 3 /* LPAREN */:
                case 10 /* BOOL */:
                    this.parseBooleanExpr(node);
                    break;
                case 21 /* ID */:
                    this.parseID(node);
            }
        };
        //BooleanExpr	::== (Expr boolOp Expr)
        //				::== boolVal
        Parser.prototype.parseBooleanExpr = function (node) {
            node.addChild("BOOLEANEXPR");
            node = node.getNewestChild();
            if (_CurrentToken.type === 10 /* BOOL */) {
                //TODO change tokens to bool type with value of true false
                node.addChild(10 /* BOOL */, _CurrentToken.value);
                this.checkToken(10 /* BOOL */);
            }
            else {
                this.checkToken(3 /* LPAREN */);
                node.addChild(3 /* LPAREN */);
                this.parseExpr(node);
                if (_CurrentToken.type === 24 /* BOOLOP */) {
                    node.addChild(24 /* BOOLOP */, _CurrentToken.value);
                    this.checkToken(24 /* BOOLOP */);
                    this.parseExpr(node);
                    this.checkToken(4 /* RPAREN */);
                    node.addChild(4 /* RPAREN */);
                }
                else {
                    //when this is hit it means a boolean operator was expected but not found
                    this.checkToken(24 /* BOOLOP */);
                    node.addChild(TokenTypeString[24 /* BOOLOP */]);
                }
            }
        };
        //IntExpr	::== digit intop Expr
        //			::== digit
        Parser.prototype.parseIntExpr = function (node) {
            node.addChild("INTEXPR");
            node = node.getNewestChild();
            if (_CurrentToken.type === 22 /* DIGIT */) {
                node.addChild(22 /* DIGIT */, _CurrentToken.value);
                this.checkToken(22 /* DIGIT */);
                if (_CurrentToken.type === 17 /* ADD */) {
                    this.checkToken(17 /* ADD */);
                    node.addChild(17 /* ADD */);
                    this.parseExpr(node);
                }
            }
            else {
                this.checkToken(22 /* DIGIT */);
            }
        };
        //StringExpr ::== " CharList "    	
        Parser.prototype.parseStringExpr = function (node) {
            node.addChild("STRINGEXPR");
            node = node.getNewestChild();
            this.checkToken(19 /* QUOTE */);
            node.addChild(19 /* QUOTE */);
            this.parseCharList(node);
            this.checkToken(19 /* QUOTE */);
            node.addChild(19 /* QUOTE */);
        };
        //Id ::== char
        Parser.prototype.parseID = function (node) {
            node.addChild(21 /* ID */, _CurrentToken.value);
            node = node.getNewestChild();
            this.checkToken(21 /* ID */);
        };
        //CharList	::== char CharList
        //			::== space CharList
        //			::== epsilon
        Parser.prototype.parseCharList = function (node) {
            node.addChild("CHARLIST");
            node = node.getNewestChild();
            switch (_CurrentToken.type) {
                case 11 /* CHAR */:
                    node.addChild(11 /* CHAR */, _CurrentToken.value);
                    this.checkToken(11 /* CHAR */);
                    break;
                case 14 /* SPACE */:
                    node.addChild(14 /* SPACE */, _CurrentToken.value);
                    this.checkToken(14 /* SPACE */);
                    break;
                default:
            }
            if (_CurrentToken.type === 11 /* CHAR */ || _CurrentToken === 14 /* SPACE */)
                this.parseCharList(node);
        };
        Parser.prototype.checkToken = function (tokenType) {
            if (_CurrentToken.type == tokenType) {
                if (_Verbose) {
                    switch (tokenType) {
                        case 11 /* CHAR */:
                            _Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[21 /* ID */] + " a single character in range: a-z.", _CurrentToken.value);
                            break;
                        case 21 /* ID */:
                            _Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[21 /* ID */] + " a single character in range: a-z.", _CurrentToken.value);
                            break;
                        case 23 /* TYPE */:
                            _Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[8 /* INT */] + ", " + TokenTypeChar[9 /* STR */] + ", or " + TokenTypeChar[10 /* BOOL */], _CurrentToken.value);
                            break;
                        case 24 /* BOOLOP */:
                            _Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[12 /* EQUALS */] + ", or " + TokenTypeChar[13 /* NOTEQUALS */], _CurrentToken.value);
                            break;
                        default:
                            _Messenger.putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[tokenType], _CurrentToken.value);
                    }
                }
            }
            else {
                switch (tokenType) {
                    case 23 /* TYPE */:
                        _Messenger.putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[8 /* INT */] + ", " + TokenTypeChar[9 /* STR */] + ", or " + TokenTypeChar[10 /* BOOL */], _CurrentToken.value);
                        break;
                    case 24 /* BOOLOP */:
                        _Messenger.putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[12 /* EQUALS */] + ", or " + TokenTypeChar[13 /* NOTEQUALS */], _CurrentToken.value);
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
