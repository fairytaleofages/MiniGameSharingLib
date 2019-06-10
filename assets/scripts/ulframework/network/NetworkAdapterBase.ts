import Tools from "../utils/Tools";
import Timer from "../utils/Timer";

const { ccclass, property } = cc._decorator;

@ccclass
export class NetworkAdapterBase {
	private fOnFaild: any;
	private fOnReceive: any;

	public constructor() {
		// 预设空状态
	}

	/** 设置接受数据回调 */
	public setReceiveCallback(callback: (responseData: any) => void) {
		this.fOnReceive = callback
		return this
	}

	public setFaildCallback(callback: (faildMsg: string) => void) {
		this.fOnFaild = callback
		return this
	}

	/** 触发接受数据回调 */
	protected triggerReceiveCallback(responseData: any): void {
		if (this.fOnReceive) {
			this.fOnReceive(responseData)
		}
	}

	/** 触发失败回调 */
	protected triggerFaildCallback(faildMsg: string): void {
		if (this.fOnFaild) {
			this.fOnFaild(faildMsg)
		}
	}

	/** 发送数据 */
	public send(requestData: any): void {
		// 测试代码，子类复写后失效
		// 发送，等待几秒后
		Timer.callLater(0.1, (timer)=>{
			if (requestData.cmd == "CMD_1") {
				let responseData = {
					cmd: requestData.cmd,
					info: "response." + requestData.info,
				}
				this.triggerReceiveCallback(responseData);

			} else if (requestData.cmd == "CMD_2") {
				// 50%几率失败
				if (Tools.random(100) < 50) {
					let responseData = {
						cmd: requestData.cmd,
						info: "response." + requestData.info,
					}
					this.triggerReceiveCallback(responseData);
					
				} else {
					this.triggerFaildCallback("random faild");
				}
			}
		});
	}
	
	/** 连接网络 */
	public connect(): void {
	}

	/** 断开网络 */
	public disconnect(): void {
	}

	/** 更新 */
	public update(dt: number): void {
	}
}