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
                putMessage("Current token:" + thisToken.toString());
                _TokenIndex++;
            }
            return thisToken;
        };
        Parser.prototype.getPrevToken = function () {
            var thisToken;
            if (_TokenIndex - 1 >= 0) {
                // If we're not at EOF, then return the next token in the stream and advance the index.
                thisToken = _Tokens[_TokenIndex - 1];
            }
            return thisToken;
        };
        Parser.prototype.parse = function () {
            debugger;
            putMessage("Parsing [" + _TokenStr + "]");
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
            putMessage("Parsing found " + msg);
        };
        //Program ::== Block 
        Parser.prototype.parseProgram = function (node) {
            debugger;
            this.rootNode = new TSC.TreeNode("Program", null);
            node = this.rootNode;
            this.parseBlock(node);
            this.checkToken(18 /* EOF */, node);
            //TODO ADD EOF NODE
            putSuccess(this.part);
        };
        //Block ::== {StatementList}
        Parser.prototype.parseBlock = function (node) {
            node.addChild('Block');
            //set current node to be the new block node
            node = node.getNewestChild();
            this.checkToken(0 /* LCURLY */, node); //expect block to start with {
            //TODO ADD { NODE
            this.parseStatementList(node);
            this.checkToken(1 /* RCURLY */, node); //expect block to end with }
            //TODO ADD } NODE
        };
        //StatementList ::== Statement StatementList
        //				::== epsilon
        Parser.prototype.parseStatementList = function (node) {
            node.addChild("StatementList");
            node = node.getNewestChild();
            if (_CurrentToken.type === 2 /* PRINT */ || _CurrentToken.type === 21 /* ID */ || _CurrentToken.type === 6 /* WHILE */ || _CurrentToken.type === 7 /* IF */ || _CurrentToken.type === 0 /* LCURLY */ || _CurrentToken.type === 8 /* INT */ || _CurrentToken.type === 9 /* STR */ || _CurrentToken.type === 10 /* BOOL */) {
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
            node.addChild("Statement");
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
            debugger;
            this.checkToken(2 /* PRINT */, node);
            this.checkToken(3 /* LPAREN */, node);
            this.parseExpr(node);
            this.checkToken(4 /* RPAREN */, node);
        };
        //AssignmentStatement ::== Id = Expr
        Parser.prototype.parseAssignmentStatement = function (node) {
            debugger;
            node.addChild("AssignmentStatement");
            node = node.getNewestChild();
            this.parseID(node);
            this.checkToken(5 /* EQUALSIGN */, node);
            this.parseExpr(node);
        };
        //VarDecl  ::== type Id
        Parser.prototype.parseVarDecl = function (node) {
            debugger;
            node.addChild("VarDecl");
            node = node.getNewestChild();
            switch (_CurrentToken.type) {
                case 9 /* STR */:
                    this.checkToken(9 /* STR */, node);
                    this.parseID(node);
                    break;
                case 8 /* INT */:
                    this.checkToken(8 /* INT */, node);
                    this.parseID(node);
                    break;
                case 10 /* BOOL */:
                    this.checkToken(10 /* BOOL */, node);
                    this.parseID(node);
                    break;
                default:
                    //when we hit this it means we were expecting a type and failed
                    this.checkToken(23 /* TYPE */, node);
            }
        };
        //WhileStatement ::== while BooleanExpr Block
        Parser.prototype.parseWhileStatement = function (node) {
            debugger;
            node.addChild("WhileStatement");
            node = node.getNewestChild();
            this.checkToken(6 /* WHILE */, node);
            this.parseBooleanExpr(node);
            this.parseBlock(node);
        };
        //IfStatement ::== if BooleanExpr Block
        Parser.prototype.parseIfStatement = function (node) {
            debugger;
            node.addChild("IfStatement");
            node = node.getNewestChild();
            this.checkToken(7 /* IF */, node);
            this.parseBooleanExpr(node);
            this.parseBlock(node);
        };
        //Expr 	::== IntExpr
        //		::== StringExpr
        //		::== BooleanExpr
        //		::==Id
        Parser.prototype.parseExpr = function (node) {
            debugger;
            node.addChild("Expr");
            node = node.getNewestChild();
            switch (_CurrentToken.type) {
                case 22 /* DIGIT */:
                    this.parseIntExpr(node);
                    break;
                case 19 /* QUOTE */:
                    this.parseStringExpr(node);
                    break;
                case 3 /* LPAREN */:
                case 16 /* TRUE */:
                case 15 /* FALSE */:
                    this.parseBooleanExpr(node);
                    break;
                case 21 /* ID */:
                    this.parseID(node);
            }
        };
        Parser.prototype.parseE = function (node) {
            node.addChild("E");
            node = node.getNewestChild();
            // All E productions begin with a digit, so make sure that we have one.
            this.checkToken("digit", node);
            // Look ahead 1 char (which is now in _CurrentToken because checkToken 
            // consumes another one) and see which E production to follow.
            if (_CurrentToken != EOF) {
                // We're not done, we we expect to have an op.
                this.checkToken("op", node);
                this.parseE(node);
            }
            else {
                // There is nothing else in the token stream, 
                // and that's cool since E --> digit is valid.
                putMessage("EOF reached");
            }
        };
        //BooleanExpr	::== (Expr boolOp Expr)
        //				::== boolVal
        Parser.prototype.parseBooleanExpr = function (node) {
            debugger;
            node.addChild("BooleanExpr");
            node = node.getNewestChild();
            if (_CurrentToken.type === 16 /* TRUE */)
                this.checkToken(16 /* TRUE */, node);
            else if (_CurrentToken.type === 15 /* FALSE */)
                this.checkToken(15 /* FALSE */, node);
            else {
                this.checkToken(3 /* LPAREN */, node);
                this.parseExpr(node);
                if (_CurrentToken.type === 12 /* EQUALS */) {
                    this.checkToken(12 /* EQUALS */, node);
                    this.parseExpr(node);
                    this.checkToken(4 /* RPAREN */, node);
                }
                else if (_CurrentToken.type === 13 /* NOTEQUALS */) {
                    this.checkToken(13 /* NOTEQUALS */, node);
                    this.parseExpr(node);
                    this.checkToken(4 /* RPAREN */, node);
                }
                else {
                    //when this is hit it means a boolean operator was expected but not found
                    this.checkToken(24 /* BOOLOP */, node);
                }
            }
        };
        //IntExpr	::== digit intop Expr
        //			::== digit
        Parser.prototype.parseIntExpr = function (node) {
            debugger;
            node.addChild("IntExpr");
            node = node.getNewestChild();
            if (_CurrentToken.type === 22 /* DIGIT */) {
                this.checkToken(22 /* DIGIT */, node);
                if (_CurrentToken.type === 17 /* ADD */) {
                    this.checkToken(17 /* ADD */, node);
                    this.parseExpr(node);
                }
            }
            else {
                this.checkToken(22 /* DIGIT */, node);
            }
        };
        //StringExpr ::== " CharList "    	
        Parser.prototype.parseStringExpr = function (node) {
            debugger;
            node.addChild("StringExpr");
            node = node.getNewestChild();
            this.checkToken(19 /* QUOTE */, node);
            this.parseCharList(node);
            this.checkToken(19 /* QUOTE */, node);
        };
        //Id ::== char
        Parser.prototype.parseID = function (node) {
            debugger;
            node.addChild("Id");
            node = node.getNewestChild();
            this.checkToken(21 /* ID */, node);
        };
        //CharList	::== char CharList
        //			::== space CharList
        //			::== epsilon
        Parser.prototype.parseCharList = function (node) {
            debugger;
            node.addChild("CharList");
            node = node.getNewestChild();
            switch (_CurrentToken.type) {
                case 11 /* CHAR */:
                    this.checkToken(11 /* CHAR */, node);
                    break;
                case 14 /* SPACE */:
                    this.checkToken(14 /* SPACE */, node);
                    break;
                default:
            }
            if (_CurrentToken.type == 11 /* CHAR */ || _CurrentToken === 14 /* SPACE */)
                this.parseCharList(node);
        };
        Parser.prototype.checkToken = function (tokenType, node) {
            debugger;
            if (_CurrentToken.type == tokenType) {
                node.addChild(TokenTypeString[_CurrentToken.type]);
                node = node.getNextToken();
                switch (tokenType) {
                    case 11 /* CHAR */:
                        putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[21 /* ID */] + " a single character in range: a-z.", _CurrentToken.value);
                        break;
                    case 21 /* ID */:
                        putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[21 /* ID */] + " a single character in range: a-z.", _CurrentToken.value);
                        break;
                    case 23 /* TYPE */:
                        putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[8 /* INT */] + ", " + TokenTypeChar[9 /* STR */] + ", or " + TokenTypeChar[10 /* BOOL */], _CurrentToken.value);
                        break;
                    case 24 /* BOOLOP */:
                        putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[12 /* EQUALS */] + ", or " + TokenTypeChar[13 /* NOTEQUALS */], _CurrentToken.value);
                        break;
                    default:
                        putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[tokenType], _CurrentToken.value);
                }
            }
            else {
                debugger;
                switch (tokenType) {
                    case 23 /* TYPE */:
                        putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[8 /* INT */] + ", " + TokenTypeChar[9 /* STR */] + ", or " + TokenTypeChar[10 /* BOOL */], _CurrentToken.value);
                        break;
                    case 24 /* BOOLOP */:
                        putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[12 /* EQUALS */] + ", or " + TokenTypeChar[13 /* NOTEQUALS */], _CurrentToken.value);
                        break;
                    default:
                        putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[tokenType], _CurrentToken.value);
                }
                putFailed(this.part);
                throw new Error('Failed');
            }
            _CurrentToken = this.getNextToken();
        };
        return Parser;
    })();
    TSC.Parser = Parser;
})(TSC || (TSC = {}));
