import { ref, onUnmounted, computed } from 'vue';

export interface HourlyBucket {
  label: string;
  bucket: string;
  count: number;
  success: number;
  errors: number;
}

export interface RecentJob {
  uuid: string;
  postName: string;
  major: string;
  progress: number;
  updatedAt: number;
}

export interface DashboardData {
  jobs: { active: number; recent: RecentJob[] };
  stats: { requests: number; success: number; errors: number; latency: { avg: number; p50: number; p95: number } };
  system: { session: string; sessionRemaining: number; uptime: number };
  ocr: { success: number; fail: number };
  fingerprint: { enabled: boolean; lastAlert: any };
  logs: { level: string; message: string; time: string }[];
  hourly: HourlyBucket[];
}

export function useDashboard() {
  const data = ref<DashboardData | null>(null);
  const connected = ref(false);
  const error = ref<string | null>(null);
  let es: EventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const successRate = computed(() => {
    if (!data.value) return 0;
    const total = data.value.stats.requests;
    return total > 0 ? (data.value.stats.success / total * 100) : 0;
  });

  const ocrRate = computed(() => {
    if (!data.value) return 0;
    const total = data.value.ocr.success + data.value.ocr.fail;
    return total > 0 ? (data.value.ocr.success / total * 100) : 0;
  });

  const sessionFormatted = computed(() => {
    if (!data.value) return { text: '未知', color: 'default' };
    const s = data.value.system.session;
    if (s === 'active') return { text: '活跃', color: 'success' };
    if (s === 'expired') return { text: '已过期', color: 'error' };
    return { text: '未知', color: 'warning' };
  });

  const fingerprintStatus = computed(() => {
    if (!data.value?.fingerprint.enabled) return { text: '未启用', color: 'default' };
    const alert = data.value.fingerprint.lastAlert;
    if (alert) return { text: '结构变更', color: 'error', detail: alert };
    return { text: '正常', color: 'success' };
  });

  function connect() {
    if (es) return;
    const baseURL = import.meta.env.VITE_APP_GRADE_API_URL || '/grade-service';
    const token = import.meta.env.VITE_APP_DASHBOARD_TOKEN || '';
    const url = token ? `${baseURL}/dashboard/stream?token=${token}` : `${baseURL}/dashboard/stream`;

    es = new EventSource(url);

    es.onopen = () => {
      connected.value = true;
      error.value = null;
    };

    es.onmessage = (event) => {
      try {
        data.value = JSON.parse(event.data);
      } catch (e) {
        console.error('[Dashboard] parse error:', e);
      }
    };

    es.onerror = () => {
      connected.value = false;
      error.value = 'SSE 连接断开，正在重连...';
      scheduleReconnect();
    };
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      disconnect();
      connect();
    }, 5000);
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (es) {
      es.close();
      es = null;
    }
    connected.value = false;
  }

  onUnmounted(disconnect);

  return {
    data,
    connected,
    error,
    successRate,
    ocrRate,
    sessionFormatted,
    fingerprintStatus,
    connect,
    disconnect,
  };
}
