<template>
  <default-home-card icon="BarChartOutlined" title="24 小时请求趋势">
    <div class="chart-wrap">
      <div ref="chartRef" class="chart-main"></div>
    </div>
  </default-home-card>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, nextTick } from 'vue';
  import DefaultHomeCard from '/@/views/system/home/components/default-home-card.vue';
  import * as echarts from 'echarts';
  import type { DashboardData } from './useDashboard';

  const props = defineProps<{
    data: DashboardData | null;
  }>();

  const chartRef = ref<HTMLDivElement>();
  let chart: echarts.ECharts | null = null;

  function initChart() {
    if (!chartRef.value) return;
    chart = echarts.init(chartRef.value);
    updateChart();
  }

  function updateChart() {
    if (!chart) return;
    const hourly = props.data?.hourly ?? [];
    const labels = hourly.map(h => {
      const parts = h.label.split(' ');
      return parts[1] || h.label;
    });
    const successes = hourly.map(h => h.success);
    const errors = hourly.map(h => h.errors);

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['成功', '失败'],
        bottom: 0,
        left: 'center',
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 20,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '28%',
        top: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { fontSize: 11, rotate: 45, color: '#999' },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } },
        axisLabel: { fontSize: 11, color: '#999' },
      },
      series: [
        {
          name: '成功',
          type: 'bar',
          stack: 'total',
          barWidth: '50%',
          itemStyle: { color: '#52c41a', borderRadius: [3, 3, 0, 0] },
          data: successes,
        },
        {
          name: '失败',
          type: 'bar',
          stack: 'total',
          barWidth: '50%',
          itemStyle: { color: '#ff4d4f', borderRadius: [3, 3, 0, 0] },
          data: errors,
        },
      ],
    });
  }

  onMounted(() => {
    nextTick(initChart);
  });

  watch(() => props.data, () => {
    nextTick(updateChart);
  }, { deep: true });
</script>

<style scoped lang="less">
  .chart-wrap {
    width: 100%;
    padding: 8px 0;
    .chart-main {
      width: 100%;
      height: 240px;
    }
  }
</style>
