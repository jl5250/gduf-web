<!--
  * 成绩导出记录表
  *
  * @Author:    loong
  * @Date:      2026-04-25 20:34:01
  * @Copyright  gduf
-->
<template>
  <!---------- 查询表单 begin ----------->
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row">
      <a-form-item label="关键字查询" class="smart-query-form-item">
        <a-input style="width:200px" v-model:value="queryForm.keywords" placeholder="班级名称" />
      </a-form-item>
      <a-form-item class="smart-query-form-item">
        <a-button type="primary" @click="onSearch">
          <template #icon><SearchOutlined /></template>查询
        </a-button>
        <a-button @click="resetQuery" class="smart-margin-left10">
          <template #icon><ReloadOutlined /></template>重置
        </a-button>
      </a-form-item>
    </a-row>
  </a-form>

  <!-- 多班级导出后台运行进度条（仅点击后台运行后出现） -->
  <a-alert
    v-if="showMiniProgress"
    type="info"
    show-icon
    :closable="false"
    style="margin-bottom: 8px; cursor: pointer;"
    @click="showBatchProgress"
  >
    <template #message>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>多班级导出中</span>
        <a-progress
          :percent="batchProgress"
          :show-info="true"
          size="small"
          style="width: 200px; margin: 0;"
        />
        <a-button type="link" size="small">查看详情 &raquo;</a-button>
      </div>
    </template>
  </a-alert>

  <a-card size="small" :bordered="false" :hoverable="true">
    <!---------- 操作栏 begin ----------->
    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="showForm" type="primary">
          <template #icon><PlusOutlined /></template>单个班级导出
        </a-button>
        <a-button @click="showBatchForm" type="primary" class="smart-margin-left10">
          <template #icon><DownloadOutlined /></template>多班级导出
        </a-button>
        <a-button @click="confirmBatchDelete" type="primary" danger :disabled="selectedRowKeyList.length === 0">
          <template #icon><DeleteOutlined /></template>批量删除
        </a-button>
      </div>
    </a-row>

    <!---------- 表格 begin ----------->
    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="id"
      bordered
      :loading="tableLoading"
      :pagination="false"
      :row-selection="{ selectedRowKeys: selectedRowKeyList, onChange: onSelectChange }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="onDelete(record)" danger type="link">删除</a-button>
          </div>
        </template>
      </template>
    </a-table>

    <!---------- 分页 begin ----------->
    <div class="smart-query-table-page">
      <a-pagination
        showSizeChanger
        showQuickJumper
        show-less-items
        :pageSizeOptions="PAGE_SIZE_OPTIONS"
        :defaultPageSize="queryForm.pageSize"
        v-model:current="queryForm.pageNum"
        v-model:pageSize="queryForm.pageSize"
        :total="total"
        @change="queryData"
        :show-total="(total: any) => `共${total}条`"
      />
    </div>

    <ScoreExportModal ref="formRef" mode="single" @reloadList="queryData" />
    <ScoreExportModal ref="batchFormRef" mode="multi" @reloadList="queryData" @progressChange="onBatchProgressChange" @backgroundRun="onBackgroundRun" />
  </a-card>
</template>
<script setup lang="ts">
  import { reactive, ref, onMounted } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SearchOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { scoreApi } from '/@/api/business/grade/score-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import ScoreExportModal from './score-export-modal.vue';

  // ---------------------------- 表格列 ----------------------------
  const columns = [
    { title: '学年学期', dataIndex: 'postName', width: 160 },
    { title: '导出的文件', dataIndex: 'file', width: 140 },
    { title: '班级编码', dataIndex: 'majorId', width: 200 },
    { title: '班级名称', dataIndex: 'majorName', width: 160 },
    { title: '操作时间', dataIndex: 'createTime', width: 160 },
    { title: '操作者', dataIndex: 'createBy', width: 100 },
    { title: '操作', dataIndex: 'action', width: 100 },
  ];

  // ---------------------------- 查询 ----------------------------
  const queryFormState = {
    keywords: undefined,
    pageNum: 1,
    pageSize: 10,
  };
  const queryForm = reactive({ ...queryFormState });
  const tableLoading = ref(false);
  const tableData = ref([]);
  const total = ref(0);

  function resetQuery() {
    let pageSize = queryForm.pageSize;
    Object.assign(queryForm, queryFormState);
    queryForm.pageSize = pageSize;
    queryData();
  }

  function onSearch() {
    queryForm.pageNum = 1;
    queryData();
  }

  async function queryData() {
    tableLoading.value = true;
    try {
      const res = await scoreApi.queryPage(queryForm);
      tableData.value = res.data.list;
      total.value = res.data.total;
    } catch (e: any) {
      smartSentry.captureError(e);
      const msg = e?.data?.msg || e?.message || '查询失败';
      message.error(msg);
    } finally {
      tableLoading.value = false;
    }
  }

  onMounted(queryData);

  // ---------------------------- 多选 ----------------------------
  const selectedRowKeyList = ref<number[]>([]);

  function onSelectChange(selectedRowKeys: number[]) {
    selectedRowKeyList.value = selectedRowKeys;
  }

  // ---------------------------- 新增 ----------------------------
  const formRef = ref();

  function showForm() {
    formRef.value.show();
  }

  // ---------------------------- 多班级导出 ----------------------------
  const batchFormRef = ref();
  const batchProgress = ref(0);
  const showMiniProgress = ref(false);

  function showBatchForm() {
    showMiniProgress.value = false;
    batchFormRef.value.show();
  }

  function onBackgroundRun() {
    showMiniProgress.value = true;
  }

  function onBatchProgressChange(percent: number) {
    batchProgress.value = percent;
    // 导出完成或取消时隐藏进度条
    if (percent === 0 || percent >= 100) {
      showMiniProgress.value = false;
    }
  }

  function showBatchProgress() {
    showMiniProgress.value = false;
    batchFormRef.value.showProgress();
  }

  // ---------------------------- 批量删除 ----------------------------
  function confirmBatchDelete() {
    Modal.confirm({
      title: '提示',
      content: '确定要删除选中的 ' + selectedRowKeyList.value.length + ' 条记录吗？',
      okText: '删除',
      okType: 'danger',
      onOk() {
        requestBatchDelete();
      },
    });
  }

  async function requestBatchDelete() {
    SmartLoading.show();
    try {
      await scoreApi.batchDelete(selectedRowKeyList.value);
      message.success('批量删除成功');
      selectedRowKeyList.value = [];
      await queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  // ---------------------------- 单个删除 ----------------------------
  function onDelete(data: any) {
    Modal.confirm({
      title: '提示',
      content: '确定要删除该记录吗？',
      okText: '删除',
      okType: 'danger',
      onOk() {
        return requestDelete(data);
      },
    });
  }

  async function requestDelete(data: any) {
    SmartLoading.show();
    try {
      await scoreApi.delete(data.id);
      message.success('删除成功');
      await queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }
</script>

