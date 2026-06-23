<template>
  <a-card :bordered="false" class="stats-card-item">
    <a-statistic
      :title="title"
      :value="value"
      :precision="precision"
      :suffix="suffix"
      :value-style="{ color: color, fontWeight: 600 }"
    >
      <template #prefix>
        <component :is="$antIcons[icon]" :style="{ fontSize: '22px', marginRight: '6px' }" />
      </template>
    </a-statistic>
    <div v-if="subtitle" class="stats-subtitle">{{ subtitle }}</div>
  </a-card>
</template>

<script setup lang="ts">
  defineProps<{
    title: string;
    value: number | string;
    icon: string;
    color?: string;
    precision?: number;
    suffix?: string;
    subtitle?: string;
  }>();
</script>

<style scoped lang="less">
  .stats-card-item {
    border-radius: 8px;
    background: #fff;
    text-align: center;
    height: 100%;
    transition: box-shadow 0.3s;
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }
    :deep(.ant-card-body) {
      padding: 24px 16px;
    }
    :deep(.ant-statistic) {
      text-align: center;
    }
    :deep(.ant-statistic-title) {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 12px;
    }
    :deep(.ant-statistic-content) {
      font-size: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .stats-subtitle {
      margin-top: 8px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.3);
    }
  }
</style>
