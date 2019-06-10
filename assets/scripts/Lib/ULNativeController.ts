// import  * as  ULSdk  from '../ulsdkdemo/ulsdkmiddleware/ulsdkdemomiddleware.js';
import  * as  ULSdk  from '../ulsdk/ulsdkmiddleware/ulsdkmiddleware.js';

export default class ULNativeController {

    public static sendMsgToSdk(jsonStr){
		ULSdk.request(jsonStr);
	}

	public static setGameCallback(func){
		
		ULSdk.setGameCallback(func);
	}

	public static initSdk(){
		ULSdk.initSdk();
	}
}
