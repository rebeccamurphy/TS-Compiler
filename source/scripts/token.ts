/* lexer.ts  */

module TSC
{
	export class Token {
		constructor(public kind: TokenType,
                    public value,
                    public line: number) {
            this.kind = kind;
            this.value= value;
            this.line = line;
        }
        public static addToken(){
        	_Tokens.push(this);
        }

	}
}
