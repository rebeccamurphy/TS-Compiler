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
		    this.staticTable = [];
		    this.jumpTable   = [];
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
			for (var i=0; i<this.codeTable.length; i++){
			    if (i % 8 ===0){
			        rowID="rowID"+(i/8);
			        output += "</tr><tr id="+rowID+"><td> <b>" + TSC.Utils.createHexIndex(i) + " </td>";
			    }
			    else
			    	output += "<td id='dataID" + i + "'>" + this.codeTable[i] + '</td>';
			}
			output += "</tr>"
			document.getElementById("CodeTable").innerHTML = output;
		}
		public gen(){
			_Messenger.putHeaderMessage("<h3>Generating 6502a code...</h3>");
        	//initialize codeTable to 0s
        	_Messenger.putMessage("Initializing bytes (" + this.maxByteSize +").");
        	for(var i=0; i<this.maxByteSize; i++)
            	this.codeTable.push("00");

	        _Messenger.putMessage("Registering temp memory.");
	        this.tempVarMemRef = this.addToStaticTable("temp", -1, "int", false);
	        this.tempVarMemRef2 = this.addToStaticTable("temp2", -1, "int", false);
	        _Messenger.putHeaderMessage("Begin generating code from AST.");
	        this.populateCodeTable(_ASTRoot);
	        if( this.errors> 0)
	            return;
	        _Messenger.put("Backpatching temporary variables in static memory.");
	        this.populateStaticTable();
	        if(this.errors > 0)
	            return;
	        _Messenger.put("Backpatching temporary jump locations.");
	        if(this.errors > 0)
	            return;
	        this.fillInJumps();
	        //this.fillInGUI();

	        return this.codeTable;

			}
		public addToStaticTable(varName, scope, type, address) {
	        var tempName = "T"+this.staticTable.length;
	        _Messenger.putMessage("Adding item " + varName + "@" + scope + " as " + tempName + "XX to static table.");
	        this.staticTable.push({
	            temp    : tempName,
	            id      : varName,
	            scope   : scope,
	            offset  : this.staticTable.length,
	            type    : type,
	            address : address === true
	        });
	        return tempName;
	    }

	    public getFromStaticTable(id,scope) {
        	for(var i=0; i<this.staticTable.length;i++)
            	if(this.staticTable[i].id === id && this.staticTable[i].scope === scope)
                	return this.staticTable[i];

        	return null;
    	}

    	public addToJumpTable(temp?, distance?){
    		if(temp!==undefined) {
            	for(var i =0; i<this.jumpTable.length; i++){
                	if(this.jumpTable[i].temp === temp)
                    	this.jumpTable[i].distance = distance;
            	}
        	} 
        	else {
            	this.jumpTable.push({
                	temp      : "J"+this.jumpTable.length,
                	distance : "?"
            		});
            	if (_Verbose)
            		_Messenger.putMessage("Adding item " + ("J" + (this.jumpTable.length - 1)) + " to static table.");
            	return "J" + (this.jumpTable.length - 1);
        	}

    	}
    	public getFromJumpTable(id:string, scope:number){
    		for (var i=0; i<this.jumpTable.length; i++){
    			if (this.jumpTable[i].id ===id && this.jumpTable.scope===scope)
    				return this.jumpTable[i];
    		}
    		return null;
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
        	this.codeTable[this.currMemLoc++] = opC; 
        	
        	if(this.currMemLoc >= this.currHeapLoc) {
                _Messenger.putError(this.line,"Out of memory. Code area has overflowed into the heap.");
                this.errors += 1;
                return;
        	}
    	}
    	public populateCodeTable(node:TreeNode){
        	switch(node.getType()){
        		case "BLOCK":
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());
        			break;
        		case "PRINT":
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());
                	this.line = node.getChildren()[0].getLine();
                	this.printCode(node.getChildren()[0]);
        			break;
        		case "ASSIGN":
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());
                	this.line = node.getChildren()[0].getLine();
                	this.assignCode(node);
        			break;
        		case "VARDECL":
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());
                	this.line = node.getChildren()[0].getLine();
                	this.varDeclCode(node);
        			break;
        		case "WHILE":
        			if (_Verbose)
                		_Messenger.putMessage("Generating code for " + node.toString());
                	this.line = node.getChildren()[0].getLine();
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
		                this.setZFlagEquals(node);              //set z-flag the result of an equals operation

		                this.addCell(this.opCode.loadXWithConstant); //load X with 00 to compare against 00
		                this.addCell("00");                     //effectively setting a default of true 

		                this.addCell(this.opCode.branchNotEqual);    //if z-flag is false, we want to return
		                this.addCell("02");                     //the default (true), so branch over false value
		                
		                this.addCell(this.opCode.loadXWithConstant); //load X with 01 to compare against 00 
		                this.addCell("01");                     //effectively setting the z-flag to false on comparison
		                
		                this.addCell(this.opCode.compareByteToX);   //compare the X reg with 00
		                this.addCell(TSC.Utils.toHexStr(this.maxByteSize-1));
		                this.addCell("00");
                	}
        			break;
        		default:
        			break;
        	}
        	for(var i=0; i<node.getChildren().length; i++)
            	this.populateCodeTable(node.getChildren()[i]);
    	}

    	public printCode(node:TreeNode){
    		switch(node.getType()){
    			case "ID":
					var itemInStaticTable = this.getFromStaticTable(node.getValue(), node.scope);
                    this.addCell(this.opCode.loadYFromMemory);
                    this.addCell(itemInStaticTable.temp);
                    this.addCell("XX");
                    this.addCell(this.opCode.loadXWithConstant);
                    this.addCell((itemInStaticTable.type === "string") ? "02":"01");
                    this.addCell(this.opCode.sysCall);
    				break;
    			case "BOOL":
    				this.addCell(this.opCode.loadYWithConstant);
                    this.addCell((node.getValue() === "true") ? "01":"00");
                    this.addCell(this.opCode.loadXWithConstant);
                    this.addCell("01");
                    this.addCell(this.opCode.sysCall);
    				break;
    			case "STRING":
    				var strRef = this.addToHeap(node.getValue());
                    this.addCell(this.opCode.loadYWithConstant);
                    this.addCell(strRef);
                    this.addCell(this.opCode.loadXWithConstant);
                    this.addCell("02");//print the 00-terminated string stored at the address in the Y register.
                    this.addCell(this.opCode.sysCall);
    				break;
    			case "DIGIT":
    				var hex = "0" + node.getValue();
                    this.addCell(this.opCode.loadYWithConstant);
                    this.addCell(hex);
                    this.addCell(this.opCode.loadXWithConstant);
                    this.addCell("01"); //print the integer stored in the Y register
                    this.addCell(this.opCode.sysCall);
    				break;
    			/*	

    			case "ADD":
                    this.populateCodeTable(node); //get result of addition in accumulator
					TODO
					this.addCell(this.getFromStaticTable("temp", new TreeNode("temp")).temp);
					this.addCell("XX");
					this.addCell(this.opCode.loadYFromMemory); //load temp into y reg
					this.addCell(this.getFromStaticTable("temp", new TreeNode("temp")).temp);
					this.addCell("XX");
					this.addCell(this.opCode.loadXWithConstant); //load 01 into x to print non-string
					this.addCell("01");
					this.addCell(this.opCode.sysCall); //sys call to print                    
                    break;
    			case "COMP":
    				//handle as boolean
    				//set default value to false
    				this.addCell(this.opCode.loadAccWithConstant);
    				this.addCell("00");
    				
    				//if false, skip to next instruction
    				this.addCell(opCode.branchNotEqual);
    				this.addCell("02");

    				//if not false, it should reach here and set the value to true
    				this.addCell(opCode.loadAccWithConstant);
    				this.addCell("01");
    				this.addCell(this.opCode.storeAccInMemory); //store accumulator in temp mem


                    this.addCell(this.getFromStaticTable("temp", new TreeNode("temp")).temp);
                    this.addCell("XX");
                    this.addCell(this.opCode.loadYFromMemory); //load temp into y reg
                    this.addCell(this.getFromStaticTable("temp", new TreeNode("temp")).temp);
                    this.addCell("XX");
                    this.addCell(this.opCode.loadXWithConstant); //load 01 into x to print non-string
                    this.addCell("01");
                    this.addCell(this.opCode.sysCall); //sys call to print
 
    				break;*/
    			default:
    				console.log('no match');
    				break;
    		}

    	}
    	public assignCode(node:TreeNode){
    		var id = node.getChildren()[0];
    		var val = node.getChildren()[1];
    		var typeOfAssign = val.getType();
    		var staticEntry = this.getFromStaticTable(id.value,id.scope).temp;
            var type = staticEntry.type;
    		switch(typeOfAssign){
    			case "ID":
    				this.addCell(this.opCode.loadAccFromMemory);
                    this.addCell(this.getFromStaticTable(val.value,val.scope).temp);
                    this.addCell("XX");
    				break;
    			case "DIGIT":
    				this.addCell(TSC.Utils.toHexStr(val.getValue()));
    				break;
    			case "BOOL":
    				this.addCell("0" + ((val.getValue() === "true") ? "1":"0"));
    				break;
    			case "STRING":
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
    		var type = node.getChild(0).getType();
            var val = node.getChild(1);

            if(type === "string") {
                this.addToStaticTable(val.getValue(), val.scope, type, true);
                return;
            }
            this.addCell(this.opCode.loadAccWithConstant);
            this.addCell("00");
            this.addCell(this.opCode.storeAccInMemory);
            this.addCell(this.addToStaticTable(val.getValue(), val.scope, type, false));
            this.addCell("XX");
            
    	}

    	public whileCode(node:TreeNode){
    		var tempJump = this.addToJumpTable(); //create temp jump location
            var startLoc = this.currMemLoc; //grab the location at the beginning of the loop
            
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
            } else
                this.populateCodeTable(node.getChildren()[0]); //do comparison; fill z flag

            this.addCell(this.opCode.branchNotEqual); //if false, branch away from while loop
            this.addCell(tempJump); //the location after the while loop (temp jump location)
            var lastLoc = this.currMemLoc; //save the memory location after the comparison
            this.populateCodeTable(node.getChild(1)); //the code in the while block
            this.addCell(this.opCode.loadXWithConstant); //put a 01 in X reg to make branchNotEqual happen after comparison
            this.addCell("01");
            this.addCell(this.opCode.compareByteToX);
            this.addCell(TSC.Utils.toHexStr(this.maxByteSize-1)); //the last byte, always 00
            this.addCell("00");
            this.addCell(this.opCode.branchNotEqual); //branch back to top of loop
            this.addCell(TSC.Utils.toHexStr((this.maxByteSize-1) - (this.currMemLoc - startLoc))); //jump to top of loop
            this.addToJumpTable(tempJump, TSC.Utils.toHexStr(this.currMemLoc-lastLoc)); //fill in temp jump location with real location
            
    	}
    	public ifCode(node:TreeNode){
    		var tempJump= this.addToJumpTable(); //create a temp jump location

            //in case of 'true' or 'false'
            if(node.getChildren()[0].getType() === "BOOL") {
                var boolVal = node.getChild(0).getValue() === "true";
                this.addCell(this.opCode.loadXWithConstant);
                this.addCell(boolVal ? "00":"01");
                this.addCell(this.opCode.compareByteToX);
                this.addCell(TSC.Utils.toHexStr(this.maxByteSize-1));
                this.addCell("00");
            } else
                this.populateCodeTable(node.getChild(0)); //do the comparison; fill z flag

            this.addCell(this.opCode.branchNotEqual); //if false, branch
            this.addCell(tempJump); //the location after the if statement to branch to (temp jump location)
            var lastLoc = this.currMemLoc; //store our current location in memory
            this.populateCodeTable(node.getChild(1)); //the code in the if statement
            this.addToJumpTable(tempJump,TSC.Utils.toHexStr(this.currMemLoc-lastLoc)); //fill in temp jump location with real location
    	}
    	public recursiveAdd(node:TreeNode) {
	        if(node.getType()!=="ADD" && node.getType()!=="COMP") {
	            if(node.getType() === "ID") { 
	                this.addCell(this.opCode.addWithCarry);
	                this.addCell(this.getFromStaticTable(node.getValue(),node.scope).temp);
	                this.addCell("XX");
	            } else { //if it's a DIGIT
	                //store accumulator in memory
	                this.addCell(this.opCode.storeAccInMemory);
	                this.addCell(this.getFromStaticTable("temp2", -1));
	                this.addCell("XX");
	                //store temp digit in memory (overwrites accumulator)
	                this.addCell(this.opCode.loadAccWithConstant);
	                this.addCell(TSC.Utils.toHexStr(node.getValue()));
	                this.addCell(this.opCode.storeAccInMemory);
	                this.addCell(this.getFromStaticTable("temp", -1));
	                this.addCell("XX");
	                //load back old accumulator
	                this.addCell(this.opCode.loadAccFromMemory);
	                this.addCell(this.getFromStaticTable("temp2", -1));
	                this.addCell("XX");
	                //add stored digit to accumulator
	                this.addCell(this.opCode.addWithCarry);
	                this.addCell(this.getFromStaticTable("temp", -1));
	                this.addCell("XX");
	            }
	        } else { //it's an expr
	            //ADD THE DIGIT FIRST
	            //store accumulator in memory
	            this.addCell(this.opCode.storeAccInMemory);
	            this.addCell(this.getFromStaticTable("temp2", -1));
	            this.addCell("XX");
	            //store temp digit in memory (overwrites accumulator)
	            this.addCell(this.opCode.loadAccWithConstant);
	            this.addCell(TSC.Utils.toHexStr(node.getChild(0).getValue()));
	            this.addCell(this.opCode.storeAccInMemory);
	            this.addCell(this.getFromStaticTable("temp",-1));
	            this.addCell("XX");
	            //load back old accumulator
	            this.addCell(this.opCode.loadAccFromMemory);
	            this.addCell(this.getFromStaticTable("temp2", -1));
	            this.addCell("XX");
	            //add stored digit to accumulator
	            this.addCell(this.opCode.addWithCarry);
	            this.addCell(this.getFromStaticTable("temp", -1));
	            this.addCell("XX");

	            //recurse on the right side bb
	            this.recursiveAdd(node.getChildren[1]);
	        }
	    }
    	public populateStaticTable(){
    		this.currMemLoc+=1;
        	for(var i=0; i< this.staticTable.length; i++) {
	            var item = this.staticTable[i];
	            for(var j=0;j < this.codeTable.length; j++) {
	                if(this.codeTable[j]===item.temp) 
	                    this.codeTable[j] = TSC.Utils.toHexStr(this.currMemLoc);

	                if(this.codeTable[j] === "XX")
	                    this.codeTable[j] = "00";
            	}
	            this.currMemLoc+= 1;
	            if(this.currMemLoc >= this.currHeapLoc) {
	                _Messenger.putError(this.line,"Out of memory. Static area has overflowed into the heap.");
	                this.errors += 1;
	                return;
	            }
	    	}
    	}
    	public fillInJumps() {
	        for(var i=0;i<this.jumpTable.length; i++) {
	            for(var j=0;j< this.codeTable.length; j++)
	                if(this.codeTable[j] === this.jumpTable[i].temp)
	                    this.codeTable[j] = this.jumpTable[i].distance;
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
	                this.addCell(this.getFromStaticTable(arg1.getValue(),arg1.scope).temp);
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
	                this.addCell(this.getFromStaticTable(arg2.getValue(),arg2.scope).temp);
	                this.addCell("XX");
	            }
	            else if(arg1.getType() !== "ID" && arg2.getType() !== "ID") {
	                //we can optimize by comparing the variables right here
	                //we know they are the same type by now
	                //and they are defined prior to runtime explicitly
	                if(arg1.getValue() === arg2.getValue()) {
	                    //since they are equal, let's force true
	                    this.addCell(this.opCode.loadXWithConstant);
	                    this.addCell("00");
	                } else {
	                    this.addCell(this.opCode.loadXWithConstant);
	                    this.addCell("01");
	                }
	                this.addCell(this.opCode.compareByteToX);
	                this.addCell(TSC.Utils.toHexStr(this.maxByteSize-1));
	                this.addCell("00");
	            }
	            else { //two ids
	                this.addCell(this.opCode.loadXFromMemory);
	                this.addCell(this.getFromStaticTable(arg1.getValue(),arg1.scope).temp);
	                this.addCell("XX");
	                this.addCell(this.opCode.compareByteToX);
	                this.addCell(this.getFromStaticTable(arg2.getValue(),arg2.scope).temp);
	                this.addCell("XX");
	            }
	        } 
	        else { //deal with exprs
	            //nested boolean expr check
	            var a1 = node.getChild(0);
	            var a2 = node.getChild(1);
	            if((a1.getType() === "BOOL" || a2.getType() === "BOOL")) {
	                //nested boolean expressions detected
	                //abortMission();
	                return;
	            }
	            //actual code
	            if(arg1==="DIGIT" && arg2==="DIGIT") {
	                //deal with addition
	                //ARG ONE
	                //do addition and store in acc
	                this.populateCodeTable(node.getChild(0));
	                //store that val in temp mem
	                this.addCell(this.opCode.storeAccInMemory);
	                this.addCell(this.getFromStaticTable("temp2", -1).temp);
	                this.addCell("XX");
	                //load that val from temp mem into X reg
	                this.addCell(this.opCode.loadXFromMemory);
	                this.addCell(this.getFromStaticTable("temp2", -1).temp);
	                this.addCell("XX");

	                //ARG2
	                //do addition and store in acc for Arg2
	                this.populateCodeTable(node.getChild(1));
	                //store that in temp mem
	                this.addCell(this.opCode.storeAccInMemory);
	                this.addCell(this.getFromStaticTable("temp2", -1).temp);
	                this.addCell("XX");

	                //compare the two for equality
	                this.addCell(this.opCode.compareByteToX);
	                this.addCell(this.getFromStaticTable("temp2", -1).temp);
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
	                this.addCell(this.getFromStaticTable("temp2", -1).temp);
	                this.addCell("XX");

	                //load value into memory
	                if(value.getType() === "ID") {
	                    this.addCell(this.opCode.loadXFromMemory);
	                    this.addCell(this.getFromStaticTable(value.getValue(),value.scope).temp);
	                    this.addCell("XX");
	                }
	                else {
	                    this.addCell(this.opCode.loadXWithConstant);
	                    this.addCell(TSC.Utils.toHexStr(value.getValue()));
	                }

	                //compare the two for equality
	                this.addCell(this.opCode.compareByteToX);
	                this.addCell(this.getFromStaticTable("temp2", -1).temp);
	                this.addCell("XX");
	            }
	        }
    	}

    

    }

}


