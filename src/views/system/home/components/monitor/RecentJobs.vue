<template>
  <default-home-card icon="OrderedListOutlined" title="最近任务">
    <div class="jobs-list">
      <div v-if="!jobs.length" class="empty">暂无任务</div>
      <div v-for="job in jobs" :key="job.uuid" class="job-item">
        <div class="job-header">
          <span class="job-title">{{ job.major }}</span>
          <span class="job-name">{{ job.postName }}</span>
        </div>
        <div class="job-progress">
          <a-progress
            :percent="job.progress"
            :stroke-color="job.progress >= 100 ? '#52c41a' : '#1890ff'"
            :size="'small'"
            :format="() => job.progress >= 100 ? '完成' : job.progress + '%'"
          />
        </div>
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
    max-height: 280px;
    overflow-y: auto;
    .empty {
      text-align: center;
      color: rgba(0, 0, 0, 0.25);
      padding: 24px 0;
      font-size: 13px;
    }
    .job-item {
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f5;
      &:last-child { border-bottom: none; }
      .job-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        .job-title { font-size: 13px; font-weight: 500; }
        .job-name { font-size: 12px; color: rgba(0, 0, 0, 0.45); }
      }
    }
  }
</style>
