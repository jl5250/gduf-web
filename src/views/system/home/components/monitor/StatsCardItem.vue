<template>
  <a-card :bordered="false" class="stats-card">
    <a-statistic
      :title="title"
      :value="value"
      :precision="precision"
      :suffix="suffix"
      :value-style="{ color: color }"
    >
      <template #prefix>
        <component :is="$antIcons[icon]" :style="{ fontSize: '20px', marginRight: '4px' }" />
      </template>
    </a-statistic>
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
  }>();
</script>

<style scoped lang="less">
  .stats-card {
    text-align: center;
    border-radius: 6px;
    :deep(.ant-statistic-title) {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
</style>
