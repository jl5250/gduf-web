<!--
  * 首页
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-09-12 22:34:00
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
  *
-->
<template>
  <!--  顶部欢迎区：系统标题 + 用户信息-->
  <a-row :gutter="[10, 10]">
    <a-col :span="24">
      <HomeHeader />
    </a-col>
  </a-row>

  <!--  核心操作入口（重点前置）-->
  <a-row :gutter="[10, 10]">
    <a-col :span="24">
      <HomeQuickActions />
    </a-col>
  </a-row>

  <!--  主内容区：左右布局 -->
  <a-row :gutter="[10, 10]">
    <!--  左侧：数据图表 + 通知公告 -->
    <a-col :xs="24" :lg="16">
      <a-row :gutter="[10, 10]">
        <!--  通知公告 -->
        <a-col :xs="24" :md="12">
          <HomeNotice title="公告" :noticeTypeId="1" />
        </a-col>
        <a-col :xs="24" :md="12">
          <HomeNotice title="通知" :noticeTypeId="2" />
        </a-col>
        <!--  开发团队  -->
        <a-col :span="24">
          <HomeSystemCard2 />
        </a-col>
        <!--  图表区域 -->
        <a-col :xs="24" :md="12">
          <Pie />
        </a-col>
        <a-col :xs="24" :md="12">
          <Category />
        </a-col>
        <a-col :span="24">
          <Gradient />
        </a-col>
      </a-row>
    </a-col>
    <!--  右侧：快捷入口 + 待办 + 更新日志 -->
    <a-col :xs="24" :lg="8">
      <a-row :gutter="[10, 10]">
        <a-col :span="24">
          <HomeQuickEntry />
        </a-col>
        <a-col :span="24">
          <ToBeDoneCard />
        </a-col>
        <a-col :span="24">
          <HomeSystemCard />
        </a-col>
        <a-col :span="24">
          <ChangelogCard />
        </a-col>
      </a-row>
    </a-col>
  </a-row>
</template>
<script setup lang="ts">
  import HomeHeader from './home-header.vue';
  import HomeQuickActions from './components/home-quick-actions.vue';
  import HomeQuickEntry from './components/quick-entry/home-quick-entry.vue';
  import HomeSystemCard from './components/home-system-card.vue';
  import HomeSystemCard2 from './components/home-system-card2.vue';
  import HomeNotice from './home-notice.vue';
  import ToBeDoneCard from './components/to-be-done-card/home-to-be-done.vue';
  import ChangelogCard from './components/changelog-card.vue';
  import Category from './components/echarts/category.vue';
  import Pie from './components/echarts/pie.vue';
  import Gradient from './components/echarts/gradient.vue';
</script>
<style lang="less" scoped>
  @import './index.less';
</style>
