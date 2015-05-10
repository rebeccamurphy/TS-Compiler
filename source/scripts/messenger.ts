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
			this.putMessage("-----------------------------------------");
			this.putMessage(msg);
			this.putMessage("-----------------------------------------");
		}
		else
			this.putMessage(msg);
	}
	public putError(line, msg, part?){
		if (typeof msg !=="number"){
			this.putMessage("*****(Line: "+line +") Error: " + msg+"*****");
			if (part ==="Lexer")
				_LexerError = true;	
			document.getElementById("Errors").innerHTML += "<div>(Line: "+line +") Error: " + msg +"</div>";
		
		}
		else if (part===undefined){
			this.putMessage("*****(Line: "+line +") Error: " + ErrorStr[msg]+"*****");
			document.getElementById("Errors").innerHTML += "<div>(Line: "+line +") Error: " + ErrorStr[msg] +"</div>";
		}
		else{
			this.putMessage("*****(Line: "+line +") Error: " + ErrorStr[msg]+"*****");
			document.getElementById("Errors").innerHTML += "<div>(Line: "+line +") ID: "+part +"  Error: " + ErrorStr[msg] +"</div>";
		}
	}
	public putWarning(line,msg:any){
		
		if (typeof msg !=="number"){
			this.putMessage("***(Line: "+line+") Warning: " +msg+"***");
			document.getElementById("Warnings").innerHTML += "<div>(Line: "+line +") Warning: " + msg +"</div>";
			
		}
		else{
			this.putMessage("***(Line: "+line+") Warning: " +WarningStr[msg]+"***");
			document.getElementById("Warnings").innerHTML += "<div>(Line: "+line +") Warning: " + WarningStr[msg] +"</div>";
				
		}
	}
	public putExpectingCorrect(line, part, expected, found){
		this.putMessage("(Line: "+line+") " +part + " Expected " +expected +", Found " + found);
	}
	public putExpectingWrong(line, part, expected, found){
		this.putMessage("(Line: "+line+") " +part + " Error: Expected " +expected +", Found " + found);
	}
	public putFailed(part){
		this.putHeaderMessage(part + ": Failed. Compilation has been terminated.");
	}
	public putSuccess(part){
		this.putHeaderMessage(part + ": Completed Successfully.");
	}

	}
}