module TSC {
	export class StaticTableEntry {
		public offset;
		constructor(public temp, public id:String,public scope:number, public type, public address?:boolean, public strOpt?) {
	            this.temp    =  temp;
	            this.id      =  id;
	            this.scope   = scope;
	            this.offset  = _StaticTable.length;
	            this.type    = type;
	            this.address = (address === true);
	            this.strOpt  = (this.type!=="STR")? null: "";
	        }
		}

	}