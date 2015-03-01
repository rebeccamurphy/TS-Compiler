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
                //remove all spaces
                sourceCode = sourceCode.replace(/\s+/g, '');
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
                //check if space
                if (sourceCode[i].match(/\s/)) {
                    if (inString) {
                        //if we are in a string, we want to preserve the whitespace and not make the wrong token
                        var temp = new TSC.Token(15 /* SPACE */, sourceCode[i], currentLine);
                        _Token.addToken(temp);
                        tokenized = true;
                    }
                    else {
                    }
                }
            }
        };
        return Lexer;
    })();
    TSC.Lexer = Lexer;
})(TSC || (TSC = {}));
