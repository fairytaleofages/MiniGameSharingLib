import Manager from "../../ulframework/manager/Manager";
import mgrCfg from "./mgrCfg";
import mgrPlayer from "./mgrPlayer";
import mgrTip from "./mgrTip";
import mgrDirector from "./mgrDirector";
import mgrSdk from "./mgrSdk";
import Const from "../Const";
import mgrAd from "./mgrAd";
import mgrAlu from "./mgrAlu";
import Tools from "../../ulframework/utils/Tools";

const { ccclass } = cc._decorator;

@ccclass
export default class mgrShop extends Manager {




    ///// 生命周期 /////
    protected static onLoad(): void {
        super.onLoad();

        this.registerListeners({
            MSG_SDK_PAY_SUC: this.onMsgSdkPaySuc,
        });
    }

    protected static loadRecord(): void {
        super.loadRecord();
    }

    protected static saveRecord(): void {
        super.saveRecord();
    }


    ///// 数据访问 /////

    /**
     * 获取指定类型下的所有商品
     * @param categorys 
     */
    public static getAllShopItemListByCategory(categorys: number[]): T_SHOP_TEMPLATE_DB[] {
        if (!categorys) return [];

        let hash: { [category: number]: boolean } = {};
        for (let i = 0; i < categorys.length; i++) {
            const category = categorys[i];
            hash[category] = true;
        }

        let arr: T_SHOP_TEMPLATE_DB[] = [];

        mgrCfg.forDb_from_shop_template_db( (k, v) => {
            if (hash[v.category]
                && mgrAlu.check(v.aluId))
                arr.push(v);
        });
        arr = Tools.sortArrayByField(arr, ["-order", "id"]);

        return arr;
    }




    ///// 购买逻辑 /////

    /** 发起购买 */
    public static requestBuy ( shopId: number ) {
        let shopData = mgrCfg.get_from_shop_template_db( shopId );
        if ( !shopData ) { return; }

        let price = shopData.price;
        let priceUnit = shopData.priceUnit;

        // rmb
        if ( priceUnit == 0 ) {
            mgrSdk.openPay( shopData.payId );
            return;
        }


        let itemData = mgrCfg.get_from_item_template_db( priceUnit );
        if ( !itemData ) { return false; }
        // 货币不足
        if ( mgrPlayer.getItemAmount( priceUnit ) < price ) {
            this.tipItemNotEnough( priceUnit );
            this.tryOpenShop( priceUnit );
        } else {
            mgrPlayer.addItemAmount( priceUnit, -price, "购买消耗" );
            this.responseBuy( shopId );
        }

    }

    /** 购买完成 */
    public static responseBuy ( shopId: number ) {
        let shopData = mgrCfg.get_from_shop_template_db( shopId );
        if ( !shopData ) { return; }

        for (let index = 0; index < shopData.items.length; index++) {
            const [itemId, count, bIgnoreGotTip] = shopData.items[index];
            mgrPlayer.addItemAmount(itemId, count, "购买");
            if ( !bIgnoreGotTip ) {
                mgrTip.addGotItemTip(itemId, count, null);
            }
        }

        this.sendMsg("MSG_SHOP_BUY_SUCCESSED", { shopId: shopId });
        mgrSdk.statisOnItemBought( shopId, 1, "购买" );
    }


    /** 通过payid找 shopid */
    public static getShopIdByPayId ( payId: string ) {
        let shopId;
        mgrCfg.forDb_from_shop_template_db( ( key, value )=>{
            if ( value.payId == payId ) {
                shopId = value.id;
                return true;
            }
        } )

        return shopId;
    }


    



    /** 提示物品不足 */
    public static tipItemNotEnough ( itemId: number = Const.ITEM_ID_GOLD ) {
        let itemData = mgrCfg.get_from_item_template_db( itemId );
        if ( !itemData ) { return; }
        mgrTip.showMsgTip( ul.format("[%s]不足", itemData.name) );
    }


    /** 尝试打开免费商城 每个游戏需更改对应逻辑 */
    public static tryOpenShop ( itemId: number = Const.ITEM_ID_GOLD ) {
        let adEventId = "";
        switch (itemId) {
            case Const.ITEM_ID_GOLD: adEventId = "free_gold"; break;
            case Const.ITEM_ID_ENERGY: adEventId = "free_energy"; break;
        }

        let canAd = mgrAd.preCheckCanTriggerAdEventWithoutCd( adEventId );
        let canOpenPay = mgrSdk.isOpenPay();
        if ( canAd || canOpenPay ) {
            mgrDirector.openDialog("vShopDialog");
            return;
        }
    }


    /** 是否可以补给货币 */
    public static canSupplyItem ( itemId: number = Const.ITEM_ID_GOLD ) {
        // 商城目前只有 金币 体力
        if ( (itemId == Const.ITEM_ID_GOLD || itemId == Const.ITEM_ID_ENERGY) && mgrSdk.isOpenPay() ) { 
            return true; 
        }

        // 有免费金币
        if ( itemId == Const.ITEM_ID_GOLD && mgrAd.preCheckCanTriggerAdEventWithoutCd( "free_gold" ) ) {
			return true;
        }

        // 有免费体力
        if ( itemId == Const.ITEM_ID_ENERGY && mgrAd.preCheckCanTriggerAdEventWithoutCd( "free_energy" ) ) {
			return true;
        }
        
        return false;

    }









    /** 计费点购买成功 */
    private static onMsgSdkPaySuc ( e ) {
        let data = e;
        let shopId = this.getShopIdByPayId( data.payId );
        this.responseBuy( shopId );
    }



}