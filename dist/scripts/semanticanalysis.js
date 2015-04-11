var TSC;
(function (TSC) {
    var SemanticAnalysis = (function () {
        function SemanticAnalysis(rootNode) {
            this.rootNode = rootNode;
            this.rootNode = rootNode;
            this.currScope = -1;
        }
        SemanticAnalysis.prototype.SemanticAnalysis = function (currNode, symbolTable) {
            if (this.currScope === -1) {
                _SymbolTableRoot = new TSC.SymbolTable();
                symbolTable = _SymbolTableRoot;
            }
            else
                this.analysis(currNode, symbolTable);
            for (var i = 0; i < currNode.getChildren().length; i++)
                this.SemanticAnalysis(currNode.getChildren[i], symbolTable);
        };
        SemanticAnalysis.prototype.analysis = function (currNode, symbolTable) {
            switch (currNode.type) {
                case "BLOCK":
                    break;
                case "VARDECL":
                    var valueChild = currNode.getChildren()[1];
                    var typeChild = currNode.getChildren()[0];
                    var varInScope = symbolTable.findValueInScope(valueChild.value);
                    if (varInScope === null) {
                        var temp = new TSC.Node(typeChild.type, valueChild.value, valueChild.line);
                        temp.setDeclared();
                        symbolTable.addNode(temp);
                    }
                    else {
                    }
                    break;
                case "ASSIGN":
                    var valueChild = currNode.getChildren()[1];
                    var typeChild = currNode.getChildren()[0];
                    var varInScope = symbolTable.findValueInScope(valueChild.value);
                    if (varInScope !== null) {
                        //so the variable has been declared...
                        //but does the type match?
                        if ((varInScope.type === "INT" && valueChild.type === "DIGIT") ||
                            (varInScope.type === "STRING" && valueChild.type === "STRING") ||
                            (varInScope.type === "BOOL" && valueChild.type === "BOOL")) {
                            //match!
                            varInScope.setInitialized();
                            symbolTable.replace(varInScope);
                        }
                        else {
                        }
                    }
                    else {
                    }
                    break;
            }
        };
        return SemanticAnalysis;
    })();
    TSC.SemanticAnalysis = SemanticAnalysis;
})(TSC || (TSC = {}));
