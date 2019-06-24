
const { ccclass, property } = cc._decorator;

@ccclass
export class NetworkTask {
	private fOnRequest: (task: NetworkTask) => void = null;
	private fOnFaild: (task: NetworkTask) => void = null;
	private fOnReceive: (task: NetworkTask) => void = null;

	private faildMsg = "";

	private responseData: any = null;
	private requestData: any = {};

	/**
	 * 后台模式
	 * 后台模式的任务，不会阻碍正常的操作
	 * 当后台模式任务失败的时候，停止所有任务
	 */
	private bBackgroundEnabled: any;


	public constructor() {
	}

	/** 设置是否开启后台模式 */
	public setBackgroundEnabled(value: boolean): NetworkTask {
		this.bBackgroundEnabled = value;
		return this;
	}

	/** 是否开启后台模式 */
	public isBackgroundEnabled(): boolean {
		return this.bBackgroundEnabled;
	}

	/** 设置请求数据 */
	public setRequestData(value: any): NetworkTask {
		this.requestData = value;
		return this;
	}

	/** 返回请求数据 */
	public getRequestData(): any {
		return this.requestData;
	}

	/** 设置响应数据 */
	public setResponseData(value: any): NetworkTask {
		this.responseData = value;
		return this;
	}

	/** 返回相应数据 */
	public getResponseData() {
		return this.responseData;
	}

	/** 设置失败消息 */
	public setFaildMsg(value): NetworkTask {
		this.faildMsg = value;
		return this;
	}

	/** 返回失败消息 */
	public getFaildMsg(): string {
		return this.faildMsg;
	}

	/** 设置请求回调 */
	public setOnRequestCallback(value: (task: NetworkTask) => void): NetworkTask {
		this.fOnRequest = value
		return this
	}

	/** 设置接收数据回调 */
	public setOnReceiveCallback(value: (task: NetworkTask) => void): NetworkTask {
		this.fOnReceive = value
		return this
	}

	/** 设置失败回调 */
	public setOnFaildCallback(value: (task: NetworkTask) => void): NetworkTask {
		this.fOnFaild = value
		return this
	}

	/** 设置请求回调 */
	public triggerRequestCallback(): void {
		if (this.fOnRequest) {
			this.fOnRequest(this)
		}
	}

	/** 触发响应回调 */
	public triggerResponseCallback(): void {
		if (this.fOnReceive) {
			this.fOnReceive(this)
		}
	}

	/** 触发失败回调 */
	public triggerFaildCallback(): void {
		if (this.fOnFaild) {
			this.fOnFaild(this)
		}
	}
}