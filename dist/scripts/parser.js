/* parser.ts  */
var TSC;
(function (TSC) {
    var Parser = (function () {
        function Parser() {
        }
        Parser.parse = function () {
            putMessage("Parsing [" + _Tokens + "]");
            // Grab the next token.
            _CurrentToken = this.getNextToken();
            // A valid parse derives the G(oal) production, so begin there.
            this.parseG();
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
        Parser.parseG = function () {
            // A G(oal) production can only be an E(xpression), so parse the E production.
            this.parseE();
        };
        Parser.parseE = function () {
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
        Parser.checkToken = function (expectedKind) {
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
        Parser.getNextToken = function () {
            var thisToken = EOF; // Let's assume that we're at the EOF.
            if (_TokenIndex < _Tokens.length) {
                // If we're not at EOF, then return the next token in the stream and advance the index.
                thisToken = _Tokens[_TokenIndex];
                putMessage("Current token:" + thisToken);
                _TokenIndex++;
            }
            return thisToken;
        };
        Parser.part = 'Parser';
        return Parser;
    })();
    TSC.Parser = Parser;
})(TSC || (TSC = {}));
