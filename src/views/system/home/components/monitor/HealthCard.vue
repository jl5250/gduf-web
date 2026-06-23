<template>
  <default-home-card icon="SecurityScanOutlined" title="爬虫健康度">
    <div class="health-grid">
      <div class="health-item">
        <div class="health-label">指纹状态</div>
        <div class="health-value">
          <a-badge :status="fpColor === 'success' ? 'success' : 'error'" />
          <span :style="{ color: fpColor === 'success' ? '#52c41a' : '#ff4d4f', fontWeight: 500 }">{{ fpText }}</span>
        </div>
      </div>
      <div class="health-item">
        <div class="health-label">平均响应</div>
        <div class="health-value">{{ data?.stats.latency.avg ?? '-' }} <small>ms</small></div>
      </div>
      <div class="health-item">
        <div class="health-label">P95 延迟</div>
        <div class="health-value">{{ data?.stats.latency.p95 ?? '-' }} <small>ms</small></div>
      </div>
      <div class="health-item">
        <div class="health-label">运行时长</div>
        <div class="health-value">{{ formatUptime(data?.system.uptime ?? 0) }}</div>
      </div>
      <div class="health-item">
        <div class="health-label">连接状态</div>
        <div class="health-value">
          <a-badge :status="connected ? 'success' : 'error'" />
          <span>{{ connected ? '在线' : '断开' }}</span>
        </div>
      </div>
    </div>
  </default-home-card>
</template>

<script setup lang="ts">
  import DefaultHomeCard from '/@/views/system/home/components/default-home-card.vue';
  import type { DashboardData } from './useDashboard';

  defineProps<{
    data: DashboardData | null;
    connected: boolean;
    fpText: string;
    fpColor: string;
  }>();

  function formatUptime(seconds: number) {
    if (!seconds) return '-';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d} 天 ${h} 小时`;
    if (h > 0) return `${h} 小时 ${m} 分`;
    return `${m} 分钟`;
  }
</script>

<style scoped lang="less">
  .health-grid {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .health-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    &:last-child { border-bottom: none; }
    .health-label {
      color: rgba(0, 0, 0, 0.5);
      font-size: 13px;
    }
    .health-value {
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      small { font-weight: 400; color: rgba(0, 0, 0, 0.35); }
    }
  }
</style>
