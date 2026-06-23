<!--
  * 首页 核心操作入口
  *
  * @Author:    计算机学院学生会学习部
  * @Date:      2026-04-26
-->
<template>
  <default-home-card icon="ThunderboltOutlined" title="核心操作">
    <div class="quick-actions-grid">
      <a-row>
        <a-col v-for="(action, index) in quickActions" :key="index" :xs="12" :sm="12" :md="6">
          <div class="action-item" @click="navigateTo(action.path)">
            <div class="action-icon">
              <component :is="$antIcons[action.icon]" :style="{ fontSize: '30px' }" />
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
  import { theme } from 'ant-design-vue';

  const router = useRouter();

  const { useToken } = theme;
  const { token } = useToken();

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
    .action-item {
      padding: 10px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 4px;
      text-align: center;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f0ffff;
      }

      .action-icon {
        color: v-bind('token.colorPrimary');
        margin-bottom: 5px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .action-label {
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
        margin-top: 5px;
      }

      .action-desc {
        font-size: 12px;
        color: #999;
      }
    }
  }
</style>
