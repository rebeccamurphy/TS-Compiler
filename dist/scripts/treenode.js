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
            this.chr = [];
        }
        TreeNode.prototype.tabs = function (n) {
            var str = "";
            for (var i = 0; i < n; i++)
                str += "&nbsp&nbsp";
            return str;
        };
        TreeNode.prototype.equals = function (node) {
            return this.value === node.value && this.parent === this.parent;
        };
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
            this.chr.push({ id: child });
            return ch;
        };
        TreeNode.prototype.addChildNode = function (child) {
            child.setParent(this);
            this.children.push(child);
            this.chr.push({ id: child.value });
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
        TreeNode.prototype.createRoot = function (rootTreeNode) {
            var tree = new TreeModel();
            var root = tree.parse({
                id: rootTreeNode.value,
                chr: rootTreeNode.chr
            });
        };
        TreeNode.prototype.displayTree = function (rootNode) {
            debugger;
            var currentNode = rootNode;
            var children = rootNode.children;
            var children2 = [];
            var lastchild = rootNode.children[rootNode.children.length - 1];
            var htmlArray = [];
            var html = "";
            var level = 0;
            htmlArray.push(["<ul><li>" + currentNode.value + "</li>"]);
            for (var i = 0; i < children.length; i++) {
                currentNode = rootNode.children[i];
                children2 = currentNode.children;
                htmlArray[++level] = htmlArray[level] += "<ul><li>" + currentNode.value + "</li><ul>";
                while (children2.length !== 0) {
                    level++;
                    var x = children2.length;
                    for (var j = 0; j < x; j++) {
                        var curr = children2.shift();
                        htmlArray[level] = htmlArray[level] + "<li>" + curr.value + "</li>";
                        children2 = children2.concat(curr.children);
                    }
                    htmlArray[level] = htmlArray[level] + "</ul>";
                }
            }
            for (var b = 0; b < htmlArray.length; b++)
                html += htmlArray[b];
            html += "</ul>";
            document.getElementById("tree").innerHTML = html;
        };
        TreeNode.prototype.printTree = function (depth) {
            if (!depth)
                depth = 0;
            document.getElementById("tree").innerHTML = document.getElementById("tree").innerHTML +
                "<div>" + this.tabs(depth) + this.value + "</div>";
            for (var i = 0; i < this.children.length; i++)
                this.children[i].printTree(depth + 1);
        };
        TreeNode.prototype.toString = function () {
            return this.value.toUpperCase();
        };
        return TreeNode;
    })();
    TSC.TreeNode = TreeNode;
})(TSC || (TSC = {}));
