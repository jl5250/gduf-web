<template>
  <default-home-card icon="OrderedListOutlined" title="最近任务">
    <div class="jobs-list">
      <div v-if="!jobs.length" class="jobs-empty">暂无导出任务</div>
      <div v-for="job in jobs" :key="job.uuid" class="job-card">
        <div class="job-header">
          <span class="job-title">{{ job.major }}</span>
          <span class="job-name">{{ job.postName }}</span>
        </div>
        <a-progress
          :percent="job.progress"
          :stroke-color="job.progress >= 100 ? '#52c41a' : '#1890ff'"
          :stroke-width="8"
          :format="() => job.progress >= 100 ? '已完成' : job.progress + '%'"
        />
      </div>
    </div>
  </default-home-card>
</template>

<script setup lang="ts">
  import DefaultHomeCard from '/@/views/system/home/components/default-home-card.vue';
  import type { RecentJob } from './useDashboard';

  defineProps<{
    jobs: RecentJob[];
  }>();
</script>

<style scoped lang="less">
  .jobs-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 60px;
    .jobs-empty {
      text-align: center;
      color: rgba(0, 0, 0, 0.25);
      padding: 32px 0;
      font-size: 13px;
    }
    .job-card {
      background: #fafafa;
      border-radius: 8px;
      padding: 12px 16px;
      transition: background 0.2s;
      &:hover { background: #f0f5ff; }
      .job-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        .job-title { font-size: 14px; font-weight: 500; color: rgba(0,0,0,0.85); }
        .job-name { font-size: 12px; color: rgba(0, 0, 0, 0.4); }
      }
    }
  }
</style>
