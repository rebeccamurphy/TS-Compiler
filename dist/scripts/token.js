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
        Token.prototype.equals = function (token) {
            return token.type === this.type && token.value === this.value && token.line == this.line;
        };
        Token.prototype.toString = function () {
            return "Type: " + TokenTypeString[this.type] + ", Value: " + this.value + ", Line: " + this.line;
        };
        Token.createToken = function (type, str, lineNum) {
            var temp = new Token(type, str, lineNum);
            return temp;
        };
        Token.addToken = function (token) {
            if (_Verbose)
                _Messenger.putMessage("Created Token: " + token.toString());
            _Tokens.push(token);
        };
        Token.createAndAddToken = function (type, str, lineNum) {
            var temp = TSC.Token.createToken(type, str, lineNum);
            if (_Verbose)
                _Messenger.putMessage("Created Token: " + temp.toString());
            _Tokens.push(temp);
        };
        Token.getAndAddToken = function (str, lineNum) {
            var temp = TSC.Token.getToken(str, lineNum);
            if (typeof temp === "string")
                _Messenger.putError(lineNum, "Lexer", "[" + temp + "] Invalid token.");
            else {
                if (_Verbose)
                    _Messenger.putMessage("Created Token: " + temp.toString());
                _Tokens.push(temp);
            }
        };
        Token.getWordMatchToken = function (str, lineNum) {
            var tokenList = [];
            switch (str) {
                case 'false':
                    return [TSC.Token.createToken(TokenType.BOOL, str, lineNum)];
                case 'true':
                    return [TSC.Token.createToken(TokenType.BOOL, str, lineNum)];
                case 'print':
                    return [TSC.Token.createToken(TokenType.PRINT, str, lineNum)];
                case 'while':
                    return [TSC.Token.createToken(TokenType.WHILE, str, lineNum)];
                case 'if':
                    return [TSC.Token.createToken(TokenType.IF, str, lineNum)];
                case 'int':
                    return [TSC.Token.createToken(TokenType.INT, str, lineNum)];
                case 'string':
                    return [TSC.Token.createToken(TokenType.STR, str, lineNum)];
                case 'boolean':
                    return [TSC.Token.createToken(TokenType.BOOL, str, lineNum)];
            }
            if (str.indexOf('false') > -1) {
                tokenList.push(TSC.Token.createToken(TokenType.BOOL, 'false', lineNum));
            }
            else if (str.indexOf('true') > -1) {
                tokenList.push(TSC.Token.createToken(TokenType.BOOL, 'true', lineNum));
            }
            else if (str.indexOf('print') > -1) {
                tokenList.push(TSC.Token.createToken(TokenType.PRINT, 'print', lineNum));
            }
            else if (str.indexOf('while') > -1) {
                tokenList.push(TSC.Token.createToken(TokenType.WHILE, 'while', lineNum));
            }
            else if (str.indexOf('if') > -1) {
                tokenList.push(TSC.Token.createToken(TokenType.IF, 'if', lineNum));
            }
            else if (str.indexOf('int') > -1) {
                tokenList.push(TSC.Token.createToken(TokenType.INT, 'int', lineNum));
            }
            else if (str.indexOf('string') > -1) {
                tokenList.push(TSC.Token.createToken(TokenType.STR, 'string', lineNum));
            }
            else if (str.indexOf('boolean') > -1) {
                tokenList.push(TSC.Token.createToken(TokenType.FALSE, 'boolean', lineNum));
            }
            else {
                return [];
            }
            //remove token from string
            str = str.replace(tokenList[0].value, '');
            //check if there is an id left over
            //unshift puts token in correct order
            if (str.length === 1 && str.match(/[a-z]/))
                tokenList.unshift(TSC.Token.createToken(TokenType.ID, str, lineNum));
            return tokenList;
        };
        Token.testForToken = function (str) {
            if ('false'.indexOf(str) > -1 || 'true'.indexOf(str) > -1
                || 'print'.indexOf(str) > -1 || 'while'.indexOf(str) > -1
                || 'if'.indexOf(str) > -1 || 'int'.indexOf(str) > -1
                || 'string'.indexOf(str) > -1 || 'boolean'.indexOf(str) > -1)
                return true;
            else
                return false;
        };
        Token.getToken = function (str, lineNum) {
            //returns created token or null 
            if (str.match(/\n/)) {
                //newline sent in
                return TSC.Token.createToken(TokenType.NEWLINE, str, lineNum);
            }
            str = str.trim(); //to handle excess spaces and newlines
            if (str.length === 0)
                return null;
            //if a single character (a-Z) has been sent in
            if (str.length === 1 && str.match(/[a-z]/))
                return TSC.Token.createToken(TokenType.ID, str, lineNum);
            //we've found an identifier	        
            //if a single digit has been sent in
            if (str.length === 1 && str.match(/[0-9]/))
                return TSC.Token.createToken(TokenType.DIGIT, str, lineNum);
            //covert case to lower case
            str = str.toLowerCase();
            switch (str) {
                case '{':
                    return TSC.Token.createToken(TokenType.LCURLY, str, lineNum);
                case '}':
                    return TSC.Token.createToken(TokenType.RCURLY, str, lineNum);
                case '(':
                    return TSC.Token.createToken(TokenType.LPAREN, str, lineNum);
                case ')':
                    return TSC.Token.createToken(TokenType.RPAREN, str, lineNum);
                case '=':
                    return TSC.Token.createToken(TokenType.EQUALSIGN, str, lineNum);
                case '==':
                    return TSC.Token.createToken(TokenType.BOOLOP, str, lineNum);
                case '!=':
                    return TSC.Token.createToken(TokenType.BOOLOP, str, lineNum);
                case '$':
                    return TSC.Token.createToken(TokenType.EOF, str, lineNum);
                case '+':
                    return TSC.Token.createToken(TokenType.ADD, str, lineNum);
                case '"':
                    return TSC.Token.createToken(TokenType.QUOTE, str, lineNum);
                case 'false':
                    return TSC.Token.createToken(TokenType.FALSE, str, lineNum);
                case 'true':
                    return TSC.Token.createToken(TokenType.TRUE, str, lineNum);
                case 'print':
                    return TSC.Token.createToken(TokenType.PRINT, str, lineNum);
                case 'while':
                    return TSC.Token.createToken(TokenType.WHILE, str, lineNum);
                case 'if':
                    return TSC.Token.createToken(TokenType.IF, str, lineNum);
                case 'int':
                    return TSC.Token.createToken(TokenType.INT, str, lineNum);
                case 'string':
                    return TSC.Token.createToken(TokenType.STR, str, lineNum);
                case 'boolean':
                    return TSC.Token.createToken(TokenType.BOOL, str, lineNum);
            }
            return str; //This token doesn't match anything
        };
        return Token;
    })();
    TSC.Token = Token;
})(TSC || (TSC = {}));
