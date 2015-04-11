//Global Constants
var EOF = "$";
// Global variables
var _Tokens = [];
var _TokenIndex = 0;
var _CurrentToken;
var _ErrorCount = 0;
var _TokenStr = [];
var _LexerError;
var _Lexer;
var _Parser;
var _Token;
var _SemanticAnalysis;
var _ASTRoot = null;
var _SymbolTableRoot;
var _Verbose = false;
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
    '"', '\n', '', '', '', '', ''];
var ASTString = ['BLOCK', 'PRINTSTATMENT', 'ASSIGNMENTSTATEMENT', 'VARDECL', 'WHILESTATMENT', 'IFSTATEMENT'];
var putMessage = function (msg) {
    document.getElementById("taOutput").value += msg + "\n";
};
var putError = function (line, part, msg) {
    putMessage("(Line: " + line + ") " + part + " Error " + msg);
    if (part === "Lexer")
        _LexerError = true;
};
var putWarning = function (line, part, msg) {
    putMessage("(Line: " + line + ") " + part + " Warning " + msg);
};
var putExpectingCorrect = function (line, part, expected, found) {
    putMessage("(Line: " + line + ") " + part + " Expected " + expected + ", Found " + found);
};
var putExpectingWrong = function (line, part, expected, found) {
    putMessage("(Line: " + line + ") " + part + " Error: Expected " + expected + ", Found " + found);
};
var putFailed = function (part) {
    putMessage(part + ": Failed. Compilation has been terminated.");
};
var putSuccess = function (part) {
    putMessage(part + ": Completed Successfully.");
};
var onDocumentLoad = function () {
    _LexerError = false;
    _Lexer = TSC.Lexer;
    _Parser = new TSC.Parser();
    _Token = TSC.Token;
    _Tokens = [];
    _TokenStr = [];
    _TokenIndex = 0;
    _CurrentToken = ' ';
    _ErrorCount = 0;
};
