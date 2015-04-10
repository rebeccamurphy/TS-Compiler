var TSC;
(function (TSC) {
    var TreeNode = (function () {
        function TreeNode(type, parent, value, children, item) {
            this.type = type;
            this.parent = parent;
            this.value = value;
            this.children = children;
            this.item = item;
            //for CST
            this.type = type;
            this.value = value;
            this.parent = parent;
            this.item = null;
            this.children = (children === undefined) ? [] : children;
            this.chr = [];
        }
        /*
        constructor(private value:any) {
            //for symbol table
            this.value = value;
            this.parent = null;
            this.item = null;
            this.children =[];
            this.chr = [];
        }*/
        TreeNode.prototype.tabs = function (n) {
            var str = "";
            for (var i = 0; i < n; i++)
                str += "&nbsp&nbsp";
            return str;
        };
        TreeNode.prototype.equals = function (node) {
            return this.value === node.value && this.parent === this.parent;
        };
        TreeNode.prototype.getType = function () {
            return this.type;
        };
        TreeNode.prototype.getValue = function () {
            return this.value;
        };
        TreeNode.prototype.setValue = function (val) {
            this.value = val;
        };
        TreeNode.prototype.getItem = function () {
            return this.item;
        };
        TreeNode.prototype.setItem = function (val) {
            this.item = val;
        };
        TreeNode.prototype.setParent = function (parent) {
            this.parent = parent;
        };
        TreeNode.prototype.getParent = function () {
            return this.parent;
        };
        TreeNode.prototype.addChild = function (child, value) {
            //debugger;
            if (typeof child === "string")
                var ch = new TreeNode(child, this, '');
            else if (value === undefined)
                var ch = new TreeNode(TokenTypeString[child], this, TokenTypeChar[child]);
            else
                var ch = new TreeNode(TokenTypeString[child], this, value);
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
        TreeNode.prototype.createRoot = function (rootTreeNode) {
            var tree = new TreeModel();
            var root = tree.parse({
                id: rootTreeNode.value,
                chr: rootTreeNode.chr
            });
        };
        TreeNode.prototype.printCST = function (depth, id) {
            if (depth === null)
                depth = 0;
            this.nodeHTML(depth, id);
            for (var i = 0; i < this.children.length; i++)
                this.children[i].printCST(depth + 1, id);
        };
        TreeNode.prototype.printAST = function (depth, id) {
            debugger;
            if (depth === null)
                depth = 0;
            switch (this.type) {
                case 'BLOCK':
                case 'ASSIGNMENTSTATEMENT':
                case 'VARDECL':
                case 'WHILE':
                case 'IF':
                case 'ID':
                case 'DIGIT':
                case 'CHAR':
                case 'INT':
                case 'STR':
                case 'PRINT':
                case 'BOOLOP':
                case 'VARDECL':
                    this.nodeHTML(depth, id);
            }
            for (var i = 0; i < this.children.length; i++) {
                switch (this.type) {
                    case 'BLOCK':
                    case 'ASSIGNMENTSTATEMENT':
                    case 'VARDECL':
                    case 'WHILE':
                    case 'IF':
                    case 'ID':
                    case 'DIGIT':
                    case 'CHAR':
                    case 'INT':
                    case 'STR':
                    case 'PRINT':
                    case 'BOOLOP':
                    case 'VARDECL':
                        this.children[i].printAST(depth + 1, id);
                        break;
                    default:
                        this.children[i].printAST(depth, id);
                }
            }
        };
        TreeNode.prototype.toString = function () {
            return this.value.toUpperCase();
        };
        TreeNode.prototype.nodeHTML = function (depth, id) {
            var output = (this.value === '' || this.value === undefined) ? this.type : this.type + ", <b>" + this.value + "</b>";
            document.getElementById(id).innerHTML = document.getElementById(id).innerHTML +
                "<div>" + this.tabs(depth) + output + "</div>";
        };
        return TreeNode;
    })();
    TSC.TreeNode = TreeNode;
})(TSC || (TSC = {}));
