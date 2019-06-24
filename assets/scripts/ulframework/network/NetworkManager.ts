import { FSMObject } from '../utils/FSMObject';
import { NetworkTask } from './NetworkTask';
import { NetworkAdapterBase } from './NetworkAdapterBase';


// const { ccclass, property } = cc._decorator;

const ST_STANDBY = 1; 	// 闲置
const ST_REQUEST = 2;	// 请求中
const ST_RESPONSE = 3; 	// 接收中
const ST_FAILD = 4; 		// 错误

const DEBUG = false;

/**
 * 网络管理器
 * 对多个task进行管理
 * 同一时间只有一个task运行
 */
// @ccclass
export class NetworkManager extends FSMObject {
	/** 是否自动执行下一个任务 */
	private bAutoDoNextTask = true;
	/** 当前任务 */
	private currTask: NetworkTask = null;
	/** 任务队列 */
	private tasks: NetworkTask[] = [];
	/** 网络适配器 */
	private adapter: NetworkAdapterBase = null;

	///// 生命周期 /////
	/**
	 * 
	 * @param adapter 网络适配器
	 */
	public constructor(adapter: NetworkAdapterBase) {
		super();

		this.adapter = adapter;
		adapter.setReceiveCallback(this.onReceive.bind(this));
		adapter.setFaildCallback(this.onFaild.bind(this));

		this.registerState(ST_STANDBY, this.onEnterStandby.bind(this), this.onExecuteStandby.bind(this), null);
		this.registerState(ST_REQUEST, this.onEnterRequest.bind(this), this.onExecuteRequest.bind(this), null);
		this.registerState(ST_RESPONSE, this.onEnterResponse.bind(this), this.onExecuteResponse.bind(this), null);
		this.registerState(ST_FAILD, this.onEnterFaild.bind(this), null, null);

		this.setNextState(ST_STANDBY);
	}

	public setAutoDoNextTaskEnabled(value) {
		this.bAutoDoNextTask = value;
	}

	public update(dt: number) {
		super.update(dt);

		this.adapter.update(dt);
	}









	///// 状态 //////
	private onEnterStandby() {
		if (DEBUG) { cc.log("onEnterStandby") };
	}

	private onExecuteStandby() {
		if (DEBUG) { cc.log("onExecuteStandby") };
		let tasks = this.tasks;

		if (tasks.length > 0) {
			let task = tasks[0];
			this.currTask = task;

			this.setNextState(ST_REQUEST);
		}
	}

	private onEnterRequest() {
		if (DEBUG) { cc.log("onEnterRequest") };

		// 将任务中的数据通过adapter发送
		let task = this.currTask;
		task.triggerRequestCallback();
		this.adapter.send(task.getRequestData());
	}

	private onExecuteRequest() {
		// cc.log("onExecuteRequest")
	}

	private onEnterResponse() {
		if (DEBUG) { cc.log("onEnterResponse") };
		let task = this.currTask;
		if (!task) {
			this.setNextState(ST_STANDBY);
			return;
		}

		task.triggerResponseCallback();
	}

	private onExecuteResponse() {
		// 执行下一个任务
		if (this.bAutoDoNextTask) {
			this.doNextTask();
		}
	}

	private onEnterFaild() {
		if (DEBUG) { cc.log("onEnterFaild") }
		let task = this.currTask;
		if (!task) {
			this.setNextState(ST_STANDBY);
			return;
		}

		task.triggerFaildCallback();
	}








	///// 连接相关 ///// 
	private onReceive(responseData: any) {
		// 判断当前状态
		if (this.getState() != ST_REQUEST) {
			cc.log("[warn] NetworkManager.onReceive, state is !ST_REQUEST!");
			return;
		}

		let task = this.currTask;
		if (!task) {
			cc.log("[warn] NetworkManager.onReceive, currTask !found!");
			return;
		}

		task.setResponseData(responseData);
		this.setNextState(ST_RESPONSE);
	}

	private onFaild(faildMsg: string) {
		// 判断当前状态
		if (this.getState() != ST_REQUEST) {
			cc.log("[warn] NetworkManager.onReceive, state is !ST_REQUEST!");
			return;
		}

		let task = this.currTask
		if (!task) {
			cc.log("[warn] NetworkManager.onReceive, currTask !found!");
			return;
		}

		task.setFaildMsg(faildMsg);
		this.setNextState(ST_FAILD);
	}









	///// task相关 ///// 
	/**
	 * 添加任务
	 * @param requestData 请求数据
	 * @param fOnReceive 成功回调
	 * @param fOnFaild 失败回调
	 * @param fOnRequest 开始请求回调
	 * @param bBackgroundEnabled 是否为后台任务
	 */
	public addTask(requestData, fOnReceive, fOnFaild, fOnRequest, bBackgroundEnabled) {
		if (!requestData) {
			cc.log("[warn] NetworkManager.addTask, requestData is null!");
			return;
		}
		
		// 1. 创建task
		let task = new NetworkTask();
		task.setRequestData(requestData);
		task.setOnReceiveCallback(fOnReceive);
		task.setOnFaildCallback(fOnFaild);
		task.setOnRequestCallback(fOnRequest);
		task.setBackgroundEnabled(bBackgroundEnabled);

		this.tasks.push(task);
	}

	/**
	 * 获取当前任务
	 */
	public getCurrentTask(): NetworkTask {
		return this.tasks[0];
	}

	/**
	 * 获取当前任务
	 */
	public getTasks(): NetworkTask[] {
		return this.tasks;
	}

	// 重新尝试当前任务
	public retryCurrentTask() {
		// 判断状态
		if (this.getState() != ST_FAILD) {
			cc.log("[warn] NetworkManager.retryCurrentTask, state is !ST_FAILD, no need to retry!");
			return;
		}

		// 重新进入standby
		this.setNextState(ST_STANDBY);
	}

	/**
	 * 停止所有任务
	 */
	public stopAllTasks() {
		// 1. 清空tasks
		this.tasks = [];
		this.currTask = null;

		// 2. 停止adapter
		this.adapter.disconnect();

		// 3. 切换状态到standby
		this.setNextState(ST_STANDBY);
	}

	/**
		执行下一个任务
	*/
	public doNextTask() {
		if (this.currTask) {
			this.currTask = null;
			this.tasks.shift();

			this.setNextState(ST_STANDBY);
		}
	}

}