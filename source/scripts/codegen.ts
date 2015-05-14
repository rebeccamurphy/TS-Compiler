module TSC
{
	export class CodeGen {
		private opCode;
		private codeTable;
		private staticTable;
		private jumpTable;
		private maxByteSize;
		private currMemLoc;
		private currHeapLoc;
		private tempVarMemRef;
		private tempVarMemRef2;
		private depth;
		private errors;
		private line;
        constructor() {
        	this.opCode = {
        		loadAccWithConstant: "A9",
        		loadAccFromMemory  : "AD",
        		storeAccInMemory   : "8D",
        		addWithCarry       : "6D",
        		loadXWithConstant  : "A2",
        		loadXFromMemory    : "AE",
        		loadYWithConstant  : "A0",
        		loadYFromMemory    : "AC",
        		sysBreak           : "00",
        		noOperation        : "EA",
        		compareByteToX     : "EC",
        		branchNotEqual     : "D0",
        		incrementByteVal   : "EE",
        		sysCall            : "FF"
        	};
        	this.codeTable   = [];
		    this.maxByteSize = 256;
		    this.currMemLoc  = 0;
		    this.currHeapLoc = (this.maxByteSize-1);
		    this.tempVarMemRef;
		    this.tempVarMemRef2;
		    this.depth = 0;
		    this.errors=0;
		    this.line =0;
		}
		public displayCode(){
			var output="<tr>";
			var rowID="";
			var code = "";
			for (var i=0; i<this.codeTable.length; i++){
			    if (i % 16 ===0){
			        rowID="rowID"+(i/16);
			        output += "</tr><tr id="+rowID+"><td id='dataID" + i + "'>" + this.codeTable[i] + '</td>';

			    }
			    else
			    	output += "<td id='dataID" + i + "'>" + this.codeTable[i] + '</td>';
			    code += this.codeTable[i];
			    if (this.codeTable[i]=="00" &&this.currHeapLoc==this.maxByteSize-1 && i>=this.currMemLoc)
			    	//nothing store on heap
			    	break;

			}
			output += "</tr>"
			document.getElementById("CodeTable").innerHTML = output;
			if (_Autocopy)
				TSC.Utils.copyToClipboard(code);
		}
		public gen(){
			_Messenger.putHeaderMessage("Generating 6502a code...");
        	
        	_Messenger.putMessage("Initializing bytes (" + this.maxByteSize +").");
        	for(var i=0; i<this.maxByteSize; i++)
            	this.codeTable.push("00");
            _Messenger.putMessage("Initializing Static Table.");
            _StaticTable = new StaticTable();
            _Messenger.putMessage("Initializing Jump Table.");
            _JumpTable = new JumpTable();
            
        	
	        _Messenger.putMessage("Registering temp memory.");
	        this.tempVarMemRef = _StaticTable.add("temp", -1, "int", false);
	        this.tempVarMemRef2 = _StaticTable.add("temp2", -1, "int", false);
	        _Messenger.putHeaderMessage("Begin generating code from AST.");
	        this.populateCodeTable(_ASTRoot);
	        if( this.errors> 0)
	            return;
	        _Messenger.putMessage("Backpatching temporary variables in static memory.");
	        this.populateStaticTable();
	        if(this.errors > 0){
	        	_Messenger.putHeaderMessage("Found: " + this.errors + "errors. Ceasing Code Gen.")
	            return;
	        }
	        _Messenger.putMessage("Backpatching temporary jump locations.");
	        if(this.errors > 0){
	        	_Messenger.putHeaderMessage("Found: " + this.errors + "errors. Ceasing Code Gen.")
	            return;
	        }
	        this.fillInJumps();
	        if (_Verbose){
	        	_Messenger.putMessage("Displaying Static Table.");
	        	_Messenger.putMessage("Displaying Jump Table.");
	        }
	        _StaticTable.display();
	        _JumpTable.display();

	        _Messenger.putHeaderMessage("Code Generation Complete. Errors: " + this.errors);
	        this.displayCode();

	        return this.codeTable;

			}
		

    	
    	public addToHeap(str) {
    		if (_Verbose)
	        	_Messenger.putMessage("Adding string to heap.");  
	        //check if string exists in heap
	        for(var i=this.currHeapLoc; i<this.maxByteSize-1; i++) {
	            if(TSC.Utils.toHexStr(str.charCodeAt(0)) === this.codeTable[i]) { //matches first char
	                var compArr = [];
	                for(var z=i; this.codeTable[z] !== "00"; z++)
	                    compArr.push(this.codeTable[z]);
	                if(compArr.length === str.length) {
	                    var matches = true;
	                    for(var x=0; x<compArr.length; x++) {
	                        if(compArr[x] !== TSC.Utils.toHexStr(str.charCodeAt(x))){
	                            matches = false;
	                            break;
	                        }
	                    }
	                    if(matches) {
	                    	if (_Verbose){
	                        	_Messenger.putMessage("String already exists in heap.");
	                        	_Messenger.putMessage("Returning existing string location: " + TSC.Utils.toHexStr(i));
	                        }
	                        return TSC.Utils.toHexStr(i);
	                    }
	                }
	        	}
        	}
        	this.currHeapLoc -= (str.length + 1) - (this.currHeapLoc === (this.maxByteSize-1) ? 1:0); //move up in the heap
	        //write string to the heap
	        for(var i=this.currHeapLoc; i<this.currHeapLoc+str.length;i++)
	            this.codeTable[i] = TSC.Utils.toHexStr(str.charCodeAt(i-this.currHeapLoc));
	        //add terminating character
	        this.codeTable[this.currHeapLoc+str.length] = "00";
	        if (_Verbose)
	        	_Messenger.putMessage("String added at location: " + TSC.Utils.toHexStr(this.currHeapLoc));

	        return TSC.Utils.toHexStr(this.currHeapLoc);
        }
        public addCell(opC:string) {
        	
        	_Messenger.putMessage("Adding byte: " + opC);
        	console.log(opC);
        	this.codeTable[this.currMemLoc++] = opC; 
        	
        	if(this.currMemLoc >= this.currHeapLoc) {
                _Messenger.putError(this.line,"Out of memory. Code area has overflowed into the heap.");
                this.errors += 1;
                return;
        	}
    	}
    	public populateCodeTable(node:TreeNode){
    		this.line = (node.getLine()==-1)? this.line :node.getLine();
    	   	switch(node.getType()){
        		case "BLOCK":
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());

        			for(var i=0; i<node.getChildren().length; i++){
        				this.populateCodeTable(node.getChildren()[i]);
        				
        			}
        			break;
        		case "PRINT":
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());
                	
                	this.printCode(node.getChildren()[0]);
        			break;
        		case "ASSIGN":
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());
                	this.assignCode(node);
        			break;
        		case "VARDECL":
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());
                	this.varDeclCode(node);
        			break;
        		case "WHILE":
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());
                	
                	this.whileCode(node);
        			break;
        		case "IF":
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());
                	this.ifCode(node);
        			break;
        		case "ADD":
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());

                	this.addCell(this.opCode.loadAccWithConstant);
                	this.addCell(TSC.Utils.toHexStr(node.getChild(0).getValue()));
                	this.recursiveAdd(node.getChild(1));
        			break;
        		case "COMP":
        			//== && !=
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());
                	if (node.getValue()=== "=="){
                		this.setZFlagEquals(node);
                	}
                	else{
		                //SET Z-FLAG TO THE RESULT OF EQUALS AND THEN FLIP THE VALUE
		                //set z-flag the result of an equals operation
		                this.setZFlagEquals(node);              

		                //load X with 00 to compare against 00 which basically makes the default true
		                this.addCell(this.opCode.loadXWithConstant); 
		                this.addCell("00");                     

		                //if z-flag is false, we want to return the default (true), so branch over false value
		                this.addCell(this.opCode.branchNotEqual);    
		                this.addCell("02");                 

		                //load X with 01 to compare against 00 
		                //which basically sets the z-flag to false on comparison
		                this.addCell(this.opCode.loadXWithConstant); 
		                this.addCell("01");                    
		                
		                //compare the X reg with 00
		                this.addCell(this.opCode.compareByteToX);  
		                this.addCell(TSC.Utils.toHexStr(this.maxByteSize-1));
		                this.addCell("00");
                	}
        			break;
        		default:
        			break;
        	}
    	}

    	public printCode(node:TreeNode){
    		
    		switch(node.getType()){
    			case "ID":
					var itemInStaticTable = _StaticTable.get(node);
                    this.addCell(this.opCode.loadYFromMemory);
                    this.addCell(itemInStaticTable.temp);
                    this.addCell("XX");
                    this.addCell(this.opCode.loadXWithConstant);
                    this.addCell((itemInStaticTable.type === "STR") ? "02":"01");
                    this.addCell(this.opCode.sysCall);
    				break;
    			case "BOOL":
    				this.addCell(this.opCode.loadYWithConstant);
                    this.addCell((node.getValue() == "true") ? "01":"00");
                    this.addCell(this.opCode.loadXWithConstant);
                    this.addCell("01");
                    this.addCell(this.opCode.sysCall);
    				break;
    			case "STRING":
    				var strRef = this.addToHeap(node.getValue());
                    this.addCell(this.opCode.loadYWithConstant);
                    this.addCell(strRef);
                    this.addCell(this.opCode.loadXWithConstant);
                    //print the 00-terminated string stored at the address in the Y register.
                    this.addCell("02");
                    this.addCell(this.opCode.sysCall);
    				break;
    			case "DIGIT":
    				var hex = "0" + node.getValue();
                    this.addCell(this.opCode.loadYWithConstant);
                    this.addCell(hex);
                    this.addCell(this.opCode.loadXWithConstant);
                    //print the integer stored in the Y register
                    this.addCell("01"); 
                    this.addCell(this.opCode.sysCall);
    				break;
    				

    			case "ADD":
    				//get result of addition in accumulator
                    this.populateCodeTable(node); 
					
					this.addCell((_StaticTable.get(new TreeNode("int", null,"temp"))).temp);
					this.addCell("XX");
					
					//load temp into y reg
					this.addCell(this.opCode.loadYFromMemory); 
					this.addCell((_StaticTable.get(new TreeNode("int", null,"temp"))).temp);
					this.addCell("XX");

					//load 01 into x to print non-string
					this.addCell(this.opCode.loadXWithConstant); 
					this.addCell("01");

					//sys call to print. the only assembly i can actually remember
					this.addCell(this.opCode.sysCall);                     
                    break;
    			case "COMP":
    				//handle as boolean and set default to false
    				this.addCell(this.opCode.loadAccWithConstant);
    				this.addCell("00");
    				
    				//if false, skip to next instruction
    				this.addCell(this.opCode.branchNotEqual);
    				this.addCell("02");

    				//if not false, it should reach here and set the value to true
    				this.addCell(this.opCode.loadAccWithConstant);
    				this.addCell("01");
    				//store accumulator in temp mem
    				this.addCell(this.opCode.storeAccInMemory); 


                    this.addCell((_StaticTable.get(new TreeNode("int", null,"temp"))).temp);
                    this.addCell("XX");

                    //load temp into y reg
                    this.addCell(this.opCode.loadYFromMemory);
                    this.addCell((_StaticTable.get(new TreeNode("int", null,"temp"))).temp);
                    this.addCell("XX");

                    //load 01 into x to print non-string
                    this.addCell(this.opCode.loadXWithConstant); 
                    this.addCell("01");
                    //sys call to print. still only one i remember.
                    this.addCell(this.opCode.sysCall); 
 
    				break;
    			default:
    				//this should never go but might as well keep it for the memories
    				console.log('no match');
    				break;
    		}

    	}
    	public assignCode(node:TreeNode){
    		
    		var id = node.getChildren()[0];
    		var val = node.getChildren()[1];
    		var typeOfAssign = val.getType();
    		var staticEntry = _StaticTable.get(id);
            var type = staticEntry.type;
    		switch(typeOfAssign){
    			case "ID":
    				this.addCell(this.opCode.loadAccFromMemory);
                    this.addCell((_StaticTable.get(val)).temp);
                    this.addCell("XX");
    				break;
    			case "DIGIT":
            		this.addCell(this.opCode.loadAccWithConstant);
    				this.addCell(TSC.Utils.toHexStr(val.getValue()));
    				break;
    			case "BOOL":
            		this.addCell(this.opCode.loadAccWithConstant);
    				this.addCell("0" + ((val.getValue() === "true") ? "1":"0"));
    				break;
    			case "STRING":
            		this.addCell(this.opCode.loadAccWithConstant);
    				this.addCell(this.addToHeap(val.getValue()));
    				break;
    			default:
    				//expr
    				this.populateCodeTable(val);
    				if(val.getType()==="COMP") {
                        //deal with boolean expr results
                        //set default value to false
                        this.addCell(this.opCode.loadAccWithConstant);
                        this.addCell("00");
                        
                        //if false, skip to next instruction
                        this.addCell(this.opCode.branchNotEqual);
                        this.addCell("02");

                        //if not false, it should reach here and set the value to true
                        this.addCell(this.opCode.loadAccWithConstant);
                        this.addCell("01");
                    } 
    		}
    		this.addCell(this.opCode.storeAccInMemory);
    		this.addCell(staticEntry.temp);
    		this.addCell("XX");	
    	}

    	public varDeclCode(node:TreeNode){
    		
    		var type = node.getChildren()[0].getType();
            var val = node.getChildren()[1];

            if(type === "STR") {
                _StaticTable.add(val.getValue(), val.scope, type, true);
            }
            else{
            	
	            this.addCell(this.opCode.loadAccWithConstant);
	            this.addCell("00");
	            this.addCell(this.opCode.storeAccInMemory);

	            this.addCell((_StaticTable.add(val.getValue(), val.scope, type, false)));
	            this.addCell("XX");
            }
    	}

    	public whileCode(node:TreeNode){
    		//create temp jump location
    		var tempJump = _JumpTable.add(); 
    		 //grab the location at the beginning of the loop
            var startLoc = this.currMemLoc;
           
            //in case of 'true' or 'false'
            if(node.getChildren()[0].getType() === "BOOL") {
                var boolVal = node.getChild(0).getValue() === "true";
                if (boolVal){
                	_Messenger.putWarning(this.line, "Infinite loop. There's no break in this language, dude.");
                }
                this.addCell(this.opCode.loadXWithConstant);
                this.addCell(boolVal ? "00":"01");
                this.addCell(this.opCode.compareByteToX);
                this.addCell(TSC.Utils.toHexStr(this.maxByteSize-1));
                this.addCell("00");
            } 
            else
                this.populateCodeTable(node.getChildren()[0]); //do comparison; fill z flag

            //if false, branch away from while loop
            this.addCell(this.opCode.branchNotEqual); 
            //the location after the while loop (temp jump location)
            this.addCell(tempJump); 
            //save the memory location after the comparison
            var lastLoc = this.currMemLoc; 
            //the code in the while block
            this.populateCodeTable(node.getChildren()[1]); 
            //put a 01 in X reg to make branchNotEqual happen after comparison
            this.addCell(this.opCode.loadXWithConstant); 
            this.addCell("01");
            this.addCell(this.opCode.compareByteToX);
            //the last byte, always 00
            this.addCell(TSC.Utils.toHexStr(this.maxByteSize-1)); 
            this.addCell("00");
            //branch back to top of loop
            this.addCell(this.opCode.branchNotEqual); 
            //jump to top of loop
            this.addCell(TSC.Utils.toHexStr((this.maxByteSize-1) - (this.currMemLoc - startLoc))); 
            //fill in temp jump location with real location
            _JumpTable.add(tempJump, TSC.Utils.toHexStr(this.currMemLoc-lastLoc)); 
            
    	}
    	public ifCode(node:TreeNode){
    		var tempJump= _JumpTable.add(); //create a temp jump location

            //in case of 'true' or 'false'
            if(node.getChildren()[0].getType() === "BOOL") {
                var boolVal = node.getChild(0).getValue() === "true";
                if (boolVal)
                	_Messenger.putWarning(this.line, "This will always be true. Why.");
                else
                	_Messenger.putWarning(this.line, "This will always be false. Why.");
                this.addCell(this.opCode.loadXWithConstant);
                this.addCell(boolVal ? "00":"01");
                this.addCell(this.opCode.compareByteToX);
                this.addCell(TSC.Utils.toHexStr(this.maxByteSize-1));
                this.addCell("00");

            } 
            else
                this.populateCodeTable(node.getChildren()[0]); //do the comparison; fill z flag
            //if false, branch
            this.addCell(this.opCode.branchNotEqual); 
            //the location after the if statement to branch to (temp jump location)
            this.addCell(tempJump); 
            //store our current location in memory
            var lastLoc = this.currMemLoc; 
            //the code in the while block
            this.populateCodeTable(node.getChildren()[1]); 
            //fill in temp jump location with real location
            _JumpTable.add(tempJump,TSC.Utils.toHexStr(this.currMemLoc-lastLoc)); 
    	}
    	public recursiveAdd(node:TreeNode) {
    		
	        if(node.getType()!=="ADD" && node.getType()!=="COMP") {
	            if(node.getType() === "ID") { 
	                this.addCell(this.opCode.addWithCarry);
	                this.addCell((_StaticTable.get(node)).temp);
	                this.addCell("XX");
	            } 
	            else { //if it's a DIGIT
	                //store accumulator in memory
	                this.addCell(this.opCode.storeAccInMemory);
	                this.addCell((_StaticTable.get(new TreeNode("int", null,"temp2"))).temp);
	                this.addCell("XX");
	                //store temp digit in memory (overwrites accumulator)
	                this.addCell(this.opCode.loadAccWithConstant);
	                this.addCell(TSC.Utils.toHexStr(node.getValue()));
	                this.addCell(this.opCode.storeAccInMemory);
	                this.addCell((_StaticTable.get(new TreeNode("int", null,"temp"))).temp);
	                this.addCell("XX");
	                //load back old accumulator
	                this.addCell(this.opCode.loadAccFromMemory);
	                this.addCell((_StaticTable.get(new TreeNode("int", null,"temp2"))).temp);
	                this.addCell("XX");
	                //add stored digit to accumulator
	                this.addCell(this.opCode.addWithCarry);
	                this.addCell((_StaticTable.get(new TreeNode("int", null,"temp"))).temp);
	                this.addCell("XX");
	            }
	        } 
	        else { //it's an expr
	            //ADD THE DIGIT FIRST
	            //store accumulator in memory
	            this.addCell(this.opCode.storeAccInMemory);
	            this.addCell((_StaticTable.get(new TreeNode("int", null,"temp2"))).temp);
	            this.addCell("XX");
	            //store temp digit in memory (overwrites accumulator)
	            this.addCell(this.opCode.loadAccWithConstant);
	            this.addCell(TSC.Utils.toHexStr(node.getChildren()[0].getValue()));
	            this.addCell(this.opCode.storeAccInMemory);
	            this.addCell((_StaticTable.get(new TreeNode("int", null,"temp"))).temp);
	            this.addCell("XX");
	            //load back old accumulator
	            this.addCell(this.opCode.loadAccFromMemory);
	            this.addCell((_StaticTable.get(new TreeNode("int", null,"temp2"))).temp);
	            this.addCell("XX");
	            //add stored digit to accumulator
	            this.addCell(this.opCode.addWithCarry);
	            this.addCell((_StaticTable.get(new TreeNode("int", null,"temp"))).temp);
	            this.addCell("XX");

	            //recurse on the right side bb
	            this.recursiveAdd(node.getChildren()[1]);
	        }
	    }
    	public populateStaticTable(){
    		this.currMemLoc+=1;
        	for(var i=0; i< _StaticTable.entrys.length; i++) {
	            var item = _StaticTable.entrys[i];
	            for(var j=0;j < this.codeTable.length; j++) {
	                if(this.codeTable[j]===item.temp){ 
	                    this.codeTable[j] = TSC.Utils.toHexStr(this.currMemLoc);
	                }
	                if(this.codeTable[j] === "XX")
	                    this.codeTable[j] = "00";
            	}
	            this.currMemLoc+= 1;
	            if(this.currMemLoc >= this.currHeapLoc) {
	                _Messenger.putError(this.line, "Out of memory. Static area has overflowed into the heap.");
	                this.errors += 1;
	                return;
	            }
	    	}
    	}
    	public fillInJumps() {
	        for(var i=0;i<_JumpTable.entrys.length; i++) {
	            for(var j=0;j< this.codeTable.length; j++)
	                if(this.codeTable[j] === _JumpTable.entrys[i].temp)
	                    this.codeTable[j] = _JumpTable.entrys[i].distance;
	        }
    	}

    	public setZFlagEquals(node:TreeNode) {
	        var arg1 = node.getChildren()[0];
	        var arg2 = node.getChildren()[1];
	        //if we are not dealing with expressions
	        if((arg1.getType()!=="ADD"&&arg2.getType()!=="COMP") &&(arg1.getType()!=="ADD" &&arg2.getType()!=="COMP")) {
	            if(arg1.getType() === "ID" && arg2.getType() !== "ID") {
	                this.addCell(this.opCode.loadXWithConstant);
	                if(arg2.getType() === "BOOL")
	                    this.addCell(arg2.getValue() === "true" ? "01":"00");
	                else if(arg2.getType()==="STRING") 
	                    this.addCell(this.addToHeap(arg2.getValue()));    
	                else
	                    this.addCell(TSC.Utils.toHexStr(arg2.getValue()));

	                this.addCell(this.opCode.compareByteToX);
	                this.addCell((_StaticTable.get(arg1)).temp);
	                this.addCell("XX");
	            } 
	            else if(arg1.getType() !== "ID" && arg2.getType() === "ID") {
	                this.addCell(this.opCode.loadXWithConstant);
	                if(arg1.getType() === "BOOL")
	                    this.addCell(arg1.getValue() === "true" ? "01":"00");
	                else if(arg1.getType()==="STRING")
	                    this.addCell(this.addToHeap(arg1.getValue()));    
	                else
	                    this.addCell(TSC.Utils.toHexStr(arg1.getValue()));

	                this.addCell(this.opCode.compareByteToX);
	                this.addCell((_StaticTable.get(arg2)).temp);
	                this.addCell("XX");
	            }
	            else if(arg1.getType() !== "ID" && arg2.getType() !== "ID") {
	                //can optimize by comparing the values right here
	                //IF they are the same type (which we know they are at this point)
	                //and IF they are defined prior to runtime explicitly
	                //so basically if 1==1 or something. which would be dumb. but here we are.

	                if(arg1.getValue() === arg2.getValue()) {
	                    //since they are equal, let's force true
	                    this.addCell(this.opCode.loadXWithConstant);
	                    this.addCell("00");
	                    _Messenger.putWarning(this.line, "This will always be true. You're comparing two constants. Why.");
	                } else {
	                    this.addCell(this.opCode.loadXWithConstant);
	                    this.addCell("01");
	                    _Messenger.putWarning(this.line, "This will always be false. You're comparing two constants. Why.");
	                }
	                this.addCell(this.opCode.compareByteToX);
	                this.addCell(TSC.Utils.toHexStr(this.maxByteSize-1));
	                this.addCell("00");
	            }
	            else { //two ids
	                this.addCell(this.opCode.loadXFromMemory);
	                this.addCell(_StaticTable.get(arg1).temp);
	                this.addCell("XX");
	                this.addCell(this.opCode.compareByteToX);
	                this.addCell(_StaticTable.get(arg2).temp);
	                this.addCell("XX");
	            }
	        } 
	        else { //deal with exprs
	            //nested boolean expr check
	            var a1 = node.getChild(0);
	            var a2 = node.getChild(1);
	            if((a1.getType() === "BOOL" || a2.getType() === "BOOL")) {
	                //nested boolean expressions
	                _Messenger.putMessage("You put a fuck ton of nexted booleans, and I don't know how to deal with it. ")
	                //TODO maybe check for like just normal booleans and optimize?
	                throw new Error ('Lazy Programmer :(');
	                return;
	            }
	            if(arg1==="DIGIT" && arg2==="DIGIT") {
	                //deal with addition
	                //ARG ONE
	                //do addition and store in acc
	                this.populateCodeTable(node.getChildren()[0]);
	                //store that val in temp mem
	                this.addCell(this.opCode.storeAccInMemory);
	                this.addCell(_StaticTable.get(new TreeNode("int", null,"temp2")).temp);
	                this.addCell("XX");
	                //load that val from temp mem into X reg
	                this.addCell(this.opCode.loadXFromMemory);
	                this.addCell(_StaticTable.get(new TreeNode("int", null,"temp2")).temp);
	                this.addCell("XX");

	                //ARG2
	                //do addition and store in acc for Arg2
	                this.populateCodeTable(node.getChildren()[1]);
	                //store that in temp mem
	                this.addCell(this.opCode.storeAccInMemory);
	                this.addCell(_StaticTable.get(new TreeNode("int", null,"temp2")).temp);
	                this.addCell("XX");

	                //compare the two for equality
	                this.addCell(this.opCode.compareByteToX);
	                this.addCell(_StaticTable.get(new TreeNode("int", null,"temp2")).temp);
	                this.addCell("XX");
	            } 
	            else {
	                //we know that one or the other is an expr
	                //so grab the one that is
	                var expr  = (arg1==="COMP" ||arg1==="ADD") ? node.getChild(0):node.getChild(1);
	                //the other is a value
	                var value = (arg2!=="COMP"||arg2!=="ADD") ? arg2:arg1;

	                //do addition in expr
	                this.populateCodeTable(expr);
	                //store that val in temp mem
	                this.addCell(this.opCode.storeAccInMemory);
	                this.addCell(_StaticTable.get(new TreeNode("int", null,"temp2")).temp);
	                this.addCell("XX");

	                //load value into memory
	                if(value.getType() === "ID") {
	                    this.addCell(this.opCode.loadXFromMemory);
	                    this.addCell(_StaticTable.get(value).temp);
	                    this.addCell("XX");
	                }
	                else {
	                    this.addCell(this.opCode.loadXWithConstant);
	                    this.addCell(TSC.Utils.toHexStr(value.getValue()));
	                }

	                //compare the two for equality
	                this.addCell(this.opCode.compareByteToX);
	                this.addCell(_StaticTable.get(new TreeNode("int", null,"temp2")).temp);
	                this.addCell("XX");
	            }
	        }
    	}

    

    }

}


