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
        CodeGen.prototype.addtoJumpTable = function (temp, distance) {
            if (temp) {
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
                    break;
                case "VARDECL":
                    if (_Verbose)
                        _Messenger.putMessage("Generating code for " + node.toString());
                    break;
                case "WHILE":
                    if (_Verbose)
                        _Messenger.putMessage("Generating code for " + node.toString());
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
                    break;
                case "STRING":
                    break;
                default:
                    console.log('no match');
                    break;
            }
        };
        CodeGen.prototype.populateStaticTable = function () {
        };
        return CodeGen;
    })();
    TSC.CodeGen = CodeGen;
})(TSC || (TSC = {}));
