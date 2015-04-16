var TSC;
(function (TSC) {
    var SemanticAnalysis = (function () {
        function SemanticAnalysis(rootNode, ID) {
            this.rootNode = rootNode;
            this.rootNode = rootNode;
            this.currScope = -1;
            this.ID = ID;
        }
        SemanticAnalysis.prototype.SemanticAnalysis = function (currNode, symbolTable) {
            debugger;
            if (this.currScope === -1) {
                _Messenger.putHeaderMessage("Starting Semantic Analysis...");
                _SymbolTableRoot = new TSC.SymbolTable();
                symbolTable = _SymbolTableRoot;
                if (_Verbose) {
                    _Messenger.putMessage("Creating Symbol Table Root");
                }
            }
            else
                symbolTable = this.analysis(currNode, symbolTable);
            for (var i = 0; i < currNode.getChildren().length; i++) {
                switch (currNode.getChildren()[i].type) {
                    case "BLOCK":
                    case "VARDECL":
                    case "ASSIGN":
                    case "PRINT":
                    case "WHILE":
                    case "IF":
                        this.SemanticAnalysis(currNode.getChildren()[i], symbolTable);
                }
            }
        };
        SemanticAnalysis.prototype.analysis = function (currNode, symbolTable) {
            debugger;
            switch (currNode.type) {
                case "BLOCK":
                    return this.analyzeBLOCK(currNode, symbolTable);
                case "VARDECL":
                    return this.analyzeVARDECL(currNode, symbolTable);
                case "ASSIGN":
                    return this.analyzeASSIGN(currNode, symbolTable);
                case "PRINT":
                    return this.analyzePRINT(currNode, symbolTable);
                case "WHILE":
                case "IF":
                    return this.analyzeIFWHILE(currNode, symbolTable);
            }
            return symbolTable;
        };
        SemanticAnalysis.prototype.analyzeBLOCK = function (currNode, symbolTable) {
            debugger;
            //entering a newscopeso we add a new scope to symbol table
            var tempST = new TSC.SymbolTable();
            //this will probably be ok but apologizes to future me if its not
            tempST.setParent(symbolTable);
            symbolTable.addChild(tempST);
            symbolTable = tempST;
            return symbolTable;
        };
        SemanticAnalysis.prototype.analyzeVARDECL = function (currNode, symbolTable) {
            debugger;
            var valueChild = currNode.getChildren()[1];
            var idChild = currNode.getChildren()[0];
            if (_Verbose)
                _Messenger.putMessage("Checking (" + valueChild.value + ", Line: " + valueChild.line +
                    ") declaration");
            var varInScope = symbolTable.findValueInScope(valueChild.value);
            if (varInScope === null) {
                var temp = new TSC.Node(idChild.type, valueChild.value, idChild.line);
                temp.setDeclared();
                if (_Verbose)
                    _Messenger.putMessage("(" + valueChild.value + ", Line: " + valueChild.line +
                        ") Declared properly");
                symbolTable.addNode(temp);
            }
            else {
                _Messenger.putError(idChild.line, ErrorType.Redeclared);
            }
            return symbolTable;
        };
        SemanticAnalysis.prototype.analyzeIFWHILE = function (currNode, symbolTable) {
            debugger;
            var idChild = currNode.getChildren()[0].getChildren()[0];
            var compChild = currNode.getChildren()[0];
            var valueChild = currNode.getChildren()[0].getChildren()[1];
            if (idChild.type === "ID" && valueChild !== "ID")
                return this.varValueIFWHILE(idChild, valueChild, currNode, symbolTable);
            else if (idChild.type !== "ID" && valueChild === "ID")
                return this.varValueIFWHILE(valueChild, idChild, currNode, symbolTable);
            else if (idChild.type !== "ID" && valueChild !== "ID")
                return this.twoValueIFWHILE(valueChild, idChild, currNode, symbolTable);
            else
                return this.twovarIFWHILE(valueChild, idChild, currNode, symbolTable);
        };
        SemanticAnalysis.prototype.twoValueIFWHILE = function (idChild, valueChild, currNode, symbolTable) {
            if (_Verbose)
                _Messenger.putMessage("Checking Comparison at Line: " + currNode.line);
            if (_Verbose)
                _Messenger.putMessage("Comparing two values.");
            if ((idChild.type === "DIGIT" && valueChild.type === "DIGIT") ||
                (idChild.type === "STRING" && valueChild.type === "STRING") ||
                (idChild.type === "BOOL" && valueChild.type === "BOOL")) {
                //match!
                if (_Verbose)
                    _Messenger.putMessage("(Line: " + idChild.line + ") Type Comparison has matching types.");
            }
            else {
                _Messenger.putError(idChild.line, ErrorType.TypeMismatchComp);
            }
            return symbolTable;
        };
        SemanticAnalysis.prototype.twovarIFWHILE = function (idChild, valueChild, currNode, symbolTable) {
            if (_Verbose)
                _Messenger.putMessage("Checking Comparison at Line: " + currNode.line);
            if (_Verbose)
                _Messenger.putMessage("Comparing two IDs");
            var tempL = this.findVarType(idChild, symbolTable);
            var leftVarType = tempL[0];
            symbolTable = tempL[1];
            var tempR = this.findVarType(valueChild, symbolTable);
            var rightVarType = tempR[0];
            symbolTable = tempR[1];
            if (_Verbose)
                _Messenger.putMessage("Checking Comparison at Line: " + currNode.line);
            if (_Verbose)
                _Messenger.putMessage("Comparing two IDs");
            if (leftVarType === rightVarType) {
                //match!
                if (_Verbose)
                    _Messenger.putMessage("(Line: " + idChild.line + ") Type Comparison has matching types.");
            }
            else if (leftVarType == "" && rightVarType == "") {
                if (_Verbose)
                    _Messenger.putWarning(idChild.line, "Neither variable has been declared so they are uncomparable.");
                _Messenger.putError(idChild.line, ErrorType.TypeMismatchComp);
            }
            else if (leftVarType == "") {
                if (_Verbose)
                    _Messenger.putWarning(idChild.line, idChild.ID + " has not been declared so it is not comparable.");
                _Messenger.putError(idChild.line, ErrorType.TypeMismatchComp);
            }
            else if (rightVarType == "") {
                if (_Verbose)
                    _Messenger.putWarning(valueChild.line, valueChild.ID + " has not been declared so it is not comparable.");
                _Messenger.putErrorv(valueChild.line, ErrorType.TypeMismatchComp);
            }
            return symbolTable;
        };
        SemanticAnalysis.prototype.varValueIFWHILE = function (idChild, valueChild, currNode, symbolTable) {
            var varInScope = symbolTable.findValueInScope(idChild.value);
            var varInParentScope = symbolTable.findValueInParentScope(idChild.value);
            if (_Verbose)
                _Messenger.putMessage("Checking Comparison at Line: " + currNode.line);
            if (_Verbose)
                _Messenger.putMessage("Comparing an ID and value.");
            var temp = this.findVarType(idChild, symbolTable);
            var varType = temp[0];
            symbolTable = temp[1];
            if (varType === valueChild.type) {
                //match!
                if (_Verbose)
                    _Messenger.putMessage("(Line: " + idChild.line + ") Type Comparison has matching types.");
                if (!varInScope.initialized)
                    _Messenger.putWarning(idChild.line, "ID has not been initialized, but used in comparison.");
                //so create a new instance of the variable for the symbol table
                varInScope.setUsed();
                symbolTable.replace(varInScope);
            }
            else {
                _Messenger.putError(idChild.line, ErrorType.TypeMismatchComp);
            }
            return symbolTable;
        };
        SemanticAnalysis.prototype.analyzeASSIGN = function (currNode, symbolTable) {
            var valueChild = currNode.getChildren()[1];
            var idChild = currNode.getChildren()[0];
            //TODO add check for addition in assignment
            if (_Verbose)
                _Messenger.putMessage("Checking assignment at Line: " + idChild.line);
            if (valueChild.value === "+") {
                return this.incASSIGN(currNode, symbolTable);
            }
            else if (valueChild.type === "COMP")
                return this.booleanCompASSIGN(currNode, symbolTable);
            else if (idChild.type === "ID" && valueChild.type === "ID")
                return this.twoIDASSIGN(idChild, valueChild, currNode, symbolTable);
            else
                return this.idValASSIGN(idChild, valueChild, currNode, symbolTable);
        };
        SemanticAnalysis.prototype.booleanCompASSIGN = function (currNode, symbolTable) {
            var temp = this.findVarType(currNode.getChildren()[0], symbolTable, true);
            var idChildType = temp[0];
            var symbolTable = temp[1];
            temp = this.findVarType(currNode.getChildren()[1].getChildren()[0], symbolTable);
            var left = temp[0];
            symbolTable = temp[1];
            temp = this.findVarType(currNode.getChildren()[1].getChildren()[1], symbolTable);
            var right = temp[0];
            symbolTable = temp[1];
            if (left !== right) {
                //put error cannot compare  mismatched type
                //cannot assign mismatched types
                _Messenger.putError(currNode.getChildren()[0].line, ErrorType.TypeMismatchComp);
                _Messenger.putError(currNode.getChildren()[0].line, ErrorType.TypeMismatchAssign);
            }
            else if (idChildType === left && idChildType === right) {
                //assignment matches
                if (_Verbose)
                    _Messenger.putMessage("Assignment Types Match.");
            }
            else {
                //assignment types dont match
                _Messenger.putError(currNode.getChildren()[0].line, ErrorType.TypeMismatchAssign);
            }
            //b ==b
            //b==1
            //1==b
            //1 ==1
        };
        SemanticAnalysis.prototype.incASSIGN = function (currNode, symbolTable) {
            var varAssigned = currNode.getChildren()[0];
            var temp = this.findVarType(varAssigned, symbolTable, true);
            var varAssignedType = temp[0];
            symbolTable = temp[1];
            var left = currNode.getChildren()[1].getChildren()[0];
            var right = currNode.getChildren()[1].getChildren()[1];
            if (right.type === "ID") {
                //EX 1+ i
                var temp2 = this.findVarType(right, symbolTable, right);
                right = temp[0];
                symbolTable = temp[1];
            }
            varAssignedType = (varAssignedType === "INT") ? "DIGIT" : varAssignedType;
            if ((varAssignedType == left.type) && (varAssignedType == right.type)) {
                //EX 1+1
                if (_Verbose)
                    _Messenger.putMessage("(Line:" + varAssigned.line + ") All types in assignment match.");
            }
            else {
                if (_Verbose)
                    _Messenger.putMessage("(Line:" + varAssigned.line + ") Type of variable: " + varAssignedType
                        + " Does not match: " + left.type + " and " + right.type);
                _Messenger.putError(varAssigned.line, ErrorType.TypeMismatchAssign);
            }
            return symbolTable;
        };
        SemanticAnalysis.prototype.idValASSIGN = function (idChild, valueChild, currNode, symbolTable) {
            debugger;
            var temp = this.findVarType(idChild, symbolTable, true);
            var varInScopeType = temp[0];
            symbolTable = temp[1];
            if ((varInScopeType === "INT" && valueChild.type === "DIGIT") ||
                (varInScopeType === "STR" && valueChild.type === "STRING") ||
                (varInScopeType === "BOOL" && valueChild.type === "BOOL")) {
                //match!
                if (_Verbose)
                    _Messenger.putMessage("(" + idChild.value + ", Line: " + idChild.line +
                        ") Type Declaration matches assignment value.");
            }
            else {
                _Messenger.putError(idChild.line, ErrorType.TypeMismatchAssign);
            }
            return symbolTable;
        };
        SemanticAnalysis.prototype.twoIDASSIGN = function (idChild, valueChild, currNode, symbolTable) {
            var tempL = this.findVarType(idChild, symbolTable, true);
            var leftVarType = tempL[0];
            symbolTable = tempL[1];
            var tempR = this.findVarType(valueChild, symbolTable, true);
            var rightVarType = tempR[0];
            symbolTable = tempR[1];
            if (_Verbose)
                _Messenger.putMessage("Assigning one ID to another ID.");
            if (leftVarType === rightVarType) {
                if (_Verbose)
                    _Messenger.putMessage("Assignment types match.");
                if (!idChild.initialized)
                    _Messenger.putWarning(idChild.line, valueChild.ID + " has not been assigned a value. So the assignment is pointless.");
            }
            else {
                _Messenger.putError(idChild.line, ErrorType.TypeMismatchAssign);
            }
            return symbolTable;
        };
        SemanticAnalysis.prototype.analyzePRINT = function (currNode, symbolTable) {
            debugger;
            var idChild = currNode.getChildren()[0];
            if (_Verbose)
                _Messenger.putMessage("Checking (" + idChild.value + ", Line: " + idChild.line +
                    ") print statement");
            symbolTable = this.findVarType(idChild, symbolTable)[1];
            return symbolTable;
        };
        SemanticAnalysis.prototype.findVarType = function (idChild, symbolTable, assign) {
            debugger;
            if (idChild.type !== "ID") {
                return [idChild.type, symbolTable];
            }
            var type = "";
            var varInScope = symbolTable.findValueInScope(idChild.value);
            var varInParentScope = symbolTable.findValueInParentScope(idChild.value);
            if (varInScope !== null) {
                type = varInScope.type;
                if (_Verbose)
                    _Messenger.putMessage("Found " + varInScope.ID + " ID in current scope.");
                if (!varInScope.initialized && !assign)
                    _Messenger.putWarning(idChild.line, varInScope.ID + " has not been initialized, but used in comparison.");
                if (assign)
                    varInScope.setInitialized();
                else
                    varInScope.setUsed();
                symbolTable.replace(varInScope);
            }
            else if (varInParentScope !== null) {
                type = varInParentScope.type;
                if (_Verbose)
                    _Messenger.putMessage("Found " + varInParentScope.ID + " ID in parent scope.");
                if (!varInParentScope.initialized && !assign)
                    _Messenger.putWarning(idChild.line, varInParentScope.ID + " has not been initialized, but used in comparison.");
                if (assign)
                    varInParentScope.setInitialized();
                else
                    varInParentScope.setUsed();
                symbolTable.replace(varInParentScope);
            }
            else {
                _Messenger.putError(idChild.line, ErrorType.Undeclared, idChild.ID);
            }
            return [type, symbolTable];
        };
        return SemanticAnalysis;
    })();
    TSC.SemanticAnalysis = SemanticAnalysis;
})(TSC || (TSC = {}));
