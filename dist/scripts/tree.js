var TSC;
(function (TSC) {
    var Tree = (function () {
        function Tree(str) {
            if (str === void 0) { str = ''; }
            this.str = str;
            this.str = str;
        }
        Tree.prototype.push = function (ch) {
            //adds character to buffer
            this.str += ch;
        };
        Tree.prototype.clear = function () {
            //clears the buffer
            this.str = '';
        };
        Tree.prototype.get = function () {
            //returns the buffer
            return this.str;
        };
        Tree.prototype.isEmpty = function () {
            return this.str === "";
        };
        Tree.prototype.flush = function () {
            //returns and clears the buffer
            var text = this.str;
            this.str = '';
            return text;
        };
        Tree.prototype.pop = function () {
            var temp = this.str.charAt(0);
            this.str = this.str.slice(1);
            return temp;
        };
        return Tree;
    })();
    TSC.Tree = Tree;
})(TSC || (TSC = {}));
