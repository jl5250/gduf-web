<template>
  <a-row :gutter="[24, 24]">
    <a-col :xs="12" :sm="12" :md="6">
      <stats-card-item
        title="总请求"
        :value="data?.stats.requests ?? 0"
        icon="SendOutlined"
        color="#1890ff"
      />
    </a-col>
    <a-col :xs="12" :sm="12" :md="6">
      <stats-card-item
        title="成功率"
        :value="successRate"
        icon="CheckCircleOutlined"
        color="#52c41a"
        :precision="1"
        suffix="%"
      />
    </a-col>
    <a-col :xs="12" :sm="12" :md="6">
      <stats-card-item
        title="活跃任务"
        :value="data?.jobs.active ?? 0"
        icon="LoadingOutlined"
        color="#faad14"
      />
    </a-col>
    <a-col :xs="12" :sm="12" :md="6">
      <stats-card-item
        title="OCR 成功率"
        :value="ocrRate"
        icon="ScanOutlined"
        color="#722ed1"
        :precision="1"
        suffix="%"
      />
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
  import StatsCardItem from './StatsCardItem.vue';
  import type { DashboardData } from './useDashboard';

  defineProps<{
    data: DashboardData | null;
    successRate: number;
    ocrRate: number;
  }>();
</script>
