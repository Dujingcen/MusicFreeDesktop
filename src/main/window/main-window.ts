import { localPluginName } from "@/common/constant";
import { BrowserWindow, app, nativeImage } from "electron";
import { getResPath } from "../utils/get-res-path";
import injectGlobalData from "./common/inject-global-data";
import setThumbbarBtns from "../utils/set-thumbbar-btns";
import { currentMusicInfoStore } from "../store/current-music";
import { PlayerState } from "@/renderer/core/track-player/enum";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

/** 主窗口创建 */
let mainWindow: BrowserWindow | null = null;

export const createMainWindow = (): BrowserWindow => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 700,
    width: 1050,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      sandbox: false,
    },
    resizable: false,
    frame: false,
    icon: nativeImage.createFromPath(getResPath("logo.png")),
  });

  // and load the index.html of the app.
  const initUrl = new URL(MAIN_WINDOW_WEBPACK_ENTRY);
  initUrl.hash = `/main/musicsheet/${localPluginName}/favorite`;
  mainWindow.loadURL(initUrl.toString());

  if (!app.isPackaged) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      /** hack headers */
      try {
        const url = new URL(details.url);
        const setHeadersOptions = url.searchParams.get("_setHeaders");
        if (!setHeadersOptions) {
          throw new Error("No Need To Hack");
        }
        const originalRequestHeaders = details.requestHeaders ?? {};
        let requestHeaders: Record<string, string> = {};
        if (setHeadersOptions) {
          const decodedHeaders = JSON.parse(
            decodeURIComponent(setHeadersOptions)
          );
          for (const k in originalRequestHeaders) {
            requestHeaders[k.toLowerCase()] = originalRequestHeaders[k];
          }
          for (const k in decodedHeaders) {
            requestHeaders[k.toLowerCase()] = decodedHeaders[k];
          }
        } else {
          requestHeaders = details.requestHeaders;
        }
        callback({
          requestHeaders,
        });
      } catch {
        callback({
          requestHeaders: details.requestHeaders,
        });
      }
    }
  );

  mainWindow.webContents.on("did-finish-load", () => {
    injectGlobalData(mainWindow);
  });

  setThumbbarBtns(false);

  return mainWindow;
};

export const getMainWindow = () => mainWindow;

export function showMainWindow() {
  if (!mainWindow) {
    return;
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  } else if (mainWindow.isVisible()) {
    mainWindow.focus();
  } else {
    mainWindow.show();
  }
  mainWindow.moveTop();
  mainWindow.setSkipTaskbar(false);
  if (process.platform === "win32") {
    setThumbbarBtns(
      currentMusicInfoStore.getValue().currentPlayerState ===
        PlayerState.Playing
    );
  }
}
