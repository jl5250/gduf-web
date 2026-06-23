<!--
  * 首页 底部系统信息
  *
  * @Author:    计算机学院学生会学习部
  * @Date:      2026-04-26
-->
<template>
    <!-- 系统成就 -->
      <default-home-card icon="TrophyOutlined" title="系统成就">
        <div class="achievements-list">
          <div v-for="(item, index) in achievements" :key="index" class="achievement-row">
            <a-badge status="processing" />
            <div class="achievement-info">
              <span class="achievement-title">{{ item.title }}</span>
              <span class="achievement-desc">{{ item.desc }}</span>
            </div>
          </div>
        </div>
      </default-home-card>
</template>

<script setup lang="ts">
  import DefaultHomeCard from '/@/views/system/home/components/default-home-card.vue';

  const achievements = [
    { title: '系统上线', desc: '2021年正式上线，服务全院师生' },
    { title: '数据处理', desc: '累计处理成绩数据5万+条' },
    { title: '用户覆盖', desc: '每年服务学生2000+人' },
    { title: '持续优化', desc: '系统稳定性达80%以上' },
  ];
</script>

<style scoped lang="less">
  // 成就列表
  .achievements-list {
    .achievement-row {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      &:first-child {
        padding-top: 0;
      }

      .achievement-info {
        display: flex;
        flex-direction: column;
        margin-left: 8px;

        .achievement-title {
          font-size: 14px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.85);
        }

        .achievement-desc {
          font-size: 12px;
          color: #999;
          margin-top: 2px;
        }
      }
    }
  }
</style>
