import mgrCfg from "./game/manager/mgrCfg";
import mgrDirector from "./game/manager/mgrDirector";
import mgrRecord from "./game/manager/mgrRecord";
import mgrPlayer from "./game/manager/mgrPlayer";


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

import mgrShop from "./game/manager/mgrShop";



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
mgrPlayer.init();
mgrNetwork.init();
mgrShop.init();
mgrSound.init();
mgrSdk.init();
mgrAd.init();

mgrNetwork.init()
// 单元测试最后添加
// mgrUnitTest.init();