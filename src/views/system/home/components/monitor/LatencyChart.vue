<template>
  <default-home-card icon="PieChartOutlined" title="延时分布">
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
    const s = props.data?.stats;
    const success = s?.success ?? 0;
    const errors = s?.errors ?? 0;

    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 11,
        },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        data: [
          { value: success, name: '成功', itemStyle: { color: '#52c41a' } },
          { value: errors, name: '失败', itemStyle: { color: '#ff4d4f' } },
        ].filter(d => d.value > 0),
      }],
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
