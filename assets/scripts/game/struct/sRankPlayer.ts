const { ccclass, property } = cc._decorator;

@ccclass
export default class sRankPlayer {
    public uid: string;
    public rank: number;
    public score: number;
    public data: string;
    public name: string;

    public constructor(uid: string, rank: number, score: number, name: string, data: string) {
        this.uid = uid;
        this.rank = rank;
        this.score = score;
        this.data = data;
        this.name = name;
    }
}