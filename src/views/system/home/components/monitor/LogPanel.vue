<template>
  <default-home-card icon="FileTextOutlined" title="运行日志">
    <div class="log-container" ref="logRef">
      <div v-if="!logs.length" class="log-empty">暂无日志</div>
      <div v-for="(log, i) in logs" :key="i" class="log-line" :class="log.level">
        <span class="log-time">{{ formatTime(log.time) }}</span>
        <a-tag :color="tagColor(log.level)" size="small" style="font-size: 11px; line-height: 18px;">{{ log.level }}</a-tag>
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
    max-height: 260px;
    overflow-y: auto;
    font-family: 'SF Mono', 'Consolas', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.8;
    .log-empty {
      text-align: center;
      color: rgba(0, 0, 0, 0.25);
      padding: 32px 0;
      font-family: inherit;
    }
    .log-line {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      margin: 2px 0;
      .log-time { color: rgba(0, 0, 0, 0.3); white-space: nowrap; font-size: 11px; flex-shrink: 0; }
      .log-msg { flex: 1; word-break: break-all; color: rgba(0,0,0,0.75); }
      &.error {
        background: #fff2f0;
        .log-msg { color: #cf1322; }
      }
      &.warn {
        background: #fffbe6;
        .log-msg { color: #d48806; }
      }
      &.info {
        background: #f6ffed;
        .log-msg { color: #389e0d; }
      }
    }
  }
</style>
