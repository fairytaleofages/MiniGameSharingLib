import Const from "../../Const";
import mgrDirector from "../../manager/mgrDirector";
import Tools from "../../../ulframework/utils/Tools";
import EventTouchEx from "../../../ulframework/utils/EventTouchEx";

const { ccclass, property } = cc._decorator;

/**
 * 单页重用列表, 不想动reuselist的逻辑, 所以新写一个这个
 * 
 */
@ccclass
export default class singlePageReuseList extends cc.Node {
    private layoutType: cc.Layout.Type = null;
    private creator: (cell: cc.Node) => void = null;
    private settor: (cell: cc.Node, data: any) => void = null;
    private destoryer: (cell: cc.Node, data: any) => void = null;

    //
    private root: cc.Node = null;
    private child1: cc.Node = null;
    private child2: cc.Node = null;

    private curIndex: number;
    private lastIndex: number;

    private focusChildIndex: number;
    private unfocusChildIndex: number;

    private defaultActionInterval: number = 0.2;
    private bIsLoop: boolean = true;
    /** 间隔 */
    private space: number = null;

    private datas: any[] = [];

    private moveCallFn = null;

    constructor() {
        super();
        this.buildUi();
    }

    destroy(): boolean {
        super.destroy();
        if (this.destoryer) {
            for (let i = 1; i <= 2; i++) {
                this.destoryer(this["child" + i.toString()], this.datas[i - 1])
            }
        }
        return true;
    }

    /**
     * 设置数据
     */
    public setDatas(datas: any[], noRefresh?: boolean) {
        this.datas = datas;
        if (!noRefresh) {
            this.skipToPage(this.curIndex);
        }
    }

    public getDatas(): any[] {
        return this.datas;
    }

    public setMoveCallFn ( callFn: ( list: singlePageReuseList ) => void ) {
        this.moveCallFn = callFn;
    }

    public setSettor(settor: (cell: cc.Node, data: any) => void): singlePageReuseList {
        this.settor = settor;
        return this;
    }

    public setCreator(creator: (cell: cc.Node) => void): singlePageReuseList {
        this.creator = creator;
        return this;
    }

    public setDestroyer(destoryer: (cell: cc.Node, data: any) => void): singlePageReuseList {
        this.destoryer = destoryer;
        return this;
    }

    public setLayoutType(type: cc.Layout.Type): singlePageReuseList {
        this.layoutType = type;
        return this;
    }

    public setSpace(space: number): singlePageReuseList {
        this.space = space;
        return this;
    }

    public getCurIndex() {
        return this.curIndex;
    }

    public getMaxIndex() {
        return this.datas.length - 1;
    }

    private buildUi() {
        this.root = new cc.Node();
        this.root.setContentSize(576, 1024);
        this.root.parent = this;

        let startPos;

        Tools.registerTouchHandler(this.root, (e) => {
            if (e.name == "began") {
                startPos = e.getLocation();
            }
            else if (e.name == "ended") {
                let curPos = e.getLocation();
                let distance = curPos.x - startPos.x;
                if (distance > 60) {
                    this.moveToLastPage();
                }
                else if (distance < -60) {
                    this.moveToNextPage();
                }
            }
        })

        this.curIndex = 0;
        this.lastIndex = 0;
        this.focusChildIndex = 1;
        this.unfocusChildIndex = 2;
    }

    public moveToNextPage() {
        this.lastIndex = this.curIndex;
        this.curIndex++;
        if (this.curIndex > this.datas.length - 1 && this.bIsLoop == false) {
            this.curIndex = this.datas.length - 1;
        }
        this.moveToCurPage();
    }

    public setCurPage(page: number) {
        this.curIndex = page;
    }

    public moveToLastPage() {
        this.lastIndex = this.curIndex;
        this.curIndex--;
        if (this.curIndex < 0 && this.bIsLoop == false) {
            this.curIndex = 0;
        }
        this.moveToCurPage();
    }

    public moveToPage(pageIndex) {
        this.lastIndex = this.curIndex;
        this.setCurPage(pageIndex);
        this.moveToCurPage();
    }

    public skipToPage(pageIndex) {
        this.setCurPage(pageIndex);
        this.lastIndex = this.curIndex;
        this.moveToCurPage();
    }

    public setLoop(loop: boolean) {
        this.bIsLoop = loop;
    }

    public moveToCurPage() {
        if (!this.space) {
            if (this.layoutType == cc.Layout.Type.HORIZONTAL) {
                this.space = Const.RESOLUTION_RANGE.maxWidth;
            }
            else {
                this.space = Const.RESOLUTION_RANGE.maxHeight;
            }
        }

        if (this.child1 == null) {
            this.child1 = new cc.Node();
            this.child1.parent = this.root;
            this.creator(this.child1);
        }
        if (this.child2 == null) {
            this.child2 = new cc.Node();
            this.child2.parent = this.root;
            this.creator(this.child2);
        }
        let focusCurPosition: cc.Vec2 = new cc.Vec2();
        let unfocusCurPostion: cc.Vec2 = new cc.Vec2();
        let focusTargetPosition: cc.Vec2 = new cc.Vec2();
        let unfocusTargetPostion: cc.Vec2 = new cc.Vec2();

        let focusChild: cc.Node = this["child" + this.focusChildIndex.toString()];
        let unfocusChild: cc.Node = this["child" + this.unfocusChildIndex.toString()];

        // cc.log(this.lastIndex);
        // cc.log(this.curIndex);
        //刚刚创建的时候  或者移动到底部的时候
        if (this.lastIndex == this.curIndex) {
            focusCurPosition.y = 0;
            unfocusCurPostion.y = 0;
            focusTargetPosition.y = 0;
            unfocusTargetPostion.y = 0;

            focusCurPosition.x = 0;
            unfocusCurPostion.x = this.space;

            focusTargetPosition.x = 0;
            unfocusTargetPostion.x = this.space;
            //不需要交换焦点
        }
        else {
            //交换焦点
            let tempIndex = this.focusChildIndex;
            this.focusChildIndex = this.unfocusChildIndex;
            this.unfocusChildIndex = tempIndex;

            if (this.lastIndex < this.curIndex) {
                if (this.layoutType == cc.Layout.Type.HORIZONTAL) {
                    focusCurPosition.y = 0;
                    unfocusCurPostion.y = 0;
                    focusTargetPosition.y = 0;
                    unfocusTargetPostion.y = 0;

                    focusCurPosition.x = this.space;
                    unfocusCurPostion.x = 0;

                    focusTargetPosition.x = 0;
                    unfocusTargetPostion.x = this.space * -1;
                }
                else {
                    focusCurPosition.x = 0;
                    unfocusCurPostion.x = 0;
                    focusTargetPosition.x = 0;
                    unfocusTargetPostion.x = 0;

                    focusCurPosition.y = this.space;
                    unfocusCurPostion.y = 0;

                    focusTargetPosition.y = 0;
                    unfocusTargetPostion.y = this.space * -1;
                }
            }
            else {
                if (this.layoutType == cc.Layout.Type.HORIZONTAL) {
                    focusCurPosition.y = 0;
                    unfocusCurPostion.y = 0;
                    focusTargetPosition.y = 0;
                    unfocusTargetPostion.y = 0;

                    focusCurPosition.x = this.space * -1;
                    unfocusCurPostion.x = 0;

                    focusTargetPosition.x = 0;
                    unfocusTargetPostion.x = this.space;
                }
                else {
                    focusCurPosition.x = 0;
                    unfocusCurPostion.x = 0;
                    focusTargetPosition.x = 0;
                    unfocusTargetPostion.x = 0;

                    focusCurPosition.y = this.space * -1;
                    unfocusCurPostion.y = 0;

                    focusTargetPosition.y = 0;
                    unfocusTargetPostion.y = this.space;
                }
            }
        }

        //

        //设置初始位置
        focusChild.setPosition(focusCurPosition);
        unfocusChild.setPosition(unfocusCurPostion);
        //设置数据
        // let dataCurIndex = (this.curIndex - 1) % this.datas.length;
        let dataCurIndex = (this.curIndex) % this.datas.length;
        if (dataCurIndex < 0) {
            dataCurIndex += this.datas.length;
        }
        // let dataLastIndex = (this.lastIndex - 1) % this.datas.length;
        let dataLastIndex = (this.lastIndex) % this.datas.length;
        if (dataLastIndex < 0) {
            dataLastIndex += this.datas.length;
        }
        this.settor(focusChild, this.datas[dataCurIndex]);
        if (dataCurIndex != dataLastIndex) {
            this.settor(unfocusChild, this.datas[dataLastIndex]);
        }
        //移动
        focusChild.stopAllActions();
        focusChild.runAction(cc.moveTo(this.defaultActionInterval, focusTargetPosition));

        unfocusChild.stopAllActions();
        unfocusChild.runAction(cc.moveTo(this.defaultActionInterval, unfocusTargetPostion));

        if ( !!this.moveCallFn && typeof( this.moveCallFn ) == "function" ) {
            this.moveCallFn( this );
        }
    }

}