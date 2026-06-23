<template>
  <div class="card-container">
    <a-card size="default" :bordered="false">
      <template #title>
        <div class="card-title">
          <component :is="$antIcons[props.icon]" v-if="props.icon" :style="{ fontSize: '18px', color: token.colorPrimary, marginRight: '8px' }" />
          <slot name="title"></slot>
          <span v-if="!$slots.title">{{ props.title }}</span>
        </div>
      </template>
      <template v-if="props.extra" #extra>
        <slot name="extra"></slot>
        <a v-if="!$slots.extra" @click="extraClick" style="font-size: 13px;">{{ props.extra }}</a>
      </template>
      <div class="card-body-inner">
        <slot></slot>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { theme } from 'ant-design-vue';

  const props = defineProps({
    icon: String,
    title: String,
    extra: String,
  });
  const emit = defineEmits(['extraClick']);

  function extraClick() {
    emit('extraClick');
  }

  const { useToken } = theme;
  const { token } = useToken();
</script>

<style scoped lang="less">
  .card-container {
    height: 100%;
    .ant-card {
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      transition: box-shadow 0.3s;
      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }
    }
    :deep(.ant-card-head) {
      border-bottom: 1px solid #f0f0f0;
      padding: 0 24px;
      min-height: 48px;
    }
    :deep(.ant-card-head-title) {
      padding: 12px 0;
    }
    :deep(.ant-card-body) {
      padding: 20px 24px;
    }
    .card-title {
      display: flex;
      align-items: center;
      font-size: 15px;
      font-weight: 600;
      &::before {
        content: '';
        display: inline-block;
        width: 3px;
        height: 18px;
        background-color: v-bind('token.colorPrimary');
        border-radius: 2px;
        margin-right: 10px;
      }
    }
    .card-body-inner {
      // 子组件内容间距由各自负责
    }
  }
</style>
