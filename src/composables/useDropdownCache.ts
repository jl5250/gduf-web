/**
 * 下拉框数据缓存 composable
 * 支持 localStorage 磁盘缓存 + 懒加载
 *
 * @Author: loong
 * @Date: 2026-06-17
 */
import { ref } from 'vue';

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
 * 带缓存的下拉框数据加载
 * @param cacheKey 缓存键名
 * @param fetcher 数据获取函数
 * @returns { data, loading, load }
 */
export function useDropdownCache<T>(cacheKey: string, fetcher: () => Promise<T>) {
  const data = ref<T | null>(null) as any;
  const loading = ref(false);
  let loaded = false;

  async function load(force = false) {
    if (loaded && !force) return;
    if (loading.value) return;

    // 1. 先查缓存
    const cached = readCache<T>(cacheKey);
    if (cached) {
      data.value = cached;
      loaded = true;
      return;
    }

    // 2. 缓存没有，请求接口（显示 loading）
    loading.value = true;
    try {
      const result = await fetcher();
      data.value = result;
      writeCache(cacheKey, result);
      loaded = true;
    } catch (err) {
      console.error(`[useDropdownCache] ${cacheKey} 加载失败:`, err);
    } finally {
      loading.value = false;
    }
  }

  function invalidate() {
    loaded = false;
    data.value = null;
    localStorage.removeItem(CACHE_PREFIX + cacheKey);
  }

  return { data, loading, load, invalidate };
}
