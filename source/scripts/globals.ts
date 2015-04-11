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

var _Messenger;
var _Lexer;
var _Parser;
var _Token;
var _SemanticAnalysis;

var _ASTRoot=null;
var _SymbolTableRoot;
var _Verbose;
enum TokenType {LCURLY, RCURLY, PRINT, LPAREN, RPAREN, EQUALSIGN, WHILE, IF, INT, STR, BOOL, CHAR,
	EQUALS, NOTEQUALS,SPACE, FALSE, TRUE, ADD,EOF, QUOTE, NEWLINE, ID,DIGIT, TYPE, BOOLOP, NONE, PROGRAM};
var TokenTypeString =['LCURLY', 'RCURLY', 'PRINT', 'LPAREN', 'RPAREN', 'EQUALSIGN', 'WHILE', 'IF', 'INT', 
'STR', 'BOOL', 'CHAR','EQUALS', 'NOTEQUALS','SPACE', 'FALSE', 'TRUE', 'ADD','EOF', 
'QUOTE', 'NEWLINE', 'ID','DIGIT', 'TYPE', 'BOOLOP', 'NONE', 'PROGRAM'];
var TokenTypeChar =['{', '}', '', '(', ')', '=', '', '', '', 
'', '', '','==', '!=',' ', '', '', '+','$', 
'"', '\n', '','','', '', ''];

enum ErrorType {Undeclared, Redeclared, TypeMismatchAssign, TypeMismatchComp};

var ErrorStr = ["Undeclared identifier", "Redeclared identifier", "Type Mismatched during Assignment", "Type Mismatched during Comparison"];

enum WarningType {Unused, Uninit };

var WarningStr = ["Unused Variable", "Uninitialized identifier"];

var ASTString = ['BLOCK', 'PRINTSTATMENT', 'ASSIGNMENTSTATEMENT', 'VARDECL', 'WHILESTATMENT', 'IFSTATEMENT'];


var onDocumentLoad = function() {
	_LexerError = false;
	_Lexer = TSC.Lexer;
	_Parser = new TSC.Parser();
	_Messenger = new TSC.Messenger("taOutput");
	_Token = TSC.Token;
	_Tokens = [];
	_TokenStr =[];
    _TokenIndex = 0;
    _CurrentToken = ' ';
    _ErrorCount = 0;
    _Verbose = false;
};
