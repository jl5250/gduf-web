<!--
  * 首页（监控面板版）
  *
  * @Author:    计算机学院学生会学习部
  * @Date:      2026-06-23
  *
  * 移除: 加班统计/销量统计/团队介绍/公众号等无关组件
  * 新增: 爬虫监控面板（SSE 驱动）
-->
<template>
  <div class="dashboard-page">
    <!--  顶部欢迎区 -->
    <a-row :gutter="[24, 24]">
      <a-col :span="24">
        <HomeHeader />
      </a-col>
    </a-row>

    <!--  核心操作入口 -->
    <a-row :gutter="[24, 24]">
      <a-col :span="24">
        <HomeQuickActions />
      </a-col>
    </a-row>

    <!--  今日概览统计 -->
    <a-row :gutter="[24, 24]">
      <a-col :span="24">
        <StatsCards :data="data" :success-rate="successRate" :ocr-rate="ocrRate" />
      </a-col>
    </a-row>

    <!--  主内容区 -->
    <a-row :gutter="[24, 24]">
      <!--  左侧：图表 + 日志 -->
      <a-col :xs="24" :lg="16">
        <a-row :gutter="[24, 24]">
          <!--  爬虫健康度 和 教务系统会话 并列 -->
          <a-col :xs="24" :md="12">
            <HealthCard
              :data="data"
              :connected="connected"
              :fp-text="fingerprintStatus.text"
              :fp-color="fingerprintStatus.color"
            />
          </a-col>
          <a-col :xs="24" :md="12">
            <SessionCard
              :remaining-seconds="data?.system.sessionRemaining ?? 0"
              :session-text="sessionFormatted.text"
              :session-color="sessionFormatted.color"
            />
          </a-col>
          <!--  24h 请求趋势 全宽 -->
          <a-col :span="24">
            <RequestChart :data="data" />
          </a-col>
          <!--  运行日志 全宽 -->
          <a-col :span="24">
            <LogPanel :logs="data?.logs ?? []" />
          </a-col>
        </a-row>
      </a-col>

      <!--  右侧：延时分布 + 最近任务 + 更新日志 -->
      <a-col :xs="24" :lg="8">
        <a-row :gutter="[24, 24]">
          <a-col :span="24">
            <LatencyChart :data="data" />
          </a-col>
          <a-col :span="24">
            <RecentJobs :jobs="data?.jobs.recent ?? []" />
          </a-col>
          <a-col :span="24">
            <ChangelogCard />
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import HomeHeader from './home-header.vue';
  import HomeQuickActions from './components/home-quick-actions.vue';
  import ChangelogCard from './components/changelog-card.vue';
  import StatsCards from './components/monitor/StatsCards.vue';
  import HealthCard from './components/monitor/HealthCard.vue';
  import SessionCard from './components/monitor/SessionCard.vue';
  import RequestChart from './components/monitor/RequestChart.vue';
  import LatencyChart from './components/monitor/LatencyChart.vue';
  import RecentJobs from './components/monitor/RecentJobs.vue';
  import LogPanel from './components/monitor/LogPanel.vue';
  import { useDashboard } from './components/monitor/useDashboard';

  const {
    data,
    connected,
    successRate,
    ocrRate,
    sessionFormatted,
    fingerprintStatus,
    connect,
  } = useDashboard();

  onMounted(() => {
    connect();
  });
</script>

<style lang="less">
  @import './index.less';
</style>
