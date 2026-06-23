<template>
  <default-home-card icon="FileTextOutlined" title="运行日志">
    <div class="log-container" ref="logRef">
      <div v-if="!logs.length" class="empty">暂无日志</div>
      <div v-for="(log, i) in logs" :key="i" class="log-line" :class="log.level">
        <span class="log-time">{{ formatTime(log.time) }}</span>
        <a-tag :color="tagColor(log.level)" size="small">{{ log.level }}</a-tag>
        <span class="log-msg">{{ log.message }}</span>
      </div>
    </div>
  </default-home-card>
</template>

<script setup lang="ts">
  import DefaultHomeCard from '/@/views/system/home/components/default-home-card.vue';
  import type { DashboardData } from './useDashboard';

  defineProps<{
    logs: DashboardData['logs'];
  }>();

  function formatTime(iso: string) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  function tagColor(level: string) {
    switch (level) {
      case 'error': return 'red';
      case 'warn': return 'orange';
      case 'info': return 'blue';
      default: return 'default';
    }
  }
</script>

<style scoped lang="less">
  .log-container {
    max-height: 280px;
    overflow-y: auto;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.6;
    .empty {
      text-align: center;
      color: rgba(0, 0, 0, 0.25);
      padding: 24px 0;
      font-family: inherit;
    }
    .log-line {
      display: flex;
      align-items: baseline;
      gap: 6px;
      padding: 2px 0;
      border-bottom: 1px solid #fafafa;
      .log-time { color: rgba(0, 0, 0, 0.35); white-space: nowrap; font-size: 11px; }
      .log-msg { flex: 1; word-break: break-all; }
      &.error { background: #fff2f0; margin: 2px -8px; padding: 2px 8px; border-radius: 2px; }
    }
  }
</style>
