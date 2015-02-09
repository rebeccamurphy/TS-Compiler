/*
var onDocumentLoad = function() {
    TSOS.Control.hostInit();
};
*/
//Global Constants
var EOF = "$";
// Global variables
var _Tokens = "";
var _TokenIndex = 0;
var _CurrentToken = "";
var _ErrorCount = 0;
var _Lexer;
var _Parser;
var putMessage = function (msg) {
    document.getElementById("taOutput").value += msg + "\n";
};
var onDocumentLoad = function () {
    _Lexer = TSC.Lexer;
    _Parser = TSC.Parser;
    _Tokens = "";
    _TokenIndex = 0;
    _CurrentToken = ' ';
    _ErrorCount = 0;
};
