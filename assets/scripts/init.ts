import mgrCfg from "./game/manager/mgrCfg";
import mgrDirector from "./game/manager/mgrDirector";
import mgrRecord from "./game/manager/mgrRecord";
import mgrPlayer from "./game/manager/mgrPlayer";

import mgrDebug from "./game/manager/mgrDebug";
import mgrNetwork from "./game/manager/mgrNetwork";
import mgrTip from "./game/manager/mgrTip";
import mgrPool from "./game/manager/mgrPool";
import mgrCop from "./game/manager/mgrCop";
import mgrAlu from "./game/manager/mgrAlu";
import mgrSound from "./game/manager/mgrSound";
import mgrWordFilter from "./game/manager/mgrWordFilter";
import mgrGuide from "./game/manager/mgrGuide";

import mgrAd from "./game/manager/mgrAd";
import mgrNative from "./game/manager/mgrNative";
import mgrSdk from "./game/manager/mgrSdk";
import mgrAchievement from "./game/manager/mgrAchievement";
import mgrShop from "./game/manager/mgrShop";
import mgrSign from "./game/manager/mgrSign";
import mgrStage from "./game/manager/mgrStage";
import mgrCake from './game/manager/mgrCake';
import mgrRank from './game/manager/mgrRank';
import mgrRole from "./game/manager/mgrRole";


window["ul"] = {};

// 依次加载所有Manager
mgrCfg.init();
mgrRecord.init();
mgrDirector.init();
mgrPool.init();
mgrTip.init();
mgrWordFilter.init();
mgrCop.init();
mgrAlu.init();
mgrNative.init();
mgrGuide.init();
mgrDebug.init();
mgrPlayer.init();
mgrNetwork.init();
mgrShop.init();
mgrSound.init();
mgrSdk.init();
mgrAd.init();
mgrStage.init();

mgrNetwork.init()
mgrRank.init()
// 单元测试最后添加
// mgrUnitTest.init();

mgrSign.init();

mgrAchievement.init();

mgrCake.init()

mgrRole.init()