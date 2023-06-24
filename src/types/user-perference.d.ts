declare namespace IUserPerference {
    interface IType {
        /** 重复模式 */
        repeatMode: string;
        /** 当前进度 */
        currentMusic: IMusic.IMusicItem;
        currentProgress: number;
        currentQuality: IMusic.IQualityKey
        /** 当前音量 */
        volume: number;
        /** 倍速 */
        speed: number
        /** 订阅 */
        subscription: {
            title?: string;
            srcUrl: string;
        }
    }

    interface IDBType {
        /** 当前播放队列 */
        playList: IMusic.IMusicItem[];
    }
}