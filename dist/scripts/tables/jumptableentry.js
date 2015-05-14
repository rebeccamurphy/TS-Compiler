var TSC;
(function (TSC) {
    var JumpTableEntry = (function () {
        function JumpTableEntry(temp, distance) {
            this.temp = temp;
            this.distance = distance;
            this.temp = "J" + _JumpTable.entrys.length,
                this.distance = "?";
        }
        return JumpTableEntry;
    })();
    TSC.JumpTableEntry = JumpTableEntry;
})(TSC || (TSC = {}));
