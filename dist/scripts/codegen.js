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
            this.populateStaticArea();
            if (this.errors > 0)
                return;
            _messenger.put("Backpatching temporary jump locations.");
            if (this.errors > 0)
                return;
            this.fillInJumps();
            this.fillInGUI();
            return codeTable;
        };
        CodeGen.prototype.addToStaticTable = function (varName, scope, type, pointer) {
            var tempName = "T" + this.staticTable.length;
            _Messenger.putMessage("Adding item " + varName + "@" + scope.getText() + " as " + tempName + "XX to static table.");
            this.staticTable.push({
                temp: tempName,
                id: varName,
                scope: scope.getText(),
                offset: this.tempStatics.length,
                type: type,
                pointer: pointer === true
            });
            return tempName;
        };
        CodeGen.prototype.getFromStaticTable = function (id, scope) {
            for (var i = 0; i < this.staticTable.length; i++)
                if (this.staticTable[i].id === id && this.staticsTable[i].scope === this.scope.getText())
                    return tempStatics[i];
            return false;
        };
        CodeGen.prototype.addtoJumpTable = function (temp, jumpAdd) {
        };
        CodeGen.prototype.getFromJumpTable = function () {
        };
        CodeGen.prototype.populateCodeTable = function (node) {
        };
        return CodeGen;
    })();
    TSC.CodeGen = CodeGen;
})(TSC || (TSC = {}));
