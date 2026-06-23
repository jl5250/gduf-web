<template>
  <div class="score-stats-page">
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="export" tab="导出历史统计">
        <a-card :bordered="false">
          <a-table
            :data-source="exportStats"
            :columns="exportColumns"
            :loading="loadingExport"
            :pagination="{ pageSize: 20, showTotal: (t) => `共 ${t} 个班级` }"
            size="middle"
            row-key="majorName"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'exportCount'">
                <a-tag color="blue">{{ record.exportCount }}</a-tag>
              </template>
              <template v-if="column.key === 'lastExportTime'">
                {{ formatTime(record.lastExportTime) }}
              </template>
            </template>
            <template #emptyText>
              <a-empty description="暂无导出记录" />
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>

      <a-tab-pane key="attribute" tab="课程属性使用分布">
        <a-row :gutter="[24, 24]">
          <a-col :xs="24" :md="14">
            <a-card :bordered="false" title="使用次数排行">
              <a-table
                :data-source="attrStats"
                :columns="attrColumns"
                :loading="loadingAttr"
                :pagination="{ pageSize: 10, showTotal: (t) => `共 ${t} 种属性` }"
                size="middle"
                row-key="attrName"
                bordered
              >
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.key === 'rank'">
                    {{ index + 1 }}
                  </template>
                  <template v-if="column.key === 'useCount'">
                    <a-progress
                      :percent="Math.round(record.useCount / maxAttrCount * 100)"
                      :show-info="false"
                      :stroke-color="getBarColor(index)"
                      size="small"
                    />
                    <span class="smart-margin-left10">{{ record.useCount }} 次</span>
                  </template>
                </template>
              </a-table>
            </a-card>
          </a-col>
          <a-col :xs="24" :md="10">
            <a-card :bordered="false" title="分布图">
              <div class="chart-wrap">
                <div ref="pieRef" class="chart-main"></div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, nextTick, computed } from 'vue';
  import { scoreApi } from '/@/api/business/grade/score-api';
  import * as echarts from 'echarts';

  const activeTab = ref('export');
  const loadingExport = ref(false);
  const loadingAttr = ref(false);
  const exportStats = ref<any[]>([]);
  const attrStats = ref<any[]>([]);
  const pieRef = ref<HTMLDivElement>();
  let pieChart: echarts.ECharts | null = null;

  const exportColumns = [
    { title: '班级名称', dataIndex: 'majorName', key: 'majorName' },
    { title: '导出次数', dataIndex: 'exportCount', key: 'exportCount', width: 100, align: 'center' as const },
    { title: '最近导出学期', dataIndex: 'lastPostName', key: 'lastPostName' },
    { title: '最近导出文件', dataIndex: 'lastFile', key: 'lastFile', ellipsis: true },
    { title: '最近导出时间', dataIndex: 'lastExportTime', key: 'lastExportTime', width: 180 },
  ];

  const attrColumns = [
    { title: '#', key: 'rank', width: 50, align: 'center' as const },
    { title: '课程属性', dataIndex: 'attrName', key: 'attrName' },
    { title: '使用次数', dataIndex: 'useCount', key: 'useCount' },
  ];

  const maxAttrCount = computed(() => {
    if (!attrStats.value.length) return 1;
    return Math.max(...attrStats.value.map((a) => a.useCount));
  });

  const barColors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

  function getBarColor(index: number) {
    return barColors[index % barColors.length];
  }

  function formatTime(t: string) {
    if (!t) return '-';
    return t.replace('T', ' ').substring(0, 19);
  }

  async function fetchExportStats() {
    loadingExport.value = true;
    try {
      const res = await scoreApi.exportStats();
      if (res.data?.code === 200) {
        exportStats.value = res.data.data || [];
      }
    } catch { /* ignore */ }
    finally { loadingExport.value = false; }
  }

  async function fetchAttrStats() {
    loadingAttr.value = true;
    try {
      const res = await scoreApi.attributeStats();
      if (res.data?.code === 200) {
        attrStats.value = res.data.data || [];
        updatePieChart();
      }
    } catch { /* ignore */ }
    finally { loadingAttr.value = false; }
  }

  function initPieChart() {
    if (!pieRef.value) return;
    pieChart = echarts.init(pieRef.value);
    updatePieChart();
  }

  function updatePieChart() {
    if (!pieChart) return;
    const data = attrStats.value.map((a, i) => ({
      value: a.useCount,
      name: a.attrName,
      itemStyle: { color: barColors[i % barColors.length] },
    }));
    pieChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} 次 ({d}%)' },
      series: [{
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['50%', '50%'],
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: data.length ? data : [],
      }],
      title: data.length ? undefined : {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: { color: '#ccc', fontSize: 14, fontWeight: 400 },
      },
    });
  }

  watch(() => activeTab.value, (tab) => {
    if (tab === 'attribute' && attrStats.value.length === 0) {
      fetchAttrStats();
    }
    nextTick(() => {
      if (tab === 'attribute') initPieChart();
    });
  });

  onMounted(() => {
    fetchExportStats();
  });
</script>

<style scoped lang="less">
  .score-stats-page {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }
  .chart-wrap {
    width: 100%;
    display: flex;
    justify-content: center;
    .chart-main {
      width: 100%;
      height: 320px;
    }
  }
</style>
