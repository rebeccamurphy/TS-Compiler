/* lexer.ts  */
var TSC;
(function (TSC) {
    var Token = (function () {
        function Token(kind, value, line) {
            this.kind = kind;
            this.value = value;
            this.line = line;
            this.kind = kind;
            this.value = value;
            this.line = line;
        }
        Token.addToken = function () {
            _Tokens.push(this);
        };
        return Token;
    })();
    TSC.Token = Token;
})(TSC || (TSC = {}));
