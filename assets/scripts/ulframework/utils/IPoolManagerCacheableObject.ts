/**
 * 缓冲池可缓存对象
 */
export default interface IPoolManagerCaceableObject {

    /**
     * 判断是否加载完毕
     */
    isLoaded(): boolean;
}