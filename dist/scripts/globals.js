/*
var onDocumentLoad = function() {
    TSOS.Control.hostInit();
};
*/
//Global Constants
var EOF = "$";
// Global variables
var _Tokens = [];
var _TokenIndex = 0;
var _CurrentToken = "";
var _ErrorCount = 0;
var _Lexer;
var _Parser;
var _Token;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["LCURLY"] = 0] = "LCURLY";
    TokenType[TokenType["RCURLY"] = 1] = "RCURLY";
    TokenType[TokenType["PRINT"] = 2] = "PRINT";
    TokenType[TokenType["LPAREN"] = 3] = "LPAREN";
    TokenType[TokenType["RPAREN"] = 4] = "RPAREN";
    TokenType[TokenType["EQUALSIGN"] = 5] = "EQUALSIGN";
    TokenType[TokenType["WHILE"] = 6] = "WHILE";
    TokenType[TokenType["IF"] = 7] = "IF";
    TokenType[TokenType["ELSE"] = 8] = "ELSE";
    TokenType[TokenType["INT"] = 9] = "INT";
    TokenType[TokenType["STR"] = 10] = "STR";
    TokenType[TokenType["BOOL"] = 11] = "BOOL";
    TokenType[TokenType["CHAR"] = 12] = "CHAR";
    TokenType[TokenType["EQUALS"] = 13] = "EQUALS";
    TokenType[TokenType["NOTEQUALS"] = 14] = "NOTEQUALS";
    TokenType[TokenType["SPACE"] = 15] = "SPACE";
    TokenType[TokenType["FALSE"] = 16] = "FALSE";
    TokenType[TokenType["TRUE"] = 17] = "TRUE";
    TokenType[TokenType["ADD"] = 18] = "ADD";
})(TokenType || (TokenType = {}));
;
var putMessage = function (msg) {
    document.getElementById("taOutput").value += msg + "\n";
};
var onDocumentLoad = function () {
    _Lexer = TSC.Lexer;
    _Parser = TSC.Parser;
    _Token = TSC.Token;
    _Tokens = [];
    _TokenIndex = 0;
    _CurrentToken = ' ';
    _ErrorCount = 0;
};
