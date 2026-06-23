<template>
  <default-home-card icon="BarChartOutlined" title="24小时请求趋势">
    <div class="chart-box">
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
      // Show only hour:min for current day dates
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
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '22%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { fontSize: 10, rotate: 45 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } },
      },
      series: [
        {
          name: '成功',
          type: 'bar',
          stack: 'total',
          barWidth: '60%',
          itemStyle: { color: '#52c41a', borderRadius: [2, 2, 0, 0] },
          data: successes,
        },
        {
          name: '失败',
          type: 'bar',
          stack: 'total',
          barWidth: '60%',
          itemStyle: { color: '#ff4d4f', borderRadius: [2, 2, 0, 0] },
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
  .chart-box {
    width: 100%;
    display: flex;
    justify-content: center;
    .chart-main {
      width: 100%;
      height: 220px;
    }
  }
</style>
