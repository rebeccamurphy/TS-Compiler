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
            var valueChild = currNode.getChildren[0].getChildren()[1];
            var varInScope = symbolTable.findValueInScope(idChild.value);
            var varInParentScope = symbolTable.findValueInParentScope(idChild.value);
            if (_Verbose)
                _Messenger.putMessage("Checking Comparison at Line: " + currNode.line);
            if (varInScope !== null) {
                if (_Verbose)
                    _Messenger.putMessage("Variable found in current scope.");
                if ((varInScope.type === "INT" && valueChild.type === "DIGIT") ||
                    (varInScope.type === "STR" && valueChild.type === "STRING") ||
                    (varInScope.type === "BOOL" && valueChild.type === "BOOL")) {
                    //match!
                    if (_Verbose)
                        _Messenger.putMessage("(Line: " + idChild.line + ") Type Comparison has matching types.");
                    if (!varInScope.initialized)
                        _Messenger.putWarning(idChild.line, "ID has not been initialized, but used in comparison.");
                    //so create a new instance of the variable for the symbol table
                    varInScope.setUsed();
                    symbolTable.addNode(varInScope);
                }
                else {
                    _Messenger.putError(idChild.line, ErrorType.TypeMismatchComp);
                }
            }
            else if (varInParentScope !== null) {
                if (_Verbose)
                    _Messenger.putMessage("Variable found in parent scope.");
                if ((varInParentScope.type === "INT" && valueChild.type === "DIGIT") ||
                    (varInParentScope.type === "STR" && valueChild.type === "STRING") ||
                    (varInParentScope.type === "BOOL" && valueChild.type === "BOOL")) {
                    //match!
                    if (_Verbose)
                        _Messenger.putMessage(idChild.line, "Type Comparison has matching types.");
                    if (!varInScope.initialized)
                        _Messenger.putWarning;
                    _Messenger.putWarning(idChild.line, "ID has not been initialized, but used in comparison.");
                    varInScope.setUsed();
                    symbolTable.addNode(varInScope);
                }
                else {
                    _Messenger.putError(valueChild.line, ErrorType.TypeMismatchComp);
                }
            }
            else {
                _Messenger.putError(valueChild.line, ErrorType.Undeclared);
            }
            return symbolTable;
        };
        SemanticAnalysis.prototype.analyzeASSIGN = function (currNode, symbolTable) {
            var valueChild = currNode.getChildren()[1];
            var idChild = currNode.getChildren()[0];
            var varInScope = symbolTable.findValueInScope(idChild.value);
            var varInParentScope = symbolTable.findValueInParentScope(idChild.value);
            if (_Verbose)
                _Messenger.putMessage("Checking (" + idChild.value + ", Line: " + idChild.line +
                    ") assignment");
            if (varInScope !== null) {
                //so the variable has been declared...
                //but does the type match?
                if (_Verbose)
                    _Messenger.putMessage("ID has been declared in current scope.");
                if ((varInScope.type === "INT" && valueChild.type === "DIGIT") ||
                    (varInScope.type === "STR" && valueChild.type === "STRING") ||
                    (varInScope.type === "BOOL" && valueChild.type === "BOOL")) {
                    //match!
                    if (_Verbose)
                        _Messenger.putMessage("(" + idChild.value + ", Line: " + idChild.line +
                            ") Type Declaration matches assignment value.");
                    varInScope.setInitialized();
                    symbolTable.replace(varInScope);
                }
                else {
                    //TODO
                    //type mismatch error!
                    _Messenger.putError(idChild.line, ErrorType.TypeMismatchAssign);
                }
            }
            else if (varInParentScope !== null) {
                //so the variable has been declared in the parent scope...
                //but does the type match?
                if (_Verbose) {
                    _Messenger.putMessage("ID has not been declared in current scope. Checking parent...");
                    _Messenger.putMessage("ID has been declared in parent scope.");
                }
                if ((varInParentScope.type === "INT" && valueChild.type === "DIGIT") ||
                    (varInParentScope.type === "STR" && valueChild.type === "STRING") ||
                    (varInParentScope.type === "BOOL" && valueChild.type === "BOOL")) {
                    //match!
                    if (_Verbose)
                        _Messenger.putMessage("(" + idChild.value + ", Line: " + idChild.line +
                            ") Type Declaration matches assignment value.");
                    //so create a new instance of the variable for the symbol table
                    var tempNode = new TSC.Node(varInParentScope.type, idChild.value, idChild.line);
                    tempNode.setDeclared();
                    tempNode.setInitialized();
                    symbolTable.addNode(tempNode);
                }
            }
            else {
                //TODO
                //ERROR
                //undeclared identifier
                _Messenger.putError(idChild.line, ErrorType.Undeclared);
            }
            return symbolTable;
        };
        SemanticAnalysis.prototype.analyzePRINT = function (currNode, symbolTable) {
            debugger;
            var idChild = currNode.getChildren()[0];
            var varInScope = symbolTable.findValueInScope(idChild.value);
            var varInParentScope = symbolTable.findValueInParentScope(idChild.value);
            if (_Verbose)
                _Messenger.putMessage("Checking (" + idChild.value + ", Line: " + idChild.line +
                    ") print statement");
            if (varInScope !== null) {
                //so the variable has been declared...
                //but does the type match?
                if (_Verbose)
                    _Messenger.putMessage("ID has been declared in current scope.");
                if (varInScope.initialized) {
                    //var has value to print
                    if (_Verbose)
                        _Messenger.putMessage("ID has been initialized in current scope.");
                    varInScope.setUsed();
                    symbolTable.replace(varInScope);
                }
                else {
                    //var has been declared in this scope but not initilized
                    if (_Verbose)
                        _Messenger.putWarning(idChild.line, "ID has not been initialized in current scope.");
                    varInScope.setUsed();
                    symbolTable.replace(varInScope);
                }
            }
            else if (varInParentScope !== null) {
                //so the variable has been declared in the parent scope...
                //but does the type match?
                if (_Verbose) {
                    _Messenger.putMessage("ID has not been declared in current scope. Checking parent...");
                    _Messenger.putMessage("ID has been declared in parent scope.");
                }
                if (varInParentScope.initialized) {
                    //var has value to print
                    if (_Verbose)
                        _Messenger.putMessage("ID has been initialized in parent scope.");
                    varInParentScope.setUsed();
                    symbolTable.replace(varInParentScope);
                }
                else {
                    //var has been declared in this scope but not initilized
                    if (_Verbose)
                        _Messenger.putWarning(idChild.line, "ID has not been initialized in parent scope.");
                    varInParentScope.setUsed();
                    symbolTable.replace(varInParentScope);
                }
            }
            else {
                //TODO
                //ERROR
                //undeclared identifier
                _Messenger.putError(idChild.line, ErrorType.Undeclared);
            }
            return symbolTable;
        };
        return SemanticAnalysis;
    })();
    TSC.SemanticAnalysis = SemanticAnalysis;
})(TSC || (TSC = {}));
