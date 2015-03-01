/* lexer.ts  */
var TSC;
(function (TSC) {
    var Lexer = (function () {
        function Lexer() {
        }
        Lexer.lex = function () {
            {
                // Grab the "raw" source code.
                var sourceCode = document.getElementById("taSourceCode").value;
                // Trim the leading and trailing spaces.
                sourceCode = TSC.Utils.trim(sourceCode);
                debugger;
                //call tokenize TODO
                //this.tokenize(sourceCode);
                return sourceCode;
            }
        };
        Lexer.tokenize = function (sourceCode) {
            var currentLine = 1;
            var inString = false;
            var tokenized = false;
            var buffer = function () {
                var str = '';
                return {
                    "push": function (ch) {
                        str += ch;
                    },
                    "clear": function () {
                        str = "";
                    },
                    "get": function () {
                        return str;
                    },
                    "flush": function () {
                        var txt = str;
                        str = "";
                        return txt;
                    }
                };
            }();
            for (var i = 0; i < sourceCode.length; i++) {
                //check if EOF char was forgotten
                if (i === sourceCode.length - 1 && sourceCode[i] !== "$") {
                    putWarning(currentLine, this.part, "Forgot EOF character ($). Inserting.");
                    sourceCode += "$";
                }
                //check if space
                if (sourceCode[i].match(/\s/)) {
                    if (inString) {
                        //if we are in a string, we want to preserve the whitespace and not make the wrong token
                        var temp = new TSC.Token(14 /* SPACE */, sourceCode[i], currentLine);
                        //adds token to global _Tokens
                        _Token.addToken(temp);
                        tokenized = true;
                    }
                    else {
                        var token = _Token.getToken(buffer.flush(), currentLine);
                        if (token === null)
                            putError(currentLine, this.part, "Invalid token.");
                        else
                            _Token.addToken(token);
                    }
                }
                else if (sourceCode[i].match(/\n/)) {
                    if (inString) {
                        //newlines are not allowed in strings in this lang so throw and error
                        putError(currentLine, this.part, "Invalid character in string.");
                    }
                    else {
                        var token = _Token.getToken(buffer.flush(), currentLine);
                        if (token === null)
                            putError(currentLine, this.part, "Invalid token.");
                        else
                            _Token.addToken(token);
                        //only increment line if new line isnt in string
                        currentLine++;
                    }
                }
                //if hit a token ending character
                if (sourceCode[i].match(/\{|\}|\(|\)|\$|\+/)) {
                    if (inString)
                        //characters are not valid in string so error
                        putError(currentLine, this.part, "Invalid character in string.");
                    else {
                        //if we are not in a string, check to see if we've hit a token
                        var token = _Token.getToken(buffer.flush(), currentLine);
                        if (token === null)
                            putError(currentLine, this.part, "Invalid token.");
                        else
                            _Token.addToken(token);
                        _Token.addToken(_Token.getToken(sourceCode[i], currentLine)); //add current char to token list
                        tokenized = true; //note that the current token has been tokenized
                    }
                }
                //check if code had eof char before end 
                if (sourceCode[i].match(/\$/) && i < sourceCode.length - 1) {
                    putWarning(currentLine, this.part, "Code found after EOF character ($). Ignoring rest of code.");
                    return;
                }
            }
        };
        Lexer.part = "Lexer";
        return Lexer;
    })();
    TSC.Lexer = Lexer;
})(TSC || (TSC = {}));
