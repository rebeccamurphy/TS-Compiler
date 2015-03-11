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
            if (typeof temp === "string")
                putError(lineNum, "Lexer", "[" + temp + "] Invalid token.");
            else
                _Tokens.push(temp);
        };
        Token.getWordMatchToken = function (str, lineNum) {
            var tokenList = [];
            switch (str) {
                case 'false':
                    return [TSC.Token.createToken(15 /* FALSE */, str, lineNum)];
                case 'true':
                    return [TSC.Token.createToken(16 /* TRUE */, str, lineNum)];
                case 'print':
                    return [TSC.Token.createToken(2 /* PRINT */, str, lineNum)];
                case 'while':
                    return [TSC.Token.createToken(6 /* WHILE */, str, lineNum)];
                case 'if':
                    return [TSC.Token.createToken(7 /* IF */, str, lineNum)];
                case 'int':
                    return [TSC.Token.createToken(8 /* INT */, str, lineNum)];
                case 'string':
                    return [TSC.Token.createToken(9 /* STR */, str, lineNum)];
                case 'boolean':
                    return [TSC.Token.createToken(10 /* BOOL */, str, lineNum)];
            }
            if (str.indexOf('false') > -1) {
                tokenList.push(TSC.Token.createToken(15 /* FALSE */, 'false', lineNum));
            }
            else if (str.indexOf('true') > -1) {
                tokenList.push(TSC.Token.createToken(16 /* TRUE */, 'true', lineNum));
            }
            else if (str.indexOf('print') > -1) {
                tokenList.push(TSC.Token.createToken(2 /* PRINT */, 'print', lineNum));
            }
            else if (str.indexOf('while') > -1) {
                tokenList.push(TSC.Token.createToken(6 /* WHILE */, 'while', lineNum));
            }
            else if (str.indexOf('if') > -1) {
                tokenList.push(TSC.Token.createToken(7 /* IF */, 'if', lineNum));
            }
            else if (str.indexOf('int') > -1) {
                tokenList.push(TSC.Token.createToken(8 /* INT */, 'int', lineNum));
            }
            else if (str.indexOf('string') > -1) {
                tokenList.push(TSC.Token.createToken(9 /* STR */, 'string', lineNum));
            }
            else if (str.indexOf('boolean') > -1) {
                tokenList.push(TSC.Token.createToken(15 /* FALSE */, 'boolean', lineNum));
            }
            else {
                return [];
            }
            //remove token from string
            str = str.replace(tokenList[0].value, '');
            //check if there is an id left over
            //unshift puts token in correct order
            if (str.length === 1 && str.match(/[a-z]/))
                tokenList.unshift(TSC.Token.createToken(21 /* ID */, str, lineNum));
            return tokenList;
        };
        Token.testForToken = function (str) {
            if ('false'.indexOf(str) > -1 || 'true'.indexOf(str) > -1 || 'print'.indexOf(str) > -1 || 'while'.indexOf(str) > -1 || 'if'.indexOf(str) > -1 || 'int'.indexOf(str) > -1 || 'string'.indexOf(str) > -1 || 'boolean'.indexOf(str) > -1)
                return true;
            else
                return false;
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
            //if a single character (a-Z) has been sent in
            if (str.length === 1 && str.match(/[a-z]/))
                return TSC.Token.createToken(21 /* ID */, str, lineNum);
            //we've found an identifier	        
            //if a single digit has been sent in
            if (str.length === 1 && str.match(/[0-9]/))
                return TSC.Token.createToken(22 /* DIGIT */, str, lineNum);
            //covert case to lower case
            str = str.toLowerCase();
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
            return str; //This token doesn't match anything
        };
        return Token;
    })();
    TSC.Token = Token;
})(TSC || (TSC = {}));