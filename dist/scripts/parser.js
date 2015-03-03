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
            this.parseProgram();
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
        Parser.prototype.parseProgram = function () {
            debugger;
            this.parseBlock();
            this.checkToken(18 /* EOF */);
            putSuccess(this.part);
        };
        //Block ::== {StatementList}
        Parser.prototype.parseBlock = function () {
            debugger;
            this.checkToken(0 /* LCURLY */); //expect block to start with {
            this.parseStatementList();
            this.checkToken(1 /* RCURLY */); //expect block to end with }
        };
        //StatementList ::== Statement StatementList
        //				::== epsilon
        Parser.prototype.parseStatementList = function () {
            debugger;
            if (_CurrentToken.type === 2 /* PRINT */ || _CurrentToken.type === 21 /* ID */ || _CurrentToken.type === 6 /* WHILE */ || _CurrentToken.type === 7 /* IF */ || _CurrentToken.type === 0 /* LCURLY */ || _CurrentToken.type === 8 /* INT */ || _CurrentToken.type === 9 /* STR */ || _CurrentToken.type === 10 /* BOOL */) {
                this.parseStatement();
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
            debugger;
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
            debugger;
            this.checkToken(2 /* PRINT */);
            this.checkToken(3 /* LPAREN */);
            this.parseExpr();
            this.checkToken(4 /* RPAREN */);
        };
        //AssignmentStatement ::== Id = Expr
        Parser.prototype.parseAssignmentStatement = function () {
            debugger;
            this.parseID();
            this.checkToken(5 /* EQUALSIGN */);
            this.parseExpr();
        };
        //VarDecl  ::== type Id
        Parser.prototype.parseVarDecl = function () {
            debugger;
            switch (_CurrentToken.type) {
                case 9 /* STR */:
                    this.checkToken(9 /* STR */);
                    this.parseID();
                    break;
                case 8 /* INT */:
                    this.checkToken(8 /* INT */);
                    this.parseID();
                    break;
                case 10 /* BOOL */:
                    this.checkToken(10 /* BOOL */);
                    this.parseID();
                    break;
                default:
                    //when we hit this it means we were expecting a type and failed
                    this.checkToken(23 /* TYPE */);
            }
        };
        //WhileStatement ::== while BooleanExpr Block
        Parser.prototype.parseWhileStatement = function () {
            debugger;
            this.checkToken(6 /* WHILE */);
            this.parseBooleanExpr();
            this.parseBlock();
        };
        //IfStatement ::== if BooleanExpr Block
        Parser.prototype.parseIfStatement = function () {
            debugger;
            this.checkToken(7 /* IF */);
            this.parseBooleanExpr();
            this.parseBlock();
        };
        //Expr 	::== IntExpr
        //		::== StringExpr
        //		::== BooleanExpr
        //		::==Id
        Parser.prototype.parseExpr = function () {
            debugger;
            switch (_CurrentToken.type) {
                case 22 /* DIGIT */:
                    this.parseIntExpr();
                    break;
                case 19 /* QUOTE */:
                    this.parseStringExpr();
                case 3 /* LPAREN */:
                case 16 /* TRUE */:
                case 15 /* FALSE */:
                    this.parseBooleanExpr();
                    break;
                case 21 /* ID */:
                    this.parseID();
            }
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
            debugger;
            if (_CurrentToken.type === 16 /* TRUE */)
                this.checkToken(16 /* TRUE */);
            else if (_CurrentToken.type === 15 /* FALSE */)
                this.checkToken(15 /* FALSE */);
            else {
                this.checkToken(3 /* LPAREN */);
                this.parseExpr();
                if (_CurrentToken.type === 12 /* EQUALS */) {
                    this.checkToken(12 /* EQUALS */);
                    this.parseExpr();
                    this.checkToken(4 /* RPAREN */);
                }
                else if (_CurrentToken.type === 13 /* NOTEQUALS */) {
                    this.checkToken(13 /* NOTEQUALS */);
                    this.parseExpr();
                    this.checkToken(4 /* RPAREN */);
                }
                else {
                    //when this is hit it means a boolean operator was expected but not found
                    this.checkToken(24 /* BOOLOP */);
                }
            }
        };
        //IntExpr	::== digit intop Expr
        //			::== digit
        Parser.prototype.parseIntExpr = function () {
            debugger;
            if (_CurrentToken.type === 22 /* DIGIT */) {
                this.checkToken(22 /* DIGIT */);
                if (_CurrentToken.type === 17 /* ADD */) {
                    this.checkToken(17 /* ADD */);
                    this.parseExpr();
                }
            }
            else {
                this.checkToken(22 /* DIGIT */);
            }
        };
        //StringExpr ::== " CharList "    	
        Parser.prototype.parseStringExpr = function () {
            debugger;
            this.checkToken(19 /* QUOTE */);
            this.parseCharList();
            this.checkToken(19 /* QUOTE */);
        };
        //Id ::== char
        Parser.prototype.parseID = function () {
            debugger;
            this.checkToken(21 /* ID */);
        };
        //CharList	::== char CharList
        //			::== space CharList
        //			::== epsilon
        Parser.prototype.parseCharList = function () {
            debugger;
            switch (_CurrentToken.type) {
                case 11 /* CHAR */:
                    this.checkToken(11 /* CHAR */);
                    break;
                case 14 /* SPACE */:
                    this.checkToken(14 /* SPACE */);
                    break;
                default:
            }
        };
        /*
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
        */
        Parser.prototype.checkToken = function (tokenType) {
            debugger;
            if (_CurrentToken.type == tokenType) {
                putExpectingCorrect(_CurrentToken.line, this.part, TokenTypeChar[tokenType], _CurrentToken.value);
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
