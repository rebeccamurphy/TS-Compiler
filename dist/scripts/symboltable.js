var TSC;
(function (TSC) {
    var SymbolTable = (function () {
        function SymbolTable(nodes, parent, scope) {
            this.nodes = nodes;
            this.parent = parent;
            this.scope = scope;
            this.nodes = (nodes === undefined) ? [] : nodes;
            this.parent = (parent === undefined) ? null : parent;
            this.scope = ++_SemanticAnalysis.currScope;
        }
        SymbolTable.prototype.addNode = function (node) {
            this.nodes.push(node);
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
