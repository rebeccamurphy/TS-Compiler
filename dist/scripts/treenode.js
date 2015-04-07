var TSC;
(function (TSC) {
    var Treenode = (function () {
        function Treenode(token, parent, children) {
            this.token = token;
            this.parent = parent;
            this.children = children;
            this.token = token;
            this.parent = parent;
            this.children = [];
        }
        Treenode.prototype.getToken = function () {
            return this.token;
        };
        Treenode.prototype.setParent = function (parent) {
            this.parent = parent;
        };
        Treenode.prototype.getParent = function () {
            return this.parent;
        };
        Treenode.prototype.addChild = function (child) {
            child.setParent(this);
            this.children.push(child);
            return child;
        };
        Treenode.prototype.getChilden = function () {
            return this.children;
        };
        Treenode.prototype.getChild = function (token) {
            //token or index don't ask
            if (typeof token === "number")
                return this.children[token];
            else
                for (var i = 0; i < this.children.length; i++) {
                    if (this.children[i].token.equals(token))
                        return this.children[i];
                }
        };
        Treenode.prototype.toString = function () {
            return this.token.type + ", " + this.token.value;
        };
        return Treenode;
    })();
    TSC.Treenode = Treenode;
})(TSC || (TSC = {}));
