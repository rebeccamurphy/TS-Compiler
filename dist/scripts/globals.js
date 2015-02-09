/*
var onDocumentLoad = function() {
    TSOS.Control.hostInit();
};
*/
var _Lexer = TSC.Lexer;
//Global Constants
var EOF = "$";
// Global variables
var _Tokens = "";
var _TokenIndex = 0;
var _CurrentToken = "";
var _ErrorCount = 0;
function putMessage(msg) {
    document.getElementById("taOutput").value += msg + "\n";
}
