<!--
 * 多班级成绩导出（异步带进度 + ZIP 打包）
 *
 * @Author:    loong
 * @Date:      2026-05-22
 * @Copyright  gduf
-->
<template>
  <a-modal
    title="多班级成绩导出"
    width="700px"
    :open="visibleFlag"
    @cancel="onClose"
    :maskClosable="false"
    :destroyOnClose="true"
    forceRender
  >
    <!-- ====== 步骤1：表单填写 ====== -->
    <div v-if="step === 'form'">
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }">
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
        <a-form-item label="选择班级" name="major">
          <a-tree-select
            style="width: 100%"
            v-model:value="form.major"
            :tree-data="majorTreeData"
            :loading="dropdownLoading"
            multiple
            tree-checkable
            placeholder="请选择班级（按年级→专业→班级）"
            allow-clear
            :max-tag-count="6"
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
    </div>

    <!-- ====== 步骤2：导出进度 ====== -->
    <div v-else-if="step === 'progress'" style="padding: 24px 0; text-align: center;">
      <a-progress
        type="circle"
        :percent="progressPercent"
        :status="progressStatus"
        :stroke-color="progressPercent >= 100 ? '#52c41a' : undefined"
      />
      <p style="margin-top: 16px; color: #666;">
        {{ progressMessage }}
      </p>
      <p v-if="progressPercent >= 0 && progressPercent < 100" style="color: #999; font-size: 12px;">
        正在后台并发处理，请耐心等待...
      </p>
      <p v-if="progressError" style="color: #ff4d4f; margin-top: 8px;">
        {{ progressError }}
      </p>
    </div>

    <template #footer>
      <a-space>
        <a-button @click="onClose">
          {{ step === 'progress' && progressPercent < 100 ? '后台运行' : '取消' }}
        </a-button>
        <a-button
          v-if="step === 'form'"
          type="primary"
          @click="onSubmit"
          :loading="submitting"
        >
          开始导出
        </a-button>
        <a-button
          v-if="step === 'progress' && progressError"
          type="primary"
          @click="retrySubmit"
        >
          重试
        </a-button>
      </a-space>
    </template>
  </a-modal>
</template>
<script setup lang="ts">
  import type { FormInstance } from 'ant-design-vue';
  import { reactive, ref, nextTick, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { scoreApi } from '/@/api/business/grade/score-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import JSZip from 'jszip';
  import { v4 as uuidv4 } from 'uuid';
  import dayjs from 'dayjs';

  const emits = defineEmits<{
    (e: 'reloadList'): void;
    (e: 'progressChange', percent: number): void;
    (e: 'backgroundRun'): void;
  }>();

  const visibleFlag = ref(false);
  const formRef = ref<FormInstance>();
  const submitting = ref(false);
  const dropdownLoading = ref(false);

  /** 步骤：form（填写表单）/ progress（显示进度） */
  const step = ref<'form' | 'progress'>('form');
  /** 进度百分比 0~100 */
  const progressPercent = ref(0);
  /** 进度状态 */
  const progressStatus = ref<'active' | 'success' | 'exception'>('active');
  /** 进度消息 */
  const progressMessage = ref('');
  /** 进度错误信息 */
  const progressError = ref('');

  // ---------- 下拉数据 ----------
  const semesterOptions = ref<{ label: string; value: string }[]>([]);
  const majorList = ref<{ id: number; gradeId: string; majorId: string; majorName: string; majorSpecialized: string }[]>([]);

  /** 课程属性选项（从教务系统动态获取） */
  const courseAttributeOptions = ref<{ label: string; value: string }[]>([]);

  /** 三级树形数据：年级 → 专业 → 班级 */
  const majorTreeData = computed(() => {
    // 先按 gradeId 分组
    const gradeGroups = new Map<string, typeof majorList.value>();
    majorList.value.forEach((item) => {
      if (!gradeGroups.has(item.gradeId)) {
        gradeGroups.set(item.gradeId, []);
      }
      gradeGroups.get(item.gradeId)!.push(item);
    });
    return Array.from(gradeGroups.entries())
      .sort(([a], [b]) => b.localeCompare(a))  // 年级从大到小
      .map(([gradeId, majors]) => {
        // 在每个年级内按 majorSpecialized 分组
        const specGroups = new Map<string, typeof majors>();
        majors.forEach((m) => {
          const spec = m.majorSpecialized || '未分类';
          if (!specGroups.has(spec)) {
            specGroups.set(spec, []);
          }
          specGroups.get(spec)!.push(m);
        });
        return {
          title: `${gradeId}级`,
          value: gradeId,
          key: gradeId,
          selectable: false,
          children: Array.from(specGroups.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([spec, specMajors]) => ({
              title: spec,
              value: `${gradeId}_${spec}`,
              key: `${gradeId}_${spec}`,
              selectable: false,
              children: specMajors.map((m) => {
                const leafValue = JSON.stringify([m.majorId, m.majorName]);
                return {
                  title: m.majorName,
                  value: leafValue,
                  key: leafValue,
                };
              }),
            })),
        };
      });
  });

  // ---------- 表单 ----------
  interface FormState {
    postName: string[];
    major: string[];  // JSON.stringify([majorId, majorName]) 数组
    courseAttributes: string[];
  }

  const formDefault: FormState = {
    postName: [],
    major: [],
    courseAttributes: [],
  };

  const form: FormState = reactive({ ...formDefault });

  const rules: Record<string, any[]> = {
    postName: [{ required: true, message: '请选择学年学期', type: 'array' }],
    major: [{ required: true, message: '请选择至少一个班级', type: 'array' }],
  };

  /** 解析 form.major 为 [[majorId, majorName], ...] */
  function parseSelectedMajors(): [string, string][] {
    return form.major
      .map((v) => {
        try {
          return JSON.parse(v) as [string, string];
        } catch {
          return null;
        }
      })
      .filter((v): v is [string, string] => v !== null);
  }

  // ---------- 加载下拉数据 ----------
  async function loadDropdownData() {
    dropdownLoading.value = true;
    try {
      // 并行加载班级、学年学期、课程属性
      const [majorRes, extRes, attrRes]: any[] = await Promise.all([
        scoreApi.listAllWithGrade(),
        scoreApi.listSemesters(),
        scoreApi.listCourseAttributes(),
      ]);

      majorList.value = majorRes?.data || [];

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

  // ---------- 轮询状态 ----------
  const POLL_INTERVAL = 2000;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let resultTimer: ReturnType<typeof setInterval> | null = null;
  let currentUuid = '';

  /** 轮询进度，完成后自动切换到结果轮询 */
  function startPolling() {
    pollTimer = setInterval(async () => {
      try {
        const res: any = await scoreApi.getProgress(currentUuid);
        const raw = res?.data ?? res ?? '0';
        const pct = parseInt(String(raw), 10);
        progressPercent.value = isNaN(pct) ? 0 : pct;
        emits('progressChange', progressPercent.value);

        if (pct >= 100) {
          clearInterval(pollTimer!);
          pollTimer = null;
          progressMessage.value = '处理完成，正在获取结果...';
          startResultPolling();
        }
      } catch (err: any) {
        smartSentry.captureError(err);
      }
    }, POLL_INTERVAL);
  }

  /** 进度100%后轮询结果，直到拿到真实数据 */
  function startResultPolling() {
    if (resultTimer) return; // 防止 async 回调并发导致重复创建
    resultTimer = setInterval(async () => {
      try {
        const resultRes: any = await scoreApi.getResult(currentUuid);
        const { code, msg, data } = resultRes || {};

        if (code === 202 || !data) {
          // 结果还没准备好，继续等
          return;
        }

        clearInterval(resultTimer!);
        resultTimer = null;
        await handleResult(code, msg, data);
      } catch (err: any) {
        smartSentry.captureError(err);
      }
    }, POLL_INTERVAL);
  }

  // ---------- 处理结果并下载 ----------
  async function handleResult(code: number, msg: string, data: any) {
    try {
      if (code !== 200 && code !== 207) {
        throw new Error(msg || '导出失败');
      }

      const selectedMajors = parseSelectedMajors();
      const base64List: string[] = Array.isArray(data) ? data : [];
      const fileName = `成绩导出_${dayjs().format('YYYYMMDD_HHmmss')}.zip`;

      // 打包 ZIP
      const zip = new JSZip();
      base64List.forEach((base64Str, index) => {
        if (!base64Str) return;
        const [mId, mName] = selectedMajors[index] || [`class_${index}`, `班级${index + 1}`];
        const bytes = base64ToUint8Array(base64Str);
        if (bytes.length > 0) {
          zip.file(`${mName}.xls`, bytes);
        }
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      // 保存记录到 score 表（并行发送，不逐个 await）
      const postNameStr = form.postName.join(', ');
      await Promise.all(selectedMajors.map(([majorId, majorName]) =>
        scoreApi.add({
          majorName,
          majorId,
          postName: postNameStr,
          file: `${majorName}.xls`,
        })
      ));

      progressPercent.value = 100;
      progressStatus.value = 'success';
      progressMessage.value = msg || '导出完成';
      message.success('多班级导出成功，共 ' + selectedMajors.length + ' 个班级');
      emits('reloadList');

      // 延迟关闭
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      smartSentry.captureError(err);
      progressError.value = err?.message || '获取导出结果失败';
      progressStatus.value = 'exception';
    }
  }

  // ---------- base64 解码（复用 grade-gpa.vue 中的逻辑） ----------
  function base64ToUint8Array(base64: string): Uint8Array {
    if (!base64) {
      console.error('base64ToUint8Array: invalid input', typeof base64, base64?.slice?.(0, 50));
      return new Uint8Array(0);
    }
    let clean = base64.replace(/[\s\r\n]/g, '');
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

  // ---------- 提交 ----------
  async function onSubmit() {
    try {
      await formRef.value!.validateFields();
      submitting.value = true;

      // 1. 校验至少选了一个班级
      const selectedMajors = parseSelectedMajors();
      if (selectedMajors.length === 0) {
        message.error('请选择至少一个班级');
        submitting.value = false;
        return;
      }

      // 2. 切换到进度步骤
      currentUuid = uuidv4();
      const postNameStr = form.postName.join(', ');
      step.value = 'progress';
      progressPercent.value = 0;
      progressStatus.value = 'active';
      progressMessage.value = '正在提交任务...';
      progressError.value = '';

      // 3. 提交到外部系统
      await scoreApi.submitMultiExcel(currentUuid, {
        postName: postNameStr,
        major: selectedMajors,
        courseAttributes: form.courseAttributes,
      });

      // 4. 开始轮询进度
      progressMessage.value = '后台处理中，请稍候...';
      submitting.value = false;
      startPolling();
    } catch (err) {
      submitting.value = false;
      // 校验失败或提交失败
      if (err && (err as any)?.errorFields) {
        message.error('参数验证错误，请仔细填写表单数据!');
      } else {
        smartSentry.captureError(err);
        message.error('提交失败，请重试');
        step.value = 'form';
      }
    }
  }

  /** 重试（进度出错时） */
  async function retrySubmit() {
    progressError.value = '';
    progressStatus.value = 'active';
    progressMessage.value = '重新提交中...';

    if (currentUuid) {
      // 先尝试直接获取结果（可能 result 已就绪）
      try {
        const resultRes: any = await scoreApi.getResult(currentUuid);
        const { code, msg, data } = resultRes || {};
        if (code !== 202 && data) {
          await handleResult(code, msg, data);
          return;
        }
      } catch {
        // 忽略，进入重新提交流程
      }
      // 结果仍未就绪，重新提交任务
      const selectedMajors = parseSelectedMajors();
      const postNameStr = form.postName.join(', ');
      try {
        await scoreApi.submitMultiExcel(currentUuid, {
          postName: postNameStr,
          major: selectedMajors,
        });
        progressMessage.value = '后台处理中，请稍候...';
        startPolling();
      } catch {
        message.error('重试失败');
      }
    }
  }

  // ---------- 生命周期 ----------
  function show() {
    Object.assign(form, formDefault);
    step.value = 'form';
    progressPercent.value = 0;
    progressStatus.value = 'active';
    progressMessage.value = '';
    progressError.value = '';
    currentUuid = '';
    visibleFlag.value = true;
    submitting.value = false;
    loadDropdownData();
    nextTick(() => {
      formRef.value?.clearValidate();
    });
  }

  /** 重新打开进度弹窗（后台运行时点击查看详情） */
  function showProgress() {
    visibleFlag.value = true;
    step.value = 'progress';
  }

  function onClose() {
    // 后台运行中：仅关闭弹窗，保留轮询，通知父组件显示进度条
    if (step.value === 'progress' && progressPercent.value > 0 && progressPercent.value < 100) {
      visibleFlag.value = false;
      emits('backgroundRun');
      return;
    }
    // 其他情况：完全重置
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (resultTimer) {
      clearInterval(resultTimer);
      resultTimer = null;
    }
    Object.assign(form, formDefault);
    step.value = 'form';
    progressPercent.value = 0;
    progressStatus.value = 'active';
    progressMessage.value = '';
    progressError.value = '';
    emits('progressChange', 0);
    visibleFlag.value = false;
  }

  defineExpose({ show, showProgress });
</script>
