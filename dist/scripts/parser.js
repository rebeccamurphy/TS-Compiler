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
            this.rootNode.printTree(0);
        };
        //Program ::== Block 
        Parser.prototype.parseProgram = function (node) {
            this.rootNode = new TSC.TreeNode("PROGRAM", null);
            node = this.rootNode;
            this.parseBlock(node);
            this.checkToken(18 /* EOF */);
            node.addChildWithValue(TokenTypeString[18 /* EOF */], TokenTypeChar[18 /* EOF */]);
            putSuccess(this.part);
        };
        //Block ::== {StatementList}
        Parser.prototype.parseBlock = function (node) {
            node.addChild('BLOCK');
            //set current node to be the new block node
            node = node.getNewestChild();
            this.checkToken(0 /* LCURLY */); //expect block to start with {
            node.addChildWithValue(TokenTypeString[0 /* LCURLY */], TokenTypeChar[0 /* LCURLY */]);
            this.parseStatementList(node);
            this.checkToken(1 /* RCURLY */); //expect block to end with }
            node.addChildWithValue(TokenTypeString[1 /* RCURLY */], TokenTypeChar[1 /* RCURLY */]);
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
            node.addChild("PRINT");
            this.checkToken(3 /* LPAREN */);
            node.addChildWithValue(TokenTypeString[3 /* LPAREN */], TokenTypeChar[3 /* LPAREN */]);
            this.parseExpr(node);
            this.checkToken(4 /* RPAREN */);
            node.addChildWithValue(TokenTypeString[4 /* RPAREN */], TokenTypeChar[4 /* RPAREN */]);
        };
        //AssignmentStatement ::== Id = Expr
        Parser.prototype.parseAssignmentStatement = function (node) {
            node.addChild("ASSIGNMENTSTATEMENT");
            node = node.getNewestChild();
            this.parseID(node);
            this.checkToken(5 /* EQUALSIGN */);
            node.addChildWithValue(TokenTypeString[5 /* EQUALSIGN */], TokenTypeChar[5 /* EQUALSIGN */]);
            this.parseExpr(node);
        };
        //VarDecl  ::== type Id
        Parser.prototype.parseVarDecl = function (node) {
            node.addChild("VARDECL");
            node = node.getNewestChild();
            switch (_CurrentToken.type) {
                case 9 /* STR */:
                    this.checkToken(9 /* STR */);
                    node.addChild(TokenTypeString[9 /* STR */]);
                    this.parseID(node);
                    break;
                case 8 /* INT */:
                    this.checkToken(8 /* INT */);
                    node.addChild(TokenTypeString[8 /* INT */]);
                    this.parseID(node);
                    break;
                case 10 /* BOOL */:
                    this.checkToken(10 /* BOOL */);
                    node.addChild(TokenTypeString[10 /* BOOL */]);
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
            node.addChild(TokenTypeString[6 /* WHILE */]);
            this.parseBooleanExpr(node);
            this.parseBlock(node);
        };
        //IfStatement ::== if BooleanExpr Block
        Parser.prototype.parseIfStatement = function (node) {
            node.addChild("IFSTATEMENT");
            node = node.getNewestChild();
            this.checkToken(7 /* IF */);
            node.addChild(TokenTypeString[7 /* IF */]);
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
                case 16 /* TRUE */:
                case 15 /* FALSE */:
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
            if (_CurrentToken.type === 16 /* TRUE */) {
                //TODO change tokens to bool type with value of true false
                this.checkToken(16 /* TRUE */);
                node.addChild(TokenTypeString[16 /* TRUE */]);
            }
            else if (_CurrentToken.type === 15 /* FALSE */) {
                this.checkToken(15 /* FALSE */);
                node.addChild(TokenTypeString[15 /* FALSE */]);
            }
            else {
                this.checkToken(3 /* LPAREN */);
                node.addChild(TokenTypeString[3 /* LPAREN */]);
                this.parseExpr(node);
                if (_CurrentToken.type === 12 /* EQUALS */) {
                    this.checkToken(12 /* EQUALS */);
                    node.addChildWithValue(TokenTypeString[12 /* EQUALS */], TokenTypeChar[12 /* EQUALS */]);
                    this.parseExpr(node);
                    this.checkToken(4 /* RPAREN */);
                    node.addChildWithValue(TokenTypeString[4 /* RPAREN */], TokenTypeChar[4 /* RPAREN */]);
                }
                else if (_CurrentToken.type === 13 /* NOTEQUALS */) {
                    this.checkToken(13 /* NOTEQUALS */);
                    node.addChildWithValue(TokenTypeString[13 /* NOTEQUALS */], TokenTypeChar[13 /* NOTEQUALS */]);
                    this.parseExpr(node);
                    this.checkToken(4 /* RPAREN */);
                    node.addChildWithValue(TokenTypeString[4 /* RPAREN */], TokenTypeChar[4 /* RPAREN */]);
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
                node.addChildWithValue(TokenTypeString[22 /* DIGIT */], _CurrentToken.value);
                this.checkToken(22 /* DIGIT */);
                if (_CurrentToken.type === 17 /* ADD */) {
                    this.checkToken(17 /* ADD */);
                    node.addChildWithValue(TokenTypeString[17 /* ADD */], TokenTypeChar[17 /* ADD */]);
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
            node.addChild(TokenTypeString[19 /* QUOTE */]);
            this.parseCharList(node);
            this.checkToken(19 /* QUOTE */);
            node.addChild(TokenTypeString[19 /* QUOTE */]);
        };
        //Id ::== char
        Parser.prototype.parseID = function (node) {
            node.addChildWithValue("ID", _CurrentToken.value);
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
                    this.checkToken(11 /* CHAR */);
                    node.addChild(TokenTypeString[11 /* CHAR */]);
                    break;
                case 14 /* SPACE */:
                    this.checkToken(14 /* SPACE */);
                    node.addChild(TokenTypeString[14 /* SPACE */]);
                    break;
                default:
            }
            if (_CurrentToken.type === 11 /* CHAR */ || _CurrentToken === 14 /* SPACE */)
                this.parseCharList(node);
        };
        Parser.prototype.checkToken = function (tokenType) {
            if (_CurrentToken.type == tokenType) {
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
