<!--
  * 首页 底部系统信息
  *
  * @Author:    计算机学院学生会学习部
  * @Date:      2026-04-26
-->
<template>
    <!-- 开发团队 -->
      <default-home-card icon="TeamOutlined" title="开发团队">
        <div class="team-section">
          <div class="dev-item">
            <a-avatar :size="36" style="background-color: #1890ff; flex-shrink: 0">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <div class="dev-info">
              <strong>19届王师兄</strong>
              <span>Excel成绩处理逻辑</span>
            </div>
          </div>
          <div class="dev-item">
            <a-avatar :size="36" style="background-color: #722ed1; flex-shrink: 0">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <div class="dev-info">
              <strong>20届王师兄</strong>
              <span>前端开发与系统集成</span>
            </div>
          </div>
          <a-divider style="margin: 10px 0" />
          <div class="feature-mini-list">
            <div class="feature-mini-item">
              <SafetyCertificateOutlined style="color: #52c41a; font-size: 14px" />
              <span>专业定制：专为计算机学院成绩管理设计</span>
            </div>
            <div class="feature-mini-item">
              <LockOutlined style="color: #1890ff; font-size: 14px" />
              <span>安全可靠：数据加密存储，权限分级管理</span>
            </div>
            <div class="feature-mini-item">
              <FundOutlined style="color: #faad14; font-size: 14px" />
              <span>智能分析：成绩统计分析与可视化展示</span>
            </div>
            <div class="feature-mini-item">
              <MobileOutlined style="color: #eb2f96; font-size: 14px" />
              <span>移动友好：支持多设备访问，响应式设计</span>
            </div>
          </div>
        </div>
      </default-home-card>
</template>

<script setup lang="ts">
  import DefaultHomeCard from '/@/views/system/home/components/default-home-card.vue';
</script>

<style scoped lang="less">
  // 技术栈
  .tech-section {
    .tech-group {
      .tech-group-title {
        font-size: 13px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.65);
        margin: 0 0 6px 0;
      }

      .tech-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }
  }

  // 团队 & 特色
  .team-section {
    .dev-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;

      .dev-info {
        display: flex;
        flex-direction: column;

        strong {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.85);
        }

        span {
          font-size: 12px;
          color: #999;
          margin-top: 2px;
        }
      }
    }

    .feature-mini-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .feature-mini-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #666;
      }
    }
  }
</style>
