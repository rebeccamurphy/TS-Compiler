var TSC;
(function (TSC) {
    var CodeGen = (function () {
        function CodeGen() {
            this.opCode = {
                loadAccWithConstant: "A9",
                loadAccFromMemory: "AD",
                storeAccInMemory: "8D",
                addWithCarry: "6D",
                loadXWithConstant: "A2",
                loadXFromMemory: "AE",
                loadYWithConstant: "A0",
                loadYFromMemory: "AC",
                sysBreak: "00",
                noOperation: "EA",
                compareByteToX: "EC",
                branchNotEqual: "D0",
                incrementByteVal: "EE",
                sysCall: "FF"
            };
            this.codeTable = [];
            this.staticTable = [];
            this.jumpTable = [];
            this.maxByteSize = 256;
            this.currentMemLocation = 0;
            this.currentHeapLocation = (this.maxByteSize - 1);
            this.tempVarMemRef;
            this.tempVarMemRef2;
            this.depth = 0;
            this.errors = 0;
            this.line = 0;
        }
        CodeGen.prototype.gen = function () {
            _Messenger.putHeaderMessage("<h3>Generating 6502a code...</h3>");
            //initialize codeTable to 0s
            _Messenger.putMessage("Initializing bytes (" + this.maxByteSize + ").");
            for (var i = 0; i < this.maxByteSize; i++)
                this.codeTable.push("00");
            _Messenger.putMessage("Registering temp memory.");
            this.tempVarMemRef = this.addToStaticTable("temp", 0, "int", false);
            this.tempVarMemRef2 = this.addToStaticTable("temp2", 0, "int", false);
            _Messenger.putHeaderMessage("Begin generating code from AST.");
            this.populateCodeTable(_ASTRoot);
            if (this.errors > 0)
                return;
            _Messenger.put("Backpatching temporary variables in static memory.");
            this.populateStaticTable();
            if (this.errors > 0)
                return;
            _Messenger.put("Backpatching temporary jump locations.");
            if (this.errors > 0)
                return;
            //this.fillInJumps();
            //this.fillInGUI();
            return this.codeTable;
        };
        CodeGen.prototype.addToStaticTable = function (varName, scope, type, address) {
            var tempName = "T" + this.staticTable.length;
            _Messenger.putMessage("Adding item " + varName + "@" + scope + " as " + tempName + "XX to static table.");
            this.staticTable.push({
                temp: tempName,
                id: varName,
                scope: scope,
                offset: this.staticTable.length,
                type: type,
                address: address === true
            });
            return tempName;
        };
        CodeGen.prototype.getFromStaticTable = function (id, scope) {
            for (var i = 0; i < this.staticTable.length; i++)
                if (this.staticTable[i].id === id && this.staticTable[i].scope === scope)
                    return this.staticTable[i];
            return null;
        };
        CodeGen.prototype.addToJumpTable = function (temp, distance) {
            if (temp !== undefined) {
                for (var i = 0; i < this.jumpTable.length; i++) {
                    if (this.jumpTable[i].temp === temp)
                        this.jumpTable[i].distance = distance;
                }
            }
            else {
                this.jumpTable.push({
                    temp: "J" + this.jumpTable.length,
                    distance: "?"
                });
                if (_Verbose)
                    _Messenger.putMessage("Adding item " + ("J" + (this.jumpTable.length - 1)) + " to static table.");
                return "J" + (this.jumpTable.length - 1);
            }
        };
        CodeGen.prototype.getFromJumpTable = function (id, scope) {
            for (var i = 0; i < this.jumpTable.length; i++) {
                if (this.jumpTable[i].id === id && this.jumpTable.scope === scope)
                    return this.jumpTable[i];
            }
            return null;
        };
        CodeGen.prototype.addToHeap = function (str) {
            if (_Verbose)
                _Messenger.putMessage("Adding string to heap.");
            //check if string exists in heap
            for (var i = this.currentHeapLocation; i < this.maxByteSize - 1; i++) {
                if (TSC.Utils.toHexStr(str.charCodeAt(0)) === this.codeTable[i]) {
                    var compArr = [];
                    for (var z = i; this.codeTable[z] !== "00"; z++)
                        compArr.push(this.codeTable[z]);
                    if (compArr.length === str.length) {
                        var matches = true;
                        for (var x = 0; x < compArr.length; x++) {
                            if (compArr[x] !== TSC.Utils.toHexStr(str.charCodeAt(x))) {
                                matches = false;
                                break;
                            }
                        }
                        if (matches) {
                            if (_Verbose) {
                                _Messenger.putMessage("String already exists in heap.");
                                _Messenger.putMessage("Returning existing string location: " + TSC.Utils.toHexStr(i));
                            }
                            return TSC.Utils.toHexStr(i);
                        }
                    }
                }
            }
            this.currentHeapLocation -= (str.length + 1) - (this.currentHeapLocation === (this.maxByteSize - 1) ? 1 : 0); //move up in the heap
            //write string to the heap
            for (var i = this.currentHeapLocation; i < this.currentHeapLocation + str.length; i++)
                this.codeTable[i] = TSC.Utils.toHexStr(str.charCodeAt(i - this.currentHeapLocation));
            //add terminating character
            this.codeTable[this.currentHeapLocation + str.length] = "00";
            if (_Verbose)
                _Messenger.putMessage("String added at location: " + TSC.Utils.toHexStr(this.currentHeapLocation));
            return TSC.Utils.toHexStr(this.currentHeapLocation);
        };
        CodeGen.prototype.addCell = function (opC) {
            _Messenger.putMessage("Adding byte: " + opC);
            this.codeTable[this.currentMemLocation++] = opC;
            if (this.currentMemLocation >= this.currentHeapLocation) {
                _Messenger.putError(this.line, "Out of memory. Code area has overflowed into the heap.");
                this.errors += 1;
                return;
            }
        };
        CodeGen.prototype.populateCodeTable = function (node) {
            switch (node.getType()) {
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
                    break;
                case "ADD":
                    if (_Verbose)
                        _Messenger.putMessage("Generating code for " + node.toString());
                    break;
                case "COMP":
                    //== && !=
                    if (_Verbose)
                        _Messenger.putMessage("Generating code for " + node.toString());
                    break;
                default:
                    break;
            }
            for (var i = 0; i < node.getChildren().length; i++)
                this.populateCodeTable(node.getChildren()[i]);
        };
        CodeGen.prototype.printCode = function (node) {
            switch (node.getType()) {
                case "ID":
                    var itemInStaticTable = this.getFromStaticTable(node.getValue(), node.scope);
                    this.addCell(this.opCode.loadYFromMemory);
                    this.addCell(itemInStaticTable.temp);
                    this.addCell("XX");
                    this.addCell(this.opCode.loadXWithConstant);
                    this.addCell((itemInStaticTable.type === "string") ? "02" : "01");
                    this.addCell(this.opCode.sysCall);
                    break;
                case "BOOL":
                    this.addCell(this.opCode.loadYWithConstant);
                    this.addCell((node.getValue() === "true") ? "01" : "00");
                    this.addCell(this.opCode.loadXWithConstant);
                    this.addCell("01");
                    this.addCell(this.opCode.sysCall);
                    break;
                case "STRING":
                    var strRef = this.addToHeap(node.getValue());
                    this.addCell(this.opCode.loadYWithConstant);
                    this.addCell(strRef);
                    this.addCell(this.opCode.loadXWithConstant);
                    this.addCell("02"); //print the 00-terminated string stored at the address in the Y register.
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
        };
        CodeGen.prototype.assignCode = function (node) {
            var id = node.getChildren()[0];
            var val = node.getChildren()[1];
            var typeOfAssign = val.getType();
            var staticEntry = this.getFromStaticTable(id.value, id.scope).temp;
            var type = staticEntry.type;
            switch (typeOfAssign) {
                case "ID":
                    this.addCell(this.opCode.loadAccFromMemory);
                    this.addCell(this.getFromStaticTable(val.value, val.scope).temp);
                    this.addCell("XX");
                    break;
                case "DIGIT":
                    this.addCell(TSC.Utils.toHexStr(val.getValue()));
                    break;
                case "BOOL":
                    this.addCell("0" + ((val.getValue() === "true") ? "1" : "0"));
                    break;
                case "STRING":
                    this.addCell(this.addToHeap(val.getValue()));
                    break;
                default:
                    //expr
                    this.populateCodeTable(val);
                    if (val.getType() === "COMP") {
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
        };
        CodeGen.prototype.varDeclCode = function (node) {
            var type = node.getChild(0).getType();
            var val = node.getChild(1);
            if (type === "string") {
                this.addToStaticTable(val.getValue(), val.scope, type, true);
                return;
            }
            this.addCell(this.opCode.loadAccWithConstant);
            this.addCell("00");
            this.addCell(this.opCode.storeAccInMemory);
            this.addCell(this.addToStaticTable(val.getValue(), val.scope, type, false));
            this.addCell("XX");
        };
        CodeGen.prototype.whileCode = function (node) {
            var tempJump = this.addToJumpTable(); //create temp jump location
            var startLoc = this.currentMemLocation; //grab the location at the beginning of the loop
            //in case of 'true' or 'false'
            if (node.getChildren()[0].getType() === "BOOL") {
                var boolVal = node.getChild(0).getValue() === "true";
                if (boolVal) {
                    _Messenger.putWarning(this.line, "Infinite loop. There's no break in this language, dude.");
                }
                this.addCell(this.opCode.loadXWithConstant);
                this.addCell(boolVal ? "00" : "01");
                this.addCell(this.opCode.compareByteToX);
                this.addCell(TSC.Utils.toHexStr(this.maxByteSize - 1));
                this.addCell("00");
            }
            else
                this.populateCodeTable(node.getChildren()[0]); //do comparison; fill z flag
            this.addCell(this.opCode.branchNotEqual); //if false, branch away from while loop
            this.addCell(tempJump); //the location after the while loop (temp jump location)
            var lastLoc = this.currentMemLocation; //save the memory location after the comparison
            this.populateCodeTable(node.getChild(1)); //the code in the while block
            this.addCell(this.opCode.loadXWithConstant); //put a 01 in X reg to make branchNotEqual happen after comparison
            this.addCell("01");
            this.addCell(this.opCode.compareByteToX);
            this.addCell(TSC.Utils.toHexStr(this.maxByteSize - 1)); //the last byte, always 00
            this.addCell("00");
            this.addCell(this.opCode.branchNotEqual); //branch back to top of loop
            this.addCell(TSC.Utils.toHexStr((this.maxByteSize - 1) - (this.currentMemLocation - startLoc))); //jump to top of loop
            this.addToJumpTable(tempJump, TSC.Utils.toHexStr(this.currentMemLocation - lastLoc)); //fill in temp jump location with real location
        };
        CodeGen.prototype.populateStaticTable = function () {
        };
        return CodeGen;
    })();
    TSC.CodeGen = CodeGen;
})(TSC || (TSC = {}));
