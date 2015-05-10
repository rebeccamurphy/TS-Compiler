var TSC;
(function (TSC) {
    var SymbolTable = (function () {
        function SymbolTable(nodes, parent, children, scope) {
            this.nodes = nodes;
            this.parent = parent;
            this.children = children;
            this.scope = scope;
            this.nodes = (nodes === undefined) ? [] : nodes;
            this.parent = (parent === undefined) ? null : parent;
            this.scope = ++_SemanticAnalysis.currScope;
            this.children = (parent === undefined) ? [] : children;
        }
        SymbolTable.prototype.print = function () {
            this.nodeHTML();
            for (var i = 0; i < this.children.length; i++)
                this.children[i].print();
        };
        SymbolTable.prototype.nodeHTML = function () {
            var str = "";
            for (var i = 0; i < this.nodes.length; i++) {
                var parent = (this.parent === null) ? "None" : this.parent.scope;
                str += "<tr><td><b>" + this.scope + "</b></td>" + "<td>" + parent + "</td>" + this.nodes[i].toHTML() + "</tr>";
                //symbol table analysis warnings
                if (this.nodes[i].declared && this.nodes[i].initialized && !this.nodes[i].used)
                    _Messenger.putWarning(this.nodes[i].line, WarningType.UnusedDI);
                else if (this.nodes[i].declared && !this.nodes[i].initialized)
                    _Messenger.putWarning(this.nodes[i].line, WarningType.Unused);
                else if (!this.nodes[i].initialized)
                    _Messenger.putWarning(this.nodes[i].line, WarningType.Uninit);
            }
            document.getElementById(_SemanticAnalysis.ID).innerHTML = document.getElementById(_SemanticAnalysis.ID).innerHTML + str;
        };
        SymbolTable.prototype.toString = function () {
            if (this.parent !== null)
                return "(Scope: " + this.scope + ", Parent: " + this.parent.toString() + ")";
            return "(Scope: " + this.scope + ")";
        };
        SymbolTable.prototype.addNode = function (node) {
            if (_Verbose)
                _Messenger.putMessage("Adding to Scope " + this.scope + ": " + node.toString());
            this.nodes.push(node);
        };
        SymbolTable.prototype.getChildren = function () {
            return this.children;
        };
        SymbolTable.prototype.addChild = function (ST) {
            if (_Verbose)
                _Messenger.putMessage("Creating new scope in Symbol Table: " + ST.toString());
            this.children.push(ST);
        };
        SymbolTable.prototype.setParent = function (parent) {
            this.parent = parent;
        };
        SymbolTable.prototype.getParent = function () {
            return this.parent;
        };
        SymbolTable.prototype.findVarInParent = function (node) {
            debugger;
            if (this.scope === node.scope) {
                if (this.findValueInScope(node.getValue()) === null) {
                    _varInParentScope = null;
                    this.findValueInParentScope(node.getValue());
                }
            }
            else {
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].findVarInParent(node);
                }
            }
        };
        SymbolTable.prototype.findValueInScope = function (id) {
            //find closest to recently declared
            for (var i = this.nodes.length - 1; i >= 0; i--) {
                if (id === this.nodes[i].ID) {
                    return this.nodes[i];
                }
            }
            return null;
        };
        SymbolTable.prototype.findValueInParentScope = function (id) {
            if (this === null || this.parent === null)
                return null;
            //find closest to recently declared
            for (var i = this.parent.nodes.length - 1; i >= 0; i--) {
                if (id === this.parent.nodes[i].ID) {
                    _varInParentScope = (_varInParentScope === null) ? this.parent.nodes[i] : _varInParentScope;
                    _parentScope = this.parent.scope;
                    return this.parent.nodes[i];
                }
            }
            this.parent.findValueInParentScope(id);
        };
        SymbolTable.prototype.replace = function (node) {
            if (this === null || this.parent === null)
                return false;
            for (var i = 0; i < this.nodes.length; i++)
                if (this.nodes[i].equals(node)) {
                    this.nodes[i] = node;
                    return true;
                }
            this.parent.replace(node);
        };
        return SymbolTable;
    })();
    TSC.SymbolTable = SymbolTable;
})(TSC || (TSC = {}));
