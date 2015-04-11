module TSC
{
	export class Messenger{
	
	constructor(private ID:string) {
	    this.ID = ID;
	}
	public putMessage (msg){
    	(<HTMLInputElement> document.getElementById(this.ID)).innerHTML += msg +"\n";
	}
	public putHeaderMessage(msg){
		if(_Verbose){
			this.putMessage("-------------------------");
			this.putMessage(msg);
			this.putMessage("-------------------------");
		}
		else
			this.putMessage(msg);
	}
	public putError(line, part, msg){
		if (typeof msg !=="number"){
			this.putMessage("*****(Line: "+line +") " +part + " Error: " + msg+"*****");
			if (part ==="Lexer")
				_LexerError = true;
		}
		else
			this.putMessage("*****(Line: "+line +") " +part + " Error: " + ErrorStr[msg]+"*****");
	}
	public putWarning(line, part, msg:any){
		if (typeof msg !=="number")
			this.putMessage("***(Line: "+line+") " +part + " Warning " +msg+"***");
		else
			this.putMessage("***(Line: "+line+") " +part + " Warning " +WarningStr[msg]+"***");
	}
	public putExpectingCorrect(line, part, expected, found){
		this.putMessage("(Line: "+line+") " +part + " Expected " +expected +", Found " + found);
	}

	public putExpectingWrong = function(line, part, expected, found){
		this.putMessage("(Line: "+line+") " +part + " Error: Expected " +expected +", Found " + found);
	}
	public putFailed(part){
		this.putMessage(part + ": Failed. Compilation has been terminated.");
	}
	public putSuccess(part){
		this.putMessage(part + ": Completed Successfully.");
	}
	}
}