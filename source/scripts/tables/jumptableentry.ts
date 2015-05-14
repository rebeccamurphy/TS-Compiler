module TSC {
	export class JumpTableEntry {
		constructor(public temp?, public distance?) {
            	this.temp      = "J"+ _JumpTable.entrys.length,
            	this.distance = "?";
		}
		
	}
}