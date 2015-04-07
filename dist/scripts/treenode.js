var TSC;
(function (TSC) {
    var TreeNode = (function () {
        function TreeNode(value, parent, children) {
            this.value = value;
            this.parent = parent;
            this.children = children;
            this.value = value;
            this.parent = parent;
            this.children = [];
        }
        TreeNode.prototype.getValue = function () {
            return this.value;
        };
        TreeNode.prototype.setParent = function (parent) {
            this.parent = parent;
        };
        TreeNode.prototype.getParent = function () {
            return this.parent;
        };
        TreeNode.prototype.addChild = function (child) {
            var ch = new TreeNode(child, this);
            this.children.push(ch);
            return ch;
        };
        TreeNode.prototype.addChildNode = function (child) {
            child.setParent(this);
            this.children.push(child);
            return child;
        };
        TreeNode.prototype.getChilden = function () {
            return this.children;
        };
        TreeNode.prototype.getNewestChild = function () {
            return this.children[this.children.length - 1];
        };
        TreeNode.prototype.getChild = function (value) {
            //token or index don't ask
            if (typeof value === "number")
                return this.children[value];
            else
                for (var i = 0; i < this.children.length; i++) {
                    if (this.children[i] === (value))
                        return this.children[i];
                }
        };
        TreeNode.prototype.toString = function () {
            return this.value.toUpperCase();
        };
        return TreeNode;
    })();
    TSC.TreeNode = TreeNode;
})(TSC || (TSC = {}));
