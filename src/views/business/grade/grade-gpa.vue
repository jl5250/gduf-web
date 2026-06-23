<!--
 * 成绩绩点计算
 *
 * @Author:    
 * @Date:      2026-04-25
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <div class="grade-gpa">
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item label="上传 Excel" class="smart-query-form-item">
          <a-upload
            :multiple="true"
            :file-list="fileList"
            :before-upload="beforeUpload"
            @remove="handleRemove"
            accept=".xlsx,.xls"
          >
            <a-button><template #icon><UploadOutlined /></template>选择文件</a-button>
          </a-upload>
        </a-form-item>
        <a-form-item label="生成排名表" class="smart-query-form-item">
          <a-switch v-model:checked="determine" checked-children="是" un-checked-children="否" />
        </a-form-item>
        <a-form-item class="smart-query-form-item smart-margin-left10">
          <a-button-group>
            <a-button type="primary" :loading="loading" :disabled="fileList.length === 0" @click="onSubmit">
              <template #icon><CalculatorOutlined /></template>开始计算
            </a-button>
            <a-button @click="resetForm"><template #icon><ReloadOutlined /></template>重置</a-button>
          </a-button-group>
        </a-form-item>
      </a-row>
    </a-form>

    <a-card size="small" :bordered="false" :hoverable="true">
      <div v-if="loading" style="text-align:center;padding:100px 0">
        <a-spin size="large" tip="正在计算绩点，请稍候..." />
      </div>

      <div v-else-if="hasResult" class="result-area">
        <a-alert type="success" show-icon :message="resultMsg" :description="resultDescription" />

        <a-row style="margin-top:16px">
          <a-button type="primary" size="large" @click="onDownloadZip">
            <template #icon><DownloadOutlined /></template>下载全部结果（ZIP）
          </a-button>
        </a-row>

        <a-table style="margin-top:16px" size="small" :dataSource="summaryList" :columns="summaryColumns" rowKey="label" :pagination="false" bordered>
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex==='icon'">
              <FileExcelOutlined v-if="record.type==='excel'" style="color:#52c41a;font-size:20px" />
              <WarningOutlined v-else style="color:#ff4d4f;font-size:20px" />
            </template>
            <template v-if="column.dataIndex==='count'">
              <span v-if="record.type==='excel'">{{ record.count }} 个文件</span>
              <span v-else>{{ record.count }} 条</span>
            </template>
          </template>
        </a-table>

        <a-collapse v-if="failItems.length > 0" style="margin-top:16px">
          <a-collapse-panel key="fail" header="查看挂科详情">
            <a-table size="small" :dataSource="failItems" :columns="failColumns" rowKey="rowIdx" :pagination="false" bordered>
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex==='sno'">
                  <span style="color:#ff4d4f">{{ record.sno }}</span>
                </template>
                <template v-if="column.dataIndex==='courseName'">
                  <span style="color:#ff4d4f">{{ record.courseName }}</span>
                </template>
              </template>
            </a-table>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <div v-else style="text-align:center;padding:100px 0;color:#999">
        <FileExcelOutlined style="font-size:64px;display:block;margin-bottom:16px" />
        上传 Excel 文件，点击「开始计算」生成绩点结果
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { UploadOutlined, CalculatorOutlined, ReloadOutlined, DownloadOutlined, FileExcelOutlined, WarningOutlined } from '@ant-design/icons-vue';
  import { gradeApi } from '/@/api/business/grade/grade-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import JSZip from 'jszip';

  const fileList = ref<any[]>([]);
  const determine = ref(false);
  const loading = ref(false);
  const resultMsg = ref('');

  /**
   * 后端 data 数组格式：
   *   determine=false → [ filesOut[], failList[] ]
   *   determine=true  → [ filesOut[], ranksOut[], failList[] ]
   *
   * filesOut[] 中每个元素是 base64 字符串（成绩单 Excel）
   * ranksOut[] 中每个元素是 base64 字符串（排名表 Excel）
   * failList[] 中每个元素为 { sno: '19154A123', sname: '陈乐华', courseName: '计量经济学，专' }
   */
  const rawData = ref<any[] | null>(null);

  function beforeUpload(file: File) {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      message.error('仅支持 .xlsx / .xls 格式');
      return false;
    }
    fileList.value = [...fileList.value, file];
    return false;
  }

  function handleRemove(file: any) {
    const idx = fileList.value.indexOf(file);
    if (idx !== -1) fileList.value.splice(idx, 1);
  }

  function resetForm() {
    fileList.value = [];
    determine.value = false;
    rawData.value = null;
    resultMsg.value = '';
  }

  async function onSubmit() {
    if (fileList.value.length === 0) {
      message.warning('请至少上传一个 Excel 文件');
      return;
    }
    try {
      loading.value = true;
      rawData.value = null;
      resultMsg.value = '';

      const res = await gradeApi.getGPA(fileList.value as File[], determine.value);

      if (res.code !== 200) {
        message.error(res.msg || '计算失败');
        return;
      }

      const data = res.data;
      console.log('res.data', data);
      if (!Array.isArray(data) || data.length < 2) {
        message.error('返回数据格式异常');
        return;
      }

      rawData.value = data;
      resultMsg.value = res.msg || '计算完成';
      message.success('绩点计算完成');
    } catch (e: any) {
      smartSentry.captureError(e);
      message.error(e?.response?.data?.msg || e?.response?.data?.error || e.message || '计算失败');
    } finally {
      loading.value = false;
    }
  }

  // --------------------------- 解析结果 ---------------------------

  const hasResult = computed(() => rawData.value !== null && rawData.value.length >= 2);

  /** data[0] 成绩单 - 每个元素是 base64 字符串 */
  const filesOutList = computed(() => {
    if (!rawData.value || !Array.isArray(rawData.value[0])) return [];
    return rawData.value[0];
  });

  /** data[1] 排名表（仅 determine=true 时有3个元素）- 每个元素是 base64 字符串 */
  const ranksOutList = computed(() => {
    if (!rawData.value || rawData.value.length < 3) return [];
    if (!Array.isArray(rawData.value[1])) return [];
    return rawData.value[1];
  });

  /** failList: 数组最后一个元素 */
  const failList = computed(() => {
    if (!rawData.value) return [];
    const last = rawData.value[rawData.value.length - 1];
    return Array.isArray(last) ? last : [];
  });

  /** 拍平 failList 中可能嵌套的数组 */
  const failItems = computed(() => {
    const items: any[] = [];
    failList.value.forEach((item: any, idx: number) => {
      if (Array.isArray(item)) {
        item.forEach((sub: any, subIdx: number) => {
          if (sub && typeof sub === 'object') {
            items.push({ rowIdx: `${idx}-${subIdx}`, ...sub });
          }
        });
      } else if (item && typeof item === 'object') {
        items.push({ rowIdx: String(idx), ...item });
      }
    });
    return items;
  });

  // --------------------------- 汇总展示 ---------------------------

  const summaryColumns = [
    { title: '', dataIndex: 'icon', width: 50 },
    { title: '分类', dataIndex: 'label' },
    { title: '内容', dataIndex: 'count' },
  ];

  const summaryList = computed(() => {
    const list: any[] = [];
    list.push({ label: '绩点汇总', count: filesOutList.value.length, type: 'excel' });
    if (determine.value) {
      list.push({ label: '专业排名', count: ranksOutList.value.length, type: 'excel' });
    }
    list.push({ label: '挂科名单', count: failItems.value.length, type: 'fail' });
    return list;
  });

  const resultDescription = computed(() => {
    const parts = summaryList.value.map((r: any) => `${r.label} ${r.count}${r.type === 'excel' ? '个' : '条'}`);
    return `共 ${parts.join('，')}，点击下方按钮下载 ZIP 压缩包。`;
  });

  const failColumns = [
    { title: '学号', dataIndex: 'sno', width: 120 },
    { title: '姓名', dataIndex: 'sname', width: 100 },
    { title: '挂科课程', dataIndex: 'courseName', minWidth: 200 },
  ];

  // --------------------------- base64 解码 ---------------------------

  function base64ToUint8Array(base64: string): Uint8Array {
    if (!base64) {
      console.error('base64ToUint8Array: invalid input', typeof base64, base64?.slice?.(0, 50));
      return new Uint8Array(0);
    }

    // 1. 去除所有空白符、换行
    let clean = base64.replace(/[\s\r\n]/g, '');
    // 2. 只保留标准 base64 字符（A-Z a-z 0-9 + / =）
    //    某些后端可能混入了不可见字符
    const filtered = clean.replace(/[^A-Za-z0-9+/=]/g, '');
    if (filtered.length !== clean.length) {
      console.warn('base64 含有非标准字符，已过滤', clean.length - filtered.length, '个字符');
      clean = filtered;
    }

    try {
      const str = atob(clean);
      const bytes = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
      return bytes;
    } catch {
      // URL-safe base64 转换
      clean = clean.replace(/-/g, '+').replace(/_/g, '/');
      while (clean.length % 4 !== 0) clean += '=';
      try {
        const str = atob(clean);
        const bytes = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
        return bytes;
      } catch (e) {
        console.error('base64 解码彻底失败，前50字符:', clean.slice(0, 50));
        return new Uint8Array(0);
      }
    }
  }

  // --------------------------- ZIP 下载 ---------------------------

  async function onDownloadZip() {
    if (!rawData.value) return;
    try {
      const zip = new JSZip();

      // 成绩单：data[0] 中每个元素就是 base64 字符串
      console.log('[下载] filesOutList:', filesOutList.value.length, '个');
      filesOutList.value.forEach((item: any, idx: number) => {
        if (typeof item === 'string' && item.length > 0) {
          // 取对应上传文件的原始文件名
          const srcFile = fileList.value[idx];
          const origName = srcFile?.name?.replace?.(/\.(xlsx|xls)$/i, '') || `成绩单_${idx + 1}`;
          const fileName = `${origName}_绩点汇总.xlsx`;
          zip.folder('绩点汇总')!.file(fileName, base64ToUint8Array(item));
        }
      });

      // 排名表：data[1] 中每个元素就是 base64 字符串（determine=true 时）
      console.log('[下载] ranksOutList:', ranksOutList.value.length, '个');
      ranksOutList.value.forEach((item: any, idx: number) => {
        if (typeof item === 'string' && item.length > 0) {
          const srcFile = fileList.value[idx];
          const origName = srcFile?.name?.replace?.(/\.(xlsx|xls)$/i, '') || `排名表_${idx + 1}`;
          const fileName = `${origName}_专业排名.xlsx`;
          zip.folder('专业排名')!.file(fileName, base64ToUint8Array(item));
        }
      });

      // 挂科名单
      if (failItems.value.length > 0) {
        zip.folder('挂科名单')!.file('挂科名单.json', JSON.stringify(failItems.value, null, 2));
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', '绩点计算结果.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      message.success('下载成功');
    } catch (e) {
      smartSentry.captureError(e);
      message.error('下载失败，请重试');
    }
  }
</script>

<style scoped>
  .grade-gpa { padding: 0; }
  .result-area { padding: 0; }
</style>
