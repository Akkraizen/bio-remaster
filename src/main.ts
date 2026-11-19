import { createApp } from "vue";
import "./style.css";
import "./common/style/style.scss";
import App from "./App.vue";
import router from "@/router";
import { i18n } from "@/i18n";
import { installUiSounds } from "@/utils/uiSounds.ts";
import { installOverlayHotkeys } from "@/hook/useOverlays.ts";
import { installEasterEggs } from "@/utils/easterEggs.ts";
import { installAchievementTracker } from "@/utils/achievementTracker.ts";
import { installVimKeys } from "@/utils/vimKeys.ts";
import { installPwaUpdates } from "@/hook/usePwaUpdate.ts";
import { installAnalytics } from "@/utils/analytics.ts";

const app = createApp(App);
app.use(i18n);
app.use(router);
router.isReady().then(() => app.mount("#app"));

installUiSounds();
installOverlayHotkeys();
installEasterEggs();
installAchievementTracker();
installVimKeys();
installPwaUpdates();
installAnalytics();
