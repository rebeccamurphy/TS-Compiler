//Global Constants
var EOF = "$";
// Global variables
var _Tokens = [];
var _TokenIndex = 0;
var _CurrentToken;
var _ErrorCount = 0;
var _TokenStr = [];
var _LexerError;
var _Messenger;
var _Lexer;
var _Parser;
var _Token;
var _SemanticAnalysis;
var _CodeGenerator;
var _ScopeForParse = -1;
var _ASTRoot = null;
var _SymbolTableRoot;
var _Verbose;
var _Autocopy;
var _varInParentScope = null;
var _parentScope = -1;
var _StaticTable = null;
var _JumpTable = null;
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
    TokenType[TokenType["INT"] = 8] = "INT";
    TokenType[TokenType["STR"] = 9] = "STR";
    TokenType[TokenType["BOOL"] = 10] = "BOOL";
    TokenType[TokenType["CHAR"] = 11] = "CHAR";
    TokenType[TokenType["EQUALS"] = 12] = "EQUALS";
    TokenType[TokenType["NOTEQUALS"] = 13] = "NOTEQUALS";
    TokenType[TokenType["SPACE"] = 14] = "SPACE";
    TokenType[TokenType["FALSE"] = 15] = "FALSE";
    TokenType[TokenType["TRUE"] = 16] = "TRUE";
    TokenType[TokenType["ADD"] = 17] = "ADD";
    TokenType[TokenType["EOF"] = 18] = "EOF";
    TokenType[TokenType["QUOTE"] = 19] = "QUOTE";
    TokenType[TokenType["NEWLINE"] = 20] = "NEWLINE";
    TokenType[TokenType["ID"] = 21] = "ID";
    TokenType[TokenType["DIGIT"] = 22] = "DIGIT";
    TokenType[TokenType["TYPE"] = 23] = "TYPE";
    TokenType[TokenType["BOOLOP"] = 24] = "BOOLOP";
    TokenType[TokenType["NONE"] = 25] = "NONE";
    TokenType[TokenType["PROGRAM"] = 26] = "PROGRAM";
})(TokenType || (TokenType = {}));
;
var TokenTypeString = ['LCURLY', 'RCURLY', 'PRINT', 'LPAREN', 'RPAREN', 'EQUALSIGN', 'WHILE', 'IF', 'INT',
    'STR', 'BOOL', 'CHAR', 'EQUALS', 'NOTEQUALS', 'SPACE', 'FALSE', 'TRUE', 'ADD', 'EOF',
    'QUOTE', 'NEWLINE', 'ID', 'DIGIT', 'TYPE', 'BOOLOP', 'NONE', 'PROGRAM'];
var TokenTypeChar = ['{', '}', '', '(', ')', '=', '', '', '',
    '', '', '', '==', '!=', ' ', '', '', '+', '$',
    '"', '\n', '', '0-9', '', '', ''];
var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType["Undeclared"] = 0] = "Undeclared";
    ErrorType[ErrorType["Redeclared"] = 1] = "Redeclared";
    ErrorType[ErrorType["TypeMismatch"] = 2] = "TypeMismatch";
    ErrorType[ErrorType["TypeMismatchAssign"] = 3] = "TypeMismatchAssign";
    ErrorType[ErrorType["TypeMismatchComp"] = 4] = "TypeMismatchComp";
    ErrorType[ErrorType["ImpossibleBool"] = 5] = "ImpossibleBool";
})(ErrorType || (ErrorType = {}));
;
var ErrorStr = ["Undeclared identifier", "Redeclared identifier in same scope", "Type Mismatched", "Type Mismatched during Assignment", "Type Mismatched during Comparison",
    "Boolean expressions with more than 2 comparisons need to start with a boolean to be valid."];
var WarningType;
(function (WarningType) {
    WarningType[WarningType["UnusedDI"] = 0] = "UnusedDI";
    WarningType[WarningType["Unused"] = 1] = "Unused";
    WarningType[WarningType["Uninit"] = 2] = "Uninit";
})(WarningType || (WarningType = {}));
;
var WarningStr = ["Variable declared and initialized, but never used.", "Variable never initialized", "Uninitialized variable"];
var ASTString = ['BLOCK', 'PRINTSTATMENT', 'ASSIGNMENTSTATEMENT', 'VARDECL', 'WHILESTATMENT', 'IFSTATEMENT'];
var onDocumentLoad = function () {
    _LexerError = false;
    _Lexer = TSC.Lexer;
    _Parser = new TSC.Parser();
    _Messenger = new TSC.Messenger("taOutput");
    _CodeGenerator = new TSC.CodeGen();
    _Token = TSC.Token;
    _Tokens = [];
    _TokenStr = [];
    _TokenIndex = 0;
    _CurrentToken = ' ';
    _ErrorCount = 0;
    _Verbose = false;
    _Autocopy = false;
    _SymbolTableRoot = null;
    _ASTRoot = null;
    _ScopeForParse = -1;
    _StaticTable = null;
    _JumpTable = null;
};
