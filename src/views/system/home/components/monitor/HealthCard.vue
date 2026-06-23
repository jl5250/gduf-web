<template>
  <default-home-card icon="SecurityScanOutlined" title="爬虫健康度">
    <div class="health-grid">
      <div class="health-row">
        <span class="label">指纹状态</span>
        <a-tag :color="fpColor">{{ fpText }}</a-tag>
      </div>
      <div v-if="data?.fingerprint.lastAlert" class="health-row">
        <span class="label">变更时间</span>
        <span class="value">{{ formatTime(data.fingerprint.lastAlert.timestamp) }}</span>
      </div>
      <div class="health-row">
        <span class="label">平均响应</span>
        <span class="value">{{ data?.stats.latency.avg ?? '-' }} ms</span>
      </div>
      <div class="health-row">
        <span class="label">P95 延迟</span>
        <span class="value">{{ data?.stats.latency.p95 ?? '-' }} ms</span>
      </div>
      <div class="health-row">
        <span class="label">运行时长</span>
        <span class="value">{{ formatUptime(data?.system.uptime ?? 0) }}</span>
      </div>
      <div class="health-row">
        <span class="label">连接状态</span>
        <a-badge :status="connected ? 'success' : 'error'" :text="connected ? '已连接' : '断开'" />
      </div>
    </div>
  </default-home-card>
</template>

<script setup lang="ts">
  import DefaultHomeCard from '/@/views/system/home/components/default-home-card.vue';
  import type { DashboardData } from './useDashboard';

  const props = defineProps<{
    data: DashboardData | null;
    connected: boolean;
    fpText: string;
    fpColor: string;
  }>();

  function formatTime(ts: string | number) {
    if (!ts) return '-';
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function formatUptime(seconds: number) {
    if (!seconds) return '-';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}天${h}小时`;
    if (h > 0) return `${h}小时${m}分`;
    return `${m}分钟`;
  }
</script>

<style scoped lang="less">
  .health-grid {
    padding: 8px 0;
    .health-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;
      &:last-child { border-bottom: none; }
      .label { color: rgba(0, 0, 0, 0.45); font-size: 13px; }
      .value { font-size: 13px; font-weight: 500; }
    }
  }
</style>
