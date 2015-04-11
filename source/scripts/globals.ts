declare var TreeModel:any;

//Global Constants
var EOF = "$";

// Global variables
var _Tokens = [];
var _TokenIndex = 0;
var _CurrentToken;
var _ErrorCount = 0;
var _TokenStr=[];
var _LexerError;

var _Lexer;
var _Parser;
var _Token;
var _SemanticAnalysis;

var _ASTRoot=null;
var _SymbolTableRoot;
var _Verbose = false;
enum TokenType {LCURLY, RCURLY, PRINT, LPAREN, RPAREN, EQUALSIGN, WHILE, IF, INT, STR, BOOL, CHAR,
	EQUALS, NOTEQUALS,SPACE, FALSE, TRUE, ADD,EOF, QUOTE, NEWLINE, ID,DIGIT, TYPE, BOOLOP, NONE, PROGRAM};
var TokenTypeString =['LCURLY', 'RCURLY', 'PRINT', 'LPAREN', 'RPAREN', 'EQUALSIGN', 'WHILE', 'IF', 'INT', 
'STR', 'BOOL', 'CHAR','EQUALS', 'NOTEQUALS','SPACE', 'FALSE', 'TRUE', 'ADD','EOF', 
'QUOTE', 'NEWLINE', 'ID','DIGIT', 'TYPE', 'BOOLOP', 'NONE', 'PROGRAM'];
var TokenTypeChar =['{', '}', '', '(', ')', '=', '', '', '', 
'', '', '','==', '!=',' ', '', '', '+','$', 
'"', '\n', '','','', '', ''];
var ASTString = ['BLOCK', 'PRINTSTATMENT', 'ASSIGNMENTSTATEMENT', 'VARDECL', 'WHILESTATMENT', 'IFSTATEMENT'];
var putMessage= function(msg){
    (<HTMLInputElement> document.getElementById("taOutput")).value += msg + "\n";
}
var putError = function (line, part, msg){
	putMessage("(Line: "+line +") " +part + " Error " + msg);
	if (part ==="Lexer")
		_LexerError = true;
}
var putWarning = function (line, part, msg){
	putMessage("(Line: "+line+") " +part + " Warning " +msg);
}
var putExpectingCorrect = function(line, part, expected, found){
	putMessage("(Line: "+line+") " +part + " Expected " +expected +", Found " + found);
}

var putExpectingWrong = function(line, part, expected, found){
	putMessage("(Line: "+line+") " +part + " Error: Expected " +expected +", Found " + found);
}
var putFailed = function(part){
	putMessage(part + ": Failed. Compilation has been terminated.");
}
var putSuccess = function(part){
	putMessage(part + ": Completed Successfully.");
}

var onDocumentLoad = function() {
	_LexerError = false;
	_Lexer = TSC.Lexer;
	_Parser = new TSC.Parser();
	_Token = TSC.Token;
	_Tokens = [];
	_TokenStr =[];
    _TokenIndex = 0;
    _CurrentToken = ' ';
    _ErrorCount = 0;
};
