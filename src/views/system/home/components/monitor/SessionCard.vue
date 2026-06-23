<template>
  <default-home-card icon="ClockCircleOutlined" title="教务系统会话">
    <div class="session-content">
      <a-progress
        type="dashboard"
        :percent="sessionPercent"
        :stroke-color="sessionColor"
        :width="140"
        :format="() => remainingText"
      />
      <div class="session-status">
        <a-tag :color="tagColor" style="font-size: 13px; padding: 2px 12px;">{{ tagText }}</a-tag>
      </div>
      <div class="session-hint">
        超时后爬虫将自动重新登录
      </div>
    </div>
  </default-home-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import DefaultHomeCard from '/@/views/system/home/components/default-home-card.vue';

  const props = defineProps<{
    remainingSeconds: number;
    sessionText: string;
    sessionColor: string;
  }>();

  const MAX_SESSION = 14400; // 4h 用于进度环展示

  const sessionPercent = computed(() => {
    if (props.remainingSeconds <= 0) return 0;
    return Math.min(100, (props.remainingSeconds / MAX_SESSION) * 100);
  });

  const remainingText = computed(() => {
    if (props.remainingSeconds <= 0) return '已过期';
    const h = Math.floor(props.remainingSeconds / 3600);
    const m = Math.floor((props.remainingSeconds % 3600) / 60);
    const s = props.remainingSeconds % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  });

  const tagText = computed(() => {
    if (props.remainingSeconds > 3600) return '活跃';
    if (props.remainingSeconds > 600) return '即将过期';
    if (props.remainingSeconds > 0) return '即将过期';
    return '已过期';
  });

  const tagColor = computed(() => {
    if (props.remainingSeconds > 3600) return 'success';
    if (props.remainingSeconds > 600) return 'warning';
    return 'error';
  });

  const sessionColor = computed(() => {
    if (props.remainingSeconds > 3600) return '#52c41a';
    if (props.remainingSeconds > 600) return '#faad14';
    return '#ff4d4f';
  });
</script>

<style scoped lang="less">
  .session-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0 12px;
    gap: 16px;
    .session-status {
      margin-top: 4px;
    }
    .session-hint {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.3);
    }
  }
</style>
