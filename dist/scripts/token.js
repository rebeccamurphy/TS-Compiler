/* lexer.ts  */
var TSC;
(function (TSC) {
    var Token = (function () {
        function Token(type, value, line) {
            this.type = type;
            this.value = value;
            this.line = line;
            this.type = type;
            this.value = value;
            this.line = line;
        }
        Token.prototype.toString = function () {
            return TokenTypeString[this.type];
        };
        Token.createToken = function (type, str, lineNum) {
            var temp = new Token(type, str, lineNum);
            return temp;
        };
        Token.addToken = function (token) {
            _Tokens.push(token);
        };
        Token.createAndAddToken = function (type, str, lineNum) {
            var temp = TSC.Token.createToken(type, str, lineNum);
            _Tokens.push(temp);
        };
        Token.getAndAddToken = function (str, lineNum) {
            var temp = TSC.Token.getToken(str, lineNum);
            _Tokens.push(temp);
        };
        Token.getWordMatchToken = function (str, lineNum) {
            switch (str) {
                case 'false':
                    return TSC.Token.createToken(15 /* FALSE */, str, lineNum);
                case 'true':
                    return TSC.Token.createToken(16 /* TRUE */, str, lineNum);
                case 'print':
                    return TSC.Token.createToken(2 /* PRINT */, str, lineNum);
                case 'while':
                    return TSC.Token.createToken(6 /* WHILE */, str, lineNum);
                case 'if':
                    return TSC.Token.createToken(7 /* IF */, str, lineNum);
                case 'int':
                    return TSC.Token.createToken(8 /* INT */, str, lineNum);
                case 'string':
                    return TSC.Token.createToken(9 /* STR */, str, lineNum);
                case 'boolean':
                    return TSC.Token.createToken(10 /* BOOL */, str, lineNum);
                default:
                    return null;
            }
        };
        Token.getToken = function (str, lineNum) {
            //returns created token or null 
            if (str.match(/\n/)) {
                //newline sent in
                return TSC.Token.createToken(20 /* NEWLINE */, str, lineNum);
            }
            str = str.trim(); //to handle excess spaces and newlines
            if (str.length === 0)
                return null;
            switch (str) {
                case '{':
                    return TSC.Token.createToken(0 /* LCURLY */, str, lineNum);
                case '}':
                    return TSC.Token.createToken(1 /* RCURLY */, str, lineNum);
                case '(':
                    return TSC.Token.createToken(3 /* LPAREN */, str, lineNum);
                case ')':
                    return TSC.Token.createToken(4 /* RPAREN */, str, lineNum);
                case '=':
                    return TSC.Token.createToken(5 /* EQUALSIGN */, str, lineNum);
                case '==':
                    return TSC.Token.createToken(12 /* EQUALS */, str, lineNum);
                case '!=':
                    return TSC.Token.createToken(13 /* NOTEQUALS */, str, lineNum);
                case '$':
                    return TSC.Token.createToken(18 /* EOF */, str, lineNum);
                case '+':
                    return TSC.Token.createToken(17 /* ADD */, str, lineNum);
                case '"':
                    return TSC.Token.createToken(19 /* QUOTE */, str, lineNum);
                case 'false':
                    return TSC.Token.createToken(15 /* FALSE */, str, lineNum);
                case 'true':
                    return TSC.Token.createToken(16 /* TRUE */, str, lineNum);
                case 'print':
                    return TSC.Token.createToken(2 /* PRINT */, str, lineNum);
                case 'while':
                    return TSC.Token.createToken(6 /* WHILE */, str, lineNum);
                case 'if':
                    return TSC.Token.createToken(7 /* IF */, str, lineNum);
                case 'int':
                    return TSC.Token.createToken(8 /* INT */, str, lineNum);
                case 'string':
                    return TSC.Token.createToken(9 /* STR */, str, lineNum);
                case 'boolean':
                    return TSC.Token.createToken(10 /* BOOL */, str, lineNum);
            }
            //if a single character (a-Z) has been sent in
            if (str.length === 1 && str.match(/[a-z]/))
                return TSC.Token.createToken(21 /* ID */, str, lineNum);
            //we've found an identifier	        
            //if a single digit has been sent in
            if (str.length === 1 && str.match(/[0-9]/))
                return TSC.Token.createToken(22 /* DIGIT */, str, lineNum);
            return null; //This token doesn't match anything
        };
        return Token;
    })();
    TSC.Token = Token;
})(TSC || (TSC = {}));
