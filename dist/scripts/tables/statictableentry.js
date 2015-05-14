var TSC;
(function (TSC) {
    var StaticTableEntry = (function () {
        function StaticTableEntry(temp, id, scope, type, address, strOpt) {
            this.temp = temp;
            this.id = id;
            this.scope = scope;
            this.type = type;
            this.address = address;
            this.strOpt = strOpt;
            this.temp = temp;
            this.id = id;
            this.scope = scope;
            this.offset = _StaticTable.length;
            this.type = type;
            this.address = (address === true);
            this.strOpt = (this.type !== "STR") ? null : "";
        }
        return StaticTableEntry;
    })();
    TSC.StaticTableEntry = StaticTableEntry;
})(TSC || (TSC = {}));
