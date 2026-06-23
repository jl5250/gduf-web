<template>
  <div class="queue-monitor-page">
    <!-- 队列概览 -->
    <a-row :gutter="[24, 24]">
      <a-col :xs="12" :sm="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="等待中" :value="stats.waiting" value-style="color: #1890ff">
            <template #prefix><HourglassOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="运行中" :value="stats.active" value-style="color: #722ed1">
            <template #prefix><LoadingOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="已完成" :value="stats.completed" value-style="color: #52c41a">
            <template #prefix><CheckCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="失败" :value="stats.failed" value-style="color: #ff4d4f">
            <template #prefix><CloseCircleOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 死信队列 -->
    <a-card :bordered="false" class="smart-margin-top24" title="死信队列" :extra="extra">
      <template #extra>
        <a-space>
          <a-tag color="red">失败任务</a-tag>
          <a-button type="primary" ghost size="small" @click="fetchDLQ" :loading="loading">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </a-space>
      </template>

      <a-table
        :data-source="dlqJobs"
        :columns="columns"
        :loading="loading"
        :pagination="{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }"
        size="middle"
        row-key="id"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a-tag>{{ record.name }}</a-tag>
          </template>
          <template v-if="column.key === 'data'">
            <a-tooltip :title="JSON.stringify(record.data, null, 2)">
              <span class="data-cell">{{ JSON.stringify(record.data) }}</span>
            </a-tooltip>
          </template>
          <template v-if="column.key === 'failedReason'">
            <a-tooltip :title="record.failedReason">
              <span class="error-text">{{ truncate(record.failedReason, 60) }}</span>
            </a-tooltip>
          </template>
          <template v-if="column.key === 'attempts'">
            <a-tag :color="record.attemptsMade >= 3 ? 'red' : 'orange'">
              {{ record.attemptsMade }} / 3
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button
              type="link"
              size="small"
              @click="handleRetry(record.id)"
              :loading="retryingId === record.id"
            >
              <template #icon><RedoOutlined /></template>
              重试
            </a-button>
          </template>
        </template>
        <template #emptyText>
          <a-empty description="暂无失败任务" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { gradeGetRequest, gradePostRequest } from '/@/lib/grade-axios';
  import { message } from 'ant-design-vue';
  import {
    HourglassOutlined,
    LoadingOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    RedoOutlined,
  } from '@ant-design/icons-vue';

  interface QueueStats {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }

  interface DLQJob {
    id: string;
    name: string;
    data: any;
    failedReason: string;
    attemptsMade: number;
    timestamp: string;
  }

  const stats = reactive<QueueStats>({ waiting: 0, active: 0, completed: 0, failed: 0 });
  const dlqJobs = ref<DLQJob[]>([]);
  const loading = ref(false);
  const retryingId = ref<string | null>(null);

  const columns = [
    { title: '任务名', dataIndex: 'name', key: 'name', width: 140 },
    { title: '任务数据', dataIndex: 'data', key: 'data', width: 200, ellipsis: true },
    { title: '失败原因', dataIndex: 'failedReason', key: 'failedReason', ellipsis: true },
    { title: '重试次数', dataIndex: 'attemptsMade', key: 'attempts', width: 100, align: 'center' as const },
    { title: '入队时间', dataIndex: 'timestamp', key: 'timestamp', width: 170 },
    { title: '操作', key: 'action', width: 90, align: 'center' as const },
  ];

  async function fetchStats() {
    try {
      const res = await gradeGetRequest('/admin/queue/stats');
      if (res.data?.code === 200 && res.data?.data) {
        Object.assign(stats, res.data.data);
      }
    } catch { /* ignore */ }
  }

  async function fetchDLQ() {
    loading.value = true;
    try {
      const res = await gradeGetRequest('/admin/dlq');
      if (res.data?.code === 200) {
        dlqJobs.value = (res.data.data || []).map((job: DLQJob) => ({
          ...job,
          timestamp: job.timestamp ? new Date(job.timestamp).toLocaleString() : '-',
        }));
      }
    } catch (err: any) {
      message.error('获取死信队列失败: ' + (err.message || '未知错误'));
    } finally {
      loading.value = false;
    }
  }

  async function handleRetry(jobId: string) {
    retryingId.value = jobId;
    try {
      const res = await gradePostRequest(`/admin/dlq/retry/${jobId}`);
      if (res.data?.code === 200) {
        message.success(`任务 ${jobId} 已重新入队`);
        await fetchDLQ();
        await fetchStats();
      } else {
        message.warning(res.data?.msg || '重试失败');
      }
    } catch (err: any) {
      message.error('重试请求失败: ' + (err.message || '未知错误'));
    } finally {
      retryingId.value = null;
    }
  }

  function truncate(text: string, len: number) {
    return text && text.length > len ? text.slice(0, len) + '...' : text;
  }

  onMounted(() => {
    fetchStats();
    fetchDLQ();
  });
</script>

<style scoped lang="less">
  .queue-monitor-page {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }
  .stat-card {
    border-radius: 8px;
    text-align: center;
    :deep(.ant-card-body) {
      padding: 28px 16px;
    }
    :deep(.ant-statistic-title) {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 12px;
    }
    :deep(.ant-statistic-content) {
      font-size: 32px;
      font-weight: 600;
    }
  }
  .data-cell {
    max-width: 200px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .error-text {
    color: #cf1322;
    font-size: 12px;
  }
</style>
