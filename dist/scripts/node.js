var TSC;
(function (TSC) {
    var Node = (function () {
        function Node(type, ID, line, declared, initialized, used) {
            this.type = type;
            this.ID = ID;
            this.line = line;
            this.declared = declared;
            this.initialized = initialized;
            this.used = used;
            this.type = type;
            this.ID = ID;
            this.line = line;
            this.declared = false;
            this.initialized = false;
            this.used = false;
        }
        Node.prototype.setDeclared = function () {
            this.declared = true;
        };
        Node.prototype.setInitialized = function () {
            this.initialized = true;
        };
        Node.prototype.setUsed = function () {
            this.used = true;
        };
        Node.prototype.equals = function (node) {
            return this.type === node.type && this.ID === node.ID;
            /*return this.type === node.type && this.ID === node.ID && this.line ===node.line &&
                this.declared===node.declared &&this.initialized === node.initialized &&
                this.used === node.used;*/
        };
        return Node;
    })();
    TSC.Node = Node;
})(TSC || (TSC = {}));
