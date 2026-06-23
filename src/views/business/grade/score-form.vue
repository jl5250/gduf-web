<!--
  * 成绩导出记录表
  *
  * @Author:    loong
  * @Date:      2026-04-25 20:34:01
  * @Copyright  gduf
-->
<template>
  <a-modal
    title="成绩导出"
    width="600px"
    :open="visibleFlag"
    @cancel="onClose"
    :maskClosable="false"
    :destroyOnClose="true"
    forceRender
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }">
      <a-form-item label="班级" name="majorName">
        <a-select
          style="width: 100%"
          v-model:value="form.majorName"
          :options="majorOptions"
          :loading="dropdownLoading"
          placeholder="请选择班级"
          allowClear
        />
      </a-form-item>
      <a-form-item label="学年学期" name="postName">
        <a-select
          style="width: 100%"
          mode="multiple"
          v-model:value="form.postName"
          :options="semesterOptions"
          :loading="dropdownLoading"
          placeholder="请选择学年学期（可多选）"
        />
      </a-form-item>
      <a-form-item label="课程属性">
        <a-select
          style="width: 100%"
          mode="multiple"
          v-model:value="form.courseAttributes"
          :options="courseAttributeOptions"
          placeholder="默认排除通识选修（可多选）"
          allowClear
        />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit" :loading="submitting">导出</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
<script setup lang="ts">
  import type { FormInstance } from 'ant-design-vue';
  import { reactive, ref, nextTick } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { scoreApi } from '/@/api/business/grade/score-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const emits = defineEmits<{ (e: 'reloadList'): void }>();

  const visibleFlag = ref(false);
  const formRef = ref<FormInstance>();
  const submitting = ref(false);
  const dropdownLoading = ref(false);

  /** 班级下拉选项，value=majorName，同时携带 majorId */
  const majorOptions = ref<{ label: string; value: string; majorId: string }[]>([]);
  /** 学年学期下拉选项 */
  const semesterOptions = ref<{ label: string; value: string }[]>([]);

  /** 课程属性选项（从教务系统动态获取） */
  const courseAttributeOptions = ref<{ label: string; value: string }[]>([]);

  interface FormState {
    majorName: string | undefined;
    postName: string[];
    courseAttributes: string[];
  }

  const formDefault: FormState = {
    majorName: undefined,
    postName: [],
    courseAttributes: [],
  };

  const form: FormState = reactive({ ...formDefault });

  const rules: Record<string, any[]> = {
    majorName: [{ required: true, message: '请选择班级' }],
    postName: [{ required: true, message: '请选择学年学期' }],
  };

  async function loadDropdownData() {
    dropdownLoading.value = true;
    try {
      // 1. 加载班级列表，按年级从大到小排序
      const majorRes = await scoreApi.listAllMajor();
      const list: { major_name: string; major_id: string }[] = majorRes.data || [];
      majorOptions.value = list
        .map((item) => ({
          label: item.major_name,
          value: item.major_name,
          majorId: item.major_id,
        }))
        .sort((a, b) => {
          // 从班级名称中提取年级（如 "2025计算机科学1班" → 2025）
          const yearA = parseInt(a.label.match(/\d{4}/)?.[0] || '0');
          const yearB = parseInt(b.label.match(/\d{4}/)?.[0] || '0');
          return yearB - yearA; // 从大到小
        });

      // 2. 并行加载学年学期和课程属性（从外部系统动态获取）
      const [extRes, attrRes]: any[] = await Promise.all([
        scoreApi.listSemesters(),
        scoreApi.listCourseAttributes(),
      ]);

      const rawList: string[] = extRes?.data?.[0] || [];
      semesterOptions.value = rawList.map((s) => ({ label: s, value: s }));

      const attrList: { value: string; label: string }[] = attrRes?.data || [];
      courseAttributeOptions.value = attrList;

      // 默认选中除"通识选修"外的所有课程属性
      if (form.courseAttributes.length === 0 && attrList.length > 0) {
        form.courseAttributes = attrList
          .filter((a) => a.label !== '通识选修')
          .map((a) => a.value);
      }
    } catch (err) {
      smartSentry.captureError(err);
    } finally {
      dropdownLoading.value = false;
    }
  }

  function show() {
    Object.assign(form, formDefault);
    visibleFlag.value = true;
    submitting.value = false;
    loadDropdownData();
    nextTick(() => {
      formRef.value?.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, formDefault);
    visibleFlag.value = false;
  }

  async function onSubmit() {
    try {
      await formRef.value!.validateFields();
      submitting.value = true;
      SmartLoading.show();
      try {
        // 1. 获取 majorId
        const selected = majorOptions.value.find((o) => o.value === form.majorName);
        const majorId = selected?.majorId || '';
        const postNameStr = form.postName.join(', ');

        // 2. 提交到外部系统 /getExcel，获取 base64 数据
        const extRes: any = await scoreApi.submitExcel({
          majorName: form.majorName!,
          majorId,
          postName: postNameStr,
          courseAttributes: form.courseAttributes,
        });
        const base64Str: string = extRes?.data || extRes || '';
        if (!base64Str) {
          throw new Error('外部系统未返回文件数据');
        }

        // 3. base64 → Excel Blob → 下载
        const byteChars = atob(base64Str);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNums[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNums);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = `${form.majorName}.xls`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);

        // 4. 保存记录到本地数据库
        await scoreApi.add({
          majorName: form.majorName!,
          majorId,
          postName: postNameStr,
          file: fileName,
        });
        message.success('导出成功');
        emits('reloadList');
        onClose();
      } catch (err) {
        smartSentry.captureError(err);
      } finally {
        SmartLoading.hide();
        submitting.value = false;
      }
    } catch {
      message.error('参数验证错误，请仔细填写表单数据!');
    }
  }

  defineExpose({ show });
</script>

