/**
 * 下拉框数据缓存 composable
 * 支持 localStorage 磁盘缓存 + 懒加载
 *
 * @Author: loong
 * @Date: 2026-06-17
 */
import { ref, onScopeDispose, getCurrentScope } from 'vue';

const CACHE_PREFIX = 'gduf_dropdown_';
const CACHE_TTL = 30 * 60 * 1000; // 30 分钟

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * 从 localStorage 读取缓存
 */
function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * 写入 localStorage 缓存
 */
function writeCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage 满了就忽略
  }
}

/**
 * 活实例注册表：按 cacheKey 记录当前已创建的 composable 实例。
 * 供 invalidateDropdownCache 跨组件失效（弹窗组件常驻内存，只删 localStorage 不够）。
 */
const liveInstances = new Map<string, Set<{ invalidate: () => void }>>();

/**
 * 全局失效指定缓存键：删除 localStorage 并重置所有活实例的内存数据，
 * 下次 load() 会重新请求接口。用于班级新增/删除后刷新下拉数据。
 */
export function invalidateDropdownCache(...cacheKeys: string[]): void {
  cacheKeys.forEach((key) => {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch {
      // ignore
    }
    liveInstances.get(key)?.forEach((inst) => inst.invalidate());
  });
}

/**
 * 带缓存的下拉框数据加载
 * @param cacheKey 缓存键名
 * @param fetcher 数据获取函数
 * @returns { data, loading, load }
 */
export function useDropdownCache<T>(cacheKey: string, fetcher: () => Promise<T>) {
  const data = ref<T | null>(null) as any;
  const loading = ref(false);
  let loaded = false;
  // 记录进行中的请求：并发 load() 共享同一个 Promise，避免重复请求、也避免提前返回
  let inflight: Promise<void> | null = null;

  async function load(force = false) {
    if (loaded && !force) return;
    if (inflight) return inflight;

    // 1. 先查缓存
    const cached = readCache<T>(cacheKey);
    if (cached) {
      data.value = cached;
      loaded = true;
      return;
    }

    // 2. 缓存没有，请求接口（显示 loading）
    loading.value = true;
    inflight = (async () => {
      try {
        const result = await fetcher();
        data.value = result;
        writeCache(cacheKey, result);
        loaded = true;
      } catch (err) {
        console.error(`[useDropdownCache] ${cacheKey} 加载失败:`, err);
      } finally {
        loading.value = false;
        inflight = null;
      }
    })();
    return inflight;
  }

  function invalidate() {
    loaded = false;
    data.value = null;
    localStorage.removeItem(CACHE_PREFIX + cacheKey);
  }

  const instance = { data, loading, load, invalidate };

  // 注册到活实例表，供 invalidateDropdownCache 跨组件失效；组件销毁时注销
  if (!liveInstances.has(cacheKey)) liveInstances.set(cacheKey, new Set());
  liveInstances.get(cacheKey)!.add(instance);
  if (getCurrentScope()) {
    onScopeDispose(() => {
      liveInstances.get(cacheKey)?.delete(instance);
    });
  }

  return instance;
}
