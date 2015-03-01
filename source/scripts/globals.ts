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

enum TokenType {LCURLY, RCURLY, PRINT, LPAREN, RPAREN, EQUALSIGN, WHILE, IF, ELSE, INT, STR, BOOL, CHAR,
	EQUALS, NOTEQUALS,SPACE, FALSE, TRUE, ADD};

var putMessage= function(msg){
    (<HTMLInputElement> document.getElementById("taOutput")).value += msg + "\n";
}



var onDocumentLoad = function() {
	_Lexer = TSC.Lexer;
	_Parser = TSC.Parser;
	_Token = TSC.Token;

	_Tokens = [];
    _TokenIndex = 0;
    _CurrentToken = ' ';
    _ErrorCount = 0;
};