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
            this.children = children;
        }
        SymbolTable.prototype.print = function (ID) {
            this.nodeHTML(ID);
            for (var i = 0; i < this.children.length; i++)
                this.children[i].print(ID);
        };
        SymbolTable.prototype.nodeHTML = function (ID) {
            var str = "";
            for (var i = 0; i < this.nodes.length; i++)
                str += "<tr><td><b>" + this.scope + "</b></td>" + this.nodes[i].toHTML + "</tr>";
            document.getElementById(ID).innerHTML = document.getElementById(ID).innerHTML + str;
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
        SymbolTable.prototype.findValueInScope = function (id) {
            //find closest to recently declared
            for (var i = this.nodes.length - 1; i >= 0; i--) {
                if (id === this.nodes[i]) {
                    return this.nodes[i];
                }
            }
            return null;
        };
        SymbolTable.prototype.findValueInParentScope = function (id) {
            //find closest to recently declared
            for (var i = this.parent.nodes.length - 1; i >= 0; i--) {
                if (id === this.parent.nodes[i]) {
                    return this.parent.nodes[i];
                }
            }
            return null;
        };
        SymbolTable.prototype.replace = function (node) {
            for (var i = 0; i < this.nodes.length; i++)
                if (this.nodes[i].equals(node)) {
                    this.nodes[i] = node;
                    return true;
                }
            return false;
        };
        return SymbolTable;
    })();
    TSC.SymbolTable = SymbolTable;
})(TSC || (TSC = {}));
