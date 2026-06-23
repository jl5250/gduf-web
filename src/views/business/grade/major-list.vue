<!--
 * 班级专业信息
 *
 * @Author:
 * @Date:      2026-04-25
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <!---------- 查询表单 begin ----------->
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row">
      <a-form-item label="关键字查询" class="smart-query-form-item">
        <a-input style="width:200px" v-model:value="queryForm.keywords" placeholder="专业名称/编号" />
      </a-form-item>
      <a-form-item class="smart-query-form-item">
        <a-button type="primary" @click="queryData">
          <template #icon><SearchOutlined /></template>查询
        </a-button>
        <a-button @click="resetQuery" class="smart-margin-left10">
          <template #icon><ReloadOutlined /></template>重置
        </a-button>
      </a-form-item>
    </a-row>
  </a-form>

  <a-card size="small" :bordered="false" :hoverable="true">
    <!---------- 操作栏 begin ----------->
    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="showForm" type="primary">
          <template #icon><PlusOutlined /></template>新增
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

    <MajorFormModal ref="formRef" @reloadList="queryData" />
  </a-card>
</template>
<script setup lang="ts">
  import { reactive, ref, onMounted } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SearchOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { majorApi } from '/@/api/business/grade/major-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import MajorFormModal from './major-form.vue';

  // ---------------------------- 表格列 ----------------------------
  const columns = [
    { title: '年级编号', dataIndex: 'gradeId', width: 90 },
    { title: '班级编号', dataIndex: 'majorId', width: 140 },
    { title: '班级代码', dataIndex: 'majorEnid', width: 140 },
    { title: '班级名称', dataIndex: 'majorName', width: 160 },
    { title: '所属校区', dataIndex: 'majorCampus', width: 100 },
    { title: '所属专业', dataIndex: 'majorSpecialized', width: 160 },
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

  async function queryData() {
    tableLoading.value = true;
    try {
      const res = await majorApi.queryPage(queryForm);
      tableData.value = res.data.list;
      total.value = res.data.total;
    } catch (e: any) {
      smartSentry.captureError(e);
      const msg = e?.data?.msg || e?.message || '查询失败，请检查后端是否启动或权限配置';
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

  function showForm(data: any) {
    formRef.value.show(data);
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
      await majorApi.batchDelete(selectedRowKeyList.value);
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
      await majorApi.delete(data.id);
      message.success('删除成功');
      await queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }
</script>
