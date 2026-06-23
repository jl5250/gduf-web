<template>
  <default-home-card icon="ThunderboltOutlined" title="核心操作">
    <div class="quick-actions-grid">
      <a-row :gutter="[16, 16]">
        <a-col v-for="(action, index) in quickActions" :key="index" :xs="12" :sm="12" :md="6">
          <div class="action-item" @click="navigateTo(action.path)">
            <div class="action-icon-wrap">
              <component :is="$antIcons[action.icon]" class="action-icon" />
            </div>
            <span class="action-label">{{ action.label }}</span>
            <span class="action-desc">{{ action.desc }}</span>
          </div>
        </a-col>
      </a-row>
    </div>
  </default-home-card>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import DefaultHomeCard from '/@/views/system/home/components/default-home-card.vue';

  const router = useRouter();

  interface QuickAction {
    label: string;
    desc: string;
    icon: string;
    path: string;
  }

  const quickActions: QuickAction[] = [
    {
      label: '单点导出成绩',
      desc: '按学号/姓名查询导出',
      icon: 'SearchOutlined',
      path: '/business/grade/export',
    },
    {
      label: '多点导出成绩',
      desc: '按专业/班级批量导出',
      icon: 'BarChartOutlined',
      path: '/business/grade/export',
    },
    {
      label: '绩点计算',
      desc: '成绩绩点统计分析',
      icon: 'CalculatorOutlined',
      path: '/business/grade/gpa',
    },
    {
      label: '专业信息管理',
      desc: '班级与专业数据维护',
      icon: 'DatabaseOutlined',
      path: '/business/grade/major',
    },
  ];

  function navigateTo(path: string) {
    router.push({ path });
  }
</script>

<style scoped lang="less">
  .quick-actions-grid {
    padding: 8px 0;
    .action-item {
      padding: 20px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 8px;
      text-align: center;
      transition: all 0.3s;
      background: #fafafa;
      &:hover {
        background: #f0f5ff;
        transform: translateY(-2px);
      }
      .action-icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: #e6f7ff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        .action-icon {
          font-size: 24px;
          color: #1890ff;
        }
      }
      .action-label {
        font-size: 15px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.85);
        margin-bottom: 4px;
      }
      .action-desc {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.35);
      }
    }
  }
</style>
