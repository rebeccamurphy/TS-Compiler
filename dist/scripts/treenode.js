var TSC;
(function (TSC) {
    var TreeNode = (function () {
        function TreeNode(type, parent, value, line, scope, children) {
            if (children === void 0) { children = []; }
            this.type = type;
            this.parent = parent;
            this.value = value;
            this.line = line;
            this.scope = scope;
            this.children = children;
            //for CST
            this.type = type;
            this.value = (value === undefined) ? '' : value;
            this.parent = parent;
            this.line = (line === undefined) ? _CurrentToken.line : line;
            this.scope = scope;
        }
        TreeNode.prototype.toString = function () {
            var s = (this.scope === -1) ? "" : this.scope;
            return this.type + ", " + this.value + " " + s;
        };
        TreeNode.prototype.tabs = function (n) {
            var str = "";
            for (var i = 0; i < n; i++)
                str += "&nbsp&nbsp";
            return str;
        };
        TreeNode.prototype.equals = function (node) {
            return this.value === node.value && this.parent === node.parent && this.type == node.type;
        };
        TreeNode.prototype.getType = function () {
            return this.type;
        };
        TreeNode.prototype.getValue = function () {
            return this.value;
        };
        TreeNode.prototype.getLine = function () {
            return this.line;
        };
        TreeNode.prototype.setValue = function (val) {
            this.value = val;
        };
        TreeNode.prototype.setParent = function (parent) {
            this.parent = parent;
        };
        TreeNode.prototype.getParent = function () {
            return this.parent;
        };
        TreeNode.prototype.getNextChild = function () {
            for (var i = 0; i < this.parent.children.length - 1; i++)
                if (this === this.parent.children[i])
                    return this.parent.children[i + 1];
        };
        TreeNode.prototype.addChild = function (child, value, scope) {
            //debugger;  
            if (typeof child === "string")
                var ch = new TreeNode(child, this, '', _CurrentToken.line, scope);
            else if (value === undefined)
                var ch = new TreeNode(TokenTypeString[child], this, TokenTypeChar[child], _CurrentToken.line, scope);
            else
                var ch = new TreeNode(TokenTypeString[child], this, value, _CurrentToken.line, scope);
            this.children.push(ch);
            return ch;
        };
        TreeNode.prototype.addChildNode = function (child) {
            child.setParent(this);
            this.children.push(child);
            return child;
        };
        TreeNode.prototype.addChildren = function (node) {
            // ;
            var temp = null;
            if (this.type === "DIGIT" || this.type == "CHARLIST" || this.type == "BOOL" || this.type === "ADD" || this.type === "BOOLOP" || this.type == "ID") {
                if (this.type == "CHARLIST") {
                    var str = TSC.Utils.charsToString(this);
                    temp = (str !== "") ? new TreeNode("STRING", null, str, this.children[0].line, this.scope) : new TreeNode("STRING", null, str, this.line, this.scope);
                }
                else if (this.type === "BOOLOP") {
                    temp = new TreeNode("COMP", null, this.value, this.line, this.scope);
                }
                else {
                    temp = new TreeNode(this.type, null, this.value, this.line, this.scope);
                }
                node.addChildNode(temp);
                node = temp;
            }
            if (node.type !== "STRING") {
                for (var i = 0; i < this.children.length; i++) {
                    if (this.children[i + 1] !== undefined) {
                        if (this.children[i + 1].type === "ADD" || this.children[i + 1].type === "BOOLOP") {
                            this.children[i + 1].addChildren(node);
                            this.children[i].addChildren(node.getNewestChild());
                            this.children[i + 2].addChildren(node.getNewestChild());
                            i += 2;
                        }
                        else
                            this.children[i].addChildren(node);
                    }
                    else
                        this.children[i].addChildren(node);
                }
            }
        };
        TreeNode.prototype.getChildren = function () {
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
        TreeNode.prototype.replace = function (node, replacement) {
            debugger;
            if (this === null || this.parent === null)
                return false;
            for (var i = 0; i < this.children.length; i++)
                if (this.children[i].equals(node)) {
                    this.children[i] = replacement;
                    return true;
                }
            this.parent.replace(node, replacement);
        };
        TreeNode.prototype.setScope = function (scope) {
            debugger;
            var temp = new TreeNode(this.type, this.parent, this.value, this.line, scope);
            this.replace(this, temp);
        };
        TreeNode.prototype.printCST = function (depth, id) {
            if (depth === null)
                depth = 0;
            this.nodeHTML(depth, id);
            for (var i = 0; i < this.children.length; i++)
                this.children[i].printCST(depth + 1, id);
        };
        TreeNode.prototype.makeAST = function (depth, currnode) {
            ////;
            if (depth === -1 && this.type === "BLOCK") {
                _ASTRoot = new TreeNode("BLOCK", null, '', this.line, this.scope);
                currnode = _ASTRoot;
                depth = 0;
            }
            for (var i = 0; i < this.children.length; i++) {
                if (this.type !== "PROGRAM") {
                    //debugger;
                    switch (this.children[i].type) {
                        case 'BLOCK':
                            var temp = new TreeNode("BLOCK", null, '', this.children[i].line, this.children[i].scope);
                            currnode.addChildNode(temp);
                            currnode = temp;
                            this.children[i].makeAST(depth + 1, currnode);
                            break;
                        case 'ASSIGNMENTSTATEMENT':
                            var temp = new TreeNode('ASSIGN', null, '', this.children[i].line, this.children[i].scope);
                            //id
                            //temp.addChildNode(this.children[i].children[0]);
                            this.children[i].addChildren(temp);
                            currnode.addChildNode(temp);
                            break;
                        case 'WHILESTATEMENT':
                        case 'IFSTATEMENT':
                            var str = (this.children[i].type === 'IFSTATEMENT') ? "IF" : "WHILE";
                            var temp = new TreeNode(str, null, '', this.children[i].line, this.children[i].scope);
                            //;
                            if (this.children[i].children[1].children[0].type !== "LPAREN") {
                                //where case with if true/false
                                temp.addChildNode(this.children[i].children[1].children[0]);
                            }
                            else {
                                var comp = new TreeNode('COMP', null, this.children[i].children[1].children[2].getValue(), this.children[i].line, this.children[i].children[1].children[2].scope);
                                //WhileSTATEMENT     /boolexp    //expr      //id                    
                                this.children[i].children[1].children[1].addChildren(comp);
                                this.children[i].children[1].children[3].addChildren(comp);
                                temp.addChildNode(comp);
                            }
                            currnode.addChildNode(temp);
                            //block
                            this.children[i].makeAST(depth + 1, currnode);
                            break;
                        case 'PRINTSTATEMENT':
                            var temp = new TreeNode("PRINT", null, '', this.children[i].line, this.children[i].scope);
                            var type = this.children[i].children[2].children[0]; //int, string, boolean, id
                            this.children[i].addChildren(temp);
                            currnode.addChildNode(temp);
                            break;
                        case 'VARDECL':
                            currnode.addChildNode(this.children[i]);
                            break;
                        default:
                            this.children[i].makeAST(depth, currnode);
                    }
                }
                else
                    this.children[i].makeAST(depth, currnode);
            }
        };
        TreeNode.prototype.printAST = function (depth, id) {
            if (depth === null)
                depth = 0;
            this.nodeHTML(depth, id);
            for (var i = 0; i < this.children.length; i++)
                this.children[i].printAST(depth + 1, id);
        };
        TreeNode.prototype.nodeHTML = function (depth, id) {
            var output = (this.value === '' || this.value === undefined) ? this.type : this.type + ", <b>" + this.value + "</b>";
            document.getElementById(id).innerHTML = document.getElementById(id).innerHTML +
                "<div>" + this.tabs(depth) + output + " " + this.scope + "</div>";
        };
        return TreeNode;
    })();
    TSC.TreeNode = TreeNode;
})(TSC || (TSC = {}));
