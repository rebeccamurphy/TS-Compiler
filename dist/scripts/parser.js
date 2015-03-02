/* parser.ts  */
var TSC;
(function (TSC) {
    var Parser = (function () {
        function Parser() {
            this.part = 'Parser';
        }
        /*
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
        */
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
            // Grab the next token.
            _CurrentToken = this.getNextToken();
            // A valid parse derives the G(oal) production, so begin there.
            //this.parseProgram();
            // Report the results.
            var msg = "";
            if (_ErrorCount === 0)
                msg = "no errors.";
            else if (_ErrorCount == 1)
                msg = _ErrorCount + " error.";
            else
                msg = _ErrorCount + " errors.";
            putMessage("Parsing found" + msg);
        };
        //Program ::== Block 
        Parser.prototype.parseProgram = function () {
            this.parseBlock();
            this.match(EOF);
            putSuccess(this.part);
        };
        //Block ::== {StatementList}
        Parser.prototype.parseBlock = function () {
            this.match(0 /* LCURLY */); //expect block to start with {
            this.parseStatementList();
            this.match(1 /* RCURLY */); //expect block to end with }
        };
        //StatementList ::== Statement StatementList
        //				::== epsilon
        Parser.prototype.parseStatementList = function () {
            if (_CurrentToken.type === 2 /* PRINT */ || _CurrentToken.type === 21 /* ID */ || _CurrentToken.type === 6 /* WHILE */ || _CurrentToken.type === 7 /* IF */ || _CurrentToken.type === 0 /* LCURLY */) {
                this.parseStatement;
                this.parseStatementList();
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
        Parser.prototype.parseStatement = function () {
            switch (_CurrentToken.type) {
                case 2 /* PRINT */:
                    this.parsePrintStatement();
                    break;
                case 21 /* ID */:
                    this.parseAssignmentStatement();
                    break;
                case 9 /* STR */:
                case 8 /* INT */:
                case 10 /* BOOL */:
                    this.parseVarDecl();
                    break;
                case 6 /* WHILE */:
                    this.parseWhileStatement();
                    break;
                case 7 /* IF */:
                    this.parseIfStatement();
                    break;
                default:
                    this.parseBlock();
            }
        };
        // PrintStatement ::== print ( Expr )
        Parser.prototype.parsePrintStatement = function () {
        };
        //AssignmentStatement ::== Id = Expr
        Parser.prototype.parseAssignmentStatement = function () {
        };
        //VarDecl  ::== type Id
        Parser.prototype.parseVarDecl = function () {
        };
        //WhileStatement ::== while BooleanExpr Block
        Parser.prototype.parseWhileStatement = function () {
        };
        //IfStatement ::== if BooleanExpr Block
        Parser.prototype.parseIfStatement = function () {
        };
        //Expr 	::== IntExpr
        //		::== StringExpr
        //		::== BooleanExpr
        //		::==Id
        Parser.prototype.parseExpr = function () {
        };
        Parser.prototype.parseE = function () {
            // All E productions begin with a digit, so make sure that we have one.
            this.checkToken("digit");
            // Look ahead 1 char (which is now in _CurrentToken because checkToken 
            // consumes another one) and see which E production to follow.
            if (_CurrentToken != EOF) {
                // We're not done, we we expect to have an op.
                this.checkToken("op");
                this.parseE();
            }
            else {
                // There is nothing else in the token stream, 
                // and that's cool since E --> digit is valid.
                putMessage("EOF reached");
            }
        };
        //BooleanExpr	::== (Expr boolOp Expr)
        //				::== boolVal
        Parser.prototype.parseBooleanExpr = function () {
        };
        //IntExpr	::== digit intop Expr
        //			::== digit
        Parser.prototype.parseIntExpr = function () {
        };
        //StringExpr ::== " CharList "    	
        Parser.prototype.parseStringExpr = function () {
        };
        //Id ::== char
        Parser.prototype.parseID = function () {
        };
        //CharList	::== char CharList
        //			::== space CharList
        //			::== epsilon
        Parser.prototype.parseCharList = function () {
        };
        Parser.prototype.checkToken = function (expectedKind) {
            switch (expectedKind) {
                case "digit": {
                    putMessage("Expecting a digit");
                    if (_CurrentToken == "0" || _CurrentToken == "1" || _CurrentToken == "2" || _CurrentToken == "3" || _CurrentToken == "4" || _CurrentToken == "5" || _CurrentToken == "6" || _CurrentToken == "7" || _CurrentToken == "8" || _CurrentToken == "9") {
                        putMessage("Got a digit!");
                    }
                    else {
                        _ErrorCount++;
                        putMessage("NOT a digit.  Error at position " + _TokenIndex + ".");
                    }
                    break;
                }
                case "op": {
                    putMessage("Expecting an operator");
                    if (_CurrentToken == "+" || _CurrentToken == "-") {
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
        };
        Parser.prototype.match = function (tokenType) {
            if (_CurrentToken.type == tokenType) {
                putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[tokenType], _CurrentToken.value);
            }
            else {
                putExpectingWrong(_CurrentToken.line, this.part, TokenTypeChar[tokenType], _CurrentToken.value);
                putFailed(this.part);
                return;
            }
            _CurrentToken = this.getNextToken();
        };
        return Parser;
    })();
    TSC.Parser = Parser;
})(TSC || (TSC = {}));
