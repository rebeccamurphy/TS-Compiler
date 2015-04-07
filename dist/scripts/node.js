var TSC;
(function (TSC) {
    var Node = (function () {
        function Node(token, parent, children) {
            this.token = token;
            this.parent = parent;
            this.children = children;
            this.token = token;
            this.parent = parent;
            this.children = [];
        }
        Node.prototype.getToken = function () {
            return this.token;
        };
        Node.prototype.setParent = function (parent) {
            this.parent = parent;
        };
        Node.prototype.getParent = function () {
            return this.parent;
        };
        Node.prototype.addChild = function (child) {
            child.setParent(this);
            this.children.push(child);
            return child;
        };
        Node.prototype.getChilden = function () {
            return this.children;
        };
        Node.prototype.getChild = function (token) {
            //token or index don't ask
            if (typeof token === "number")
                return this.children[token];
            else
                for (var i = 0; i < this.children.length; i++) {
                    if (this.children[i].token.equals(token))
                        return this.children[i];
                }
        };
        Node.prototype.toString = function () {
            return this.token.type + ", " + this.token.value;
        };
        return Node;
    })();
    TSC.Node = Node;
})(TSC || (TSC = {}));
