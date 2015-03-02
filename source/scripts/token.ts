/* lexer.ts  */

module TSC
{
	export class Token {
		constructor(public type: TokenType,
                    public value,
                    public line: number) {
            this.type = type;
            this.value= value;
            this.line = line;
        }
        public toString(){
        	return TokenTypeString[this.type];
        }
        public static createToken(type, str, lineNum){
        	var temp = new Token (type, str,lineNum);
        	return temp;
        }
        public static addToken(token){
        	_Tokens.push(token);
        }
        public static createAndAddToken(type, str, lineNum){
        	var temp = TSC.Token.createToken(type, str, lineNum);
        	_Tokens.push(temp);
        }
        public static getAndAddToken(str, lineNum){
        	var temp = TSC.Token.getToken(str, lineNum);
        	_Tokens.push(temp);
        }
        public static getToken(str,lineNum) : any {

        	//returns created token or null 
        	if (str.match(/\n/)){
        		//newline sent in
	           return TSC.Token.createToken(TokenType.NEWLINE,str,lineNum); 
        	}
	        str = str.trim(); //to handle excess spaces and newlines
	        if(str.length === 0) //in the case of being passed an empty buffer, don't throw an error
	            return null;

	        switch(str) {
	            case '{':
	                return TSC.Token.createToken(TokenType.LCURLY,str,lineNum);
	            case '}':
	                return TSC.Token.createToken(TokenType.RCURLY,str,lineNum);
	            case '(':
	                return TSC.Token.createToken(TokenType.LPAREN,str,lineNum);
	            case ')':
					return TSC.Token.createToken(TokenType.RPAREN,str,lineNum);
	            case '=':
	                return TSC.Token.createToken(TokenType.EQUALSIGN,str,lineNum);
	            case '==':
	            	return TSC.Token.createToken(TokenType.EQUALS,str,lineNum);
	            case '!=':
	            	return TSC.Token.createToken(TokenType.NOTEQUALS,str,lineNum);
	            case '$':
	                return TSC.Token.createToken(TokenType.EOF,str,lineNum);
	            case '+':
	            	return TSC.Token.createToken(TokenType.ADD,str,lineNum);
	            case '"':
	            	return TSC.Token.createToken(TokenType.QUOTE,str,lineNum);
	            case 'false':
	            	return TSC.Token.createToken(TokenType.TRUE,str,lineNum);
	            case 'true':
	                return TSC.Token.createToken(TokenType.FALSE, str,lineNum);
	            case 'print':
	            	return TSC.Token.createToken(TokenType.PRINT,str,lineNum);
	            case 'while':
	            	return TSC.Token.createToken(TokenType.WHILE,str,lineNum);
	            case 'if':
	            	return TSC.Token.createToken(TokenType.IF,str,lineNum);
	            case 'int':
	            	return TSC.Token.createToken(TokenType.INT,str,lineNum);
	            case 'string':
	            	return TSC.Token.createToken(TokenType.STR,str,lineNum);
	            case 'boolean':
	            	return TSC.Token.createToken(TokenType.BOOL,str,lineNum);
	           

        	}
        	
	        //if a single character (a-Z) has been sent in
	        if(str.length === 1 && str.match(/[a-z]/)) 
	           return TSC.Token.createToken(TokenType.ID,str,lineNum); 
	           //we've found an identifier	        

	        //if a single digit has been sent in
	        if(str.length === 1 && str.match(/[0-9]/)) 
	            return TSC.Token.createToken(TokenType.DIGIT,str,lineNum);
	           
	        return null; //This token doesn't match anything

        }

	}
}
