<!--
 * 导出个人成绩单
 *
 * @Author:    
 * @Date:      2026-04-25
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <div class="grade-export">
    <!-- 查询表单 -->
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item label="学号" class="smart-query-form-item">
          <a-input
            style="width: 200px"
            v-model:value="form.xsxh"
            placeholder="请输入9位数字学号"
            :maxlength="9"
            allow-clear
            @input="onXsxhInput"
          />
        </a-form-item>

        <a-form-item label="姓名" class="smart-query-form-item">
          <a-input
            style="width: 200px"
            v-model:value="form.xsmc"
            placeholder="请输入姓名"
            allow-clear
          />
        </a-form-item>

        <a-form-item class="smart-query-form-item smart-margin-left10">
          <a-button-group>
            <a-button type="primary" :loading="loading" @click="onExport">
              <template #icon>
                <SearchOutlined />
              </template>
              查询并生成成绩单
            </a-button>
            <a-button @click="resetForm">
              <template #icon>
                <ReloadOutlined />
              </template>
              重置
            </a-button>
          </a-button-group>
        </a-form-item>
      </a-row>
    </a-form>

    <!-- 成绩单展示区 -->
    <a-card size="small" :bordered="false" :hoverable="true">
      <a-row class="smart-table-btn-block">
        <div class="smart-table-operate-block">
          <a-button type="primary" :disabled="!pdfUrl" @click="onDownload">
            <template #icon>
              <DownloadOutlined />
            </template>
            下载成绩单
          </a-button>
        </div>
      </a-row>

      <!-- PDF 预览 -->
      <div v-if="loading" style="text-align: center; padding: 100px 0">
        <a-spin size="large" tip="正在生成成绩单..." />
      </div>

      <div v-else-if="pdfUrl" class="pdf-preview">
        <iframe
          :src="pdfUrl"
          style="width: 100%; height: 800px; border: 1px solid #e8e8e8; border-radius: 4px"
        ></iframe>
      </div>

      <div v-else style="text-align: center; padding: 100px 0; color: #999">
        <FilePdfOutlined style="font-size: 64px; display: block; margin-bottom: 16px" />
        请输入学号和姓名，点击「查询并生成成绩单」查看
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { SearchOutlined, ReloadOutlined, DownloadOutlined, FilePdfOutlined } from '@ant-design/icons-vue';
  import { gradeApi } from '/@/api/business/grade/grade-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  // --------------------------- base64 安全解码 ---------------------------

  function base64ToUint8Array(base64: string): Uint8Array {
    let clean = base64.replace(/[\s\r\n]/g, '');
    try {
      const binaryStr = atob(clean);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return bytes;
    } catch {
      clean = clean.replace(/-/g, '+').replace(/_/g, '/');
      while (clean.length % 4 !== 0) {
        clean += '=';
      }
      const binaryStr = atob(clean);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return bytes;
    }
  }

  // --------------------------- 表单 ---------------------------

  const form = reactive({
    xsxh: '',
    xsmc: '',
  });

  const loading = ref(false);
  const pdfUrl = ref('');

  // --------------------------- 重置 ---------------------------

  function resetForm() {
    form.xsxh = '';
    form.xsmc = '';
    // 释放之前的 blob URL
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
      pdfUrl.value = '';
    }
  }

  // --------------------------- 查询并生成 ---------------------------

  // --------------------------- 学号输入限制 ---------------------------

  function onXsxhInput() {
    // 只允许输入数字
    form.xsxh = form.xsxh.replace(/\D/g, '');
  }

  // --------------------------- 查询并生成 ---------------------------

  async function onExport() {
    // 表单校验
    if (!form.xsxh) {
      message.warning('请输入学号');
      return;
    }
    if (!/^\d{9}$/.test(form.xsxh)) {
      message.warning('学号必须为9位数字');
      return;
    }
    if (!form.xsmc) {
      message.warning('请输入姓名');
      return;
    }

    try {
      loading.value = true;

      // 释放之前的 blob URL
      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
        pdfUrl.value = '';
      }

      // 调用外部 API 获取 base64 编码的 PDF
      const base64Data = await gradeApi.exportPdf(form.xsxh, form.xsmc);

      // base64 转 blob URL
      const bytes = base64ToUint8Array(base64Data);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      pdfUrl.value = URL.createObjectURL(blob);

      message.success('成绩单生成成功');
    } catch (e) {
      smartSentry.captureError(e);
      message.error('生成成绩单失败，请检查学号和姓名是否正确');
    } finally {
      loading.value = false;
    }
  }

  // --------------------------- 下载 ---------------------------

  function onDownload() {
    if (!pdfUrl.value) {
      return;
    }
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = pdfUrl.value;
    link.setAttribute('download', `${form.xsmc}_成绩单.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<style scoped>
  .grade-export {
    padding: 0;
  }

  .pdf-preview {
    margin-top: 8px;
  }
</style>
