
export type TaskSample = (finishCallback:()=>void)=>void
/**
 * 多任务, 并行 与 串行封装
 */
export default class TaskManager{
    /**串行任务列表 */
    private taskList: TaskSample[][] = []
    private executeFinishCallback:()=>void
    constructor(){}

    public push(taskSamples: TaskSample[]){
        if(!taskSamples || taskSamples.length <= 0) return

        this.taskList.push(taskSamples)
    }

    public start(executeFinishCallback: ()=>void){
        this.executeFinishCallback = executeFinishCallback;
        this.__goNext();
    }

    private __goNext(){
        if(this.taskList.length > 0){
            let taskSamples = this.taskList.shift()
            let finishCount = 0
            for (let index = 0; index < taskSamples.length; index++) {
                const taskSample = taskSamples[index];
                taskSample(()=>{
                    finishCount++;
                    if(finishCount == taskSamples.length) this.__goNext()
                })
            }
        }
        else{
            this.executeFinishCallback();
        }
    }
}