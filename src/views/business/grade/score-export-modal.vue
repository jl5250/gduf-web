<!--
 * 统一成绩导出弹窗（单班级 + 多班级）
 *
 * @Author: loong
 * @Date: 2026-06-17
 * @Copyright gduf
-->
<template>
  <a-modal
    :title="isMulti ? '多班级成绩导出' : '单班级成绩导出'"
    width="700px"
    :open="visibleFlag"
    @cancel="onClose"
    :maskClosable="false"
    :destroyOnClose="true"
    forceRender
  >
    <!-- ====== 步骤1：表单填写 ====== -->
    <div v-if="step === 'form'">
      <!-- 下拉数据预加载中：数据就绪后自动切到表单，无需二次打开 -->
      <div v-if="dataLoading" class="score-export-dropdown-loading">
        <a-spin size="large" tip="下拉数据加载中，请稍候..." />
      </div>

      <!-- 下拉数据加载失败：给出重试入口 -->
      <a-alert
        v-else-if="loadError"
        type="error"
        show-icon
        message="下拉数据加载失败"
        description="学年学期 / 班级 / 课程属性 数据未能加载，请确认外部服务可用后重试。"
      >
        <template #action>
          <a-button size="small" type="primary" @click="ensureDropdownData">重新加载</a-button>
        </template>
      </a-alert>

      <!-- 数据已就绪再渲染表单，此时各下拉框自带数据 -->
      <a-form v-else ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }">
        <a-form-item label="学年学期" name="postName">
          <a-select
            style="width: 100%"
            mode="multiple"
            v-model:value="form.postName"
            :options="semesterData.data.value || []"
            placeholder="请选择学年学期（可多选）"
          />
        </a-form-item>

        <!-- 班级选择：单班级用 select，多班级用 tree-select -->
        <a-form-item label="选择班级" :name="isMulti ? 'major' : 'majorName'">
          <!-- 单班级 -->
          <a-select
            v-if="!isMulti"
            style="width: 100%"
            v-model:value="form.majorName"
            :options="singleMajorData.data.value || []"
            placeholder="请选择班级"
            show-search
            :filter-option="filterMajorOption"
            allowClear
          />
          <!-- 多班级 -->
          <a-tree-select
            v-else
            style="width: 100%"
            v-model:value="form.major"
            :tree-data="majorTreeData"
            multiple
            tree-checkable
            placeholder="请选择班级（按年级→专业→班级）"
            allow-clear
            :max-tag-count="6"
          />
        </a-form-item>

        <!-- 课程属性：随弹窗一起预加载 -->
        <a-form-item label="课程属性">
          <a-select
            style="width: 100%"
            mode="multiple"
            v-model:value="form.courseAttributes"
            :options="attrData.data.value || []"
            placeholder="默认排除通识选修（可多选）"
            allowClear
          />
        </a-form-item>
      </a-form>
    </div>

    <!-- ====== 步骤2：导出进度（仅多班级） ====== -->
    <div v-else-if="step === 'progress'" style="padding: 24px 0; text-align: center;">
      <a-progress
        type="circle"
        :percent="progressPercent"
        :status="progressStatus"
        :stroke-color="progressPercent >= 100 ? '#52c41a' : undefined"
      />
      <p style="margin-top: 16px; color: #666;">{{ progressMessage }}</p>
      <p v-if="progressPercent >= 0 && progressPercent < 100" style="color: #999; font-size: 12px;">
        正在后台并发处理，请耐心等待...
      </p>
      <p v-if="progressError" style="color: #ff4d4f; margin-top: 8px;">{{ progressError }}</p>
    </div>

    <template #footer>
      <a-space>
        <a-button @click="onClose">
          {{ step === 'progress' && progressPercent < 100 ? '后台运行' : '取消' }}
        </a-button>
        <a-button v-if="step === 'form'" type="primary" @click="onSubmit" :loading="submitting" :disabled="dataLoading || loadError">
          {{ isMulti ? '开始导出' : '导出' }}
        </a-button>
        <a-button v-if="step === 'progress' && progressError" type="primary" @click="retrySubmit">
          重试
        </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
  import type { FormInstance } from 'ant-design-vue';
  import { reactive, ref, computed, nextTick, onUnmounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { scoreApi } from '/@/api/business/grade/score-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { useDropdownCache } from '/@/composables/useDropdownCache';
  import JSZip from 'jszip';
  import { v4 as uuidv4 } from 'uuid';
  import dayjs from 'dayjs';

  const props = defineProps<{ mode: 'single' | 'multi' }>();
  const emits = defineEmits<{
    (e: 'reloadList'): void;
    (e: 'progressChange', percent: number): void;
    (e: 'backgroundRun'): void;
  }>();

  const isMulti = computed(() => props.mode === 'multi');

  // ==================== 缓存下拉数据 ====================

  const semesterData = useDropdownCache<{ label: string; value: string }[]>('semesters', async () => {
    const res: any = await scoreApi.listSemesters();
    const rawList: string[] = res?.data?.[0] || [];
    return rawList.map((s) => ({ label: s, value: s }));
  });

  // 单班级和多班级用不同的缓存 key
  const singleMajorData = useDropdownCache<any[]>('majors_single', async () => {
    const res = await scoreApi.listAllMajor();
    const list: { major_name: string; major_id: string }[] = (res as any)?.data || [];
    return list.map((item) => ({
      label: item.major_name,
      value: item.major_name,
      majorId: item.major_id,
    })).sort((a, b) => {
      const yearA = parseInt(a.label.match(/\d{4}/)?.[0] || '0');
      const yearB = parseInt(b.label.match(/\d{4}/)?.[0] || '0');
      return yearB - yearA;
    });
  });

  const multiMajorData = useDropdownCache<any[]>('majors_multi', async () => {
    const res = await scoreApi.listAllWithGrade();
    return (res as any)?.data || [];
  });

  const attrData = useDropdownCache<{ label: string; value: string }[]>('courseAttributes', async () => {
    const res: any = await scoreApi.listCourseAttributes();
    return res?.data || [];
  });

  // ==================== 多班级树形数据 ====================

  const majorTreeData = computed(() => {
    const list = multiMajorData.data.value || [];
    if (!list.length || isMulti.value === false) return [];

    const gradeGroups = new Map<string, any[]>();
    list.forEach((item: any) => {
      if (!gradeGroups.has(item.gradeId)) gradeGroups.set(item.gradeId, []);
      gradeGroups.get(item.gradeId)!.push(item);
    });

    return Array.from(gradeGroups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([gradeId, majors]) => {
        const specGroups = new Map<string, any[]>();
        majors.forEach((m: any) => {
          const spec = m.majorSpecialized || '未分类';
          if (!specGroups.has(spec)) specGroups.set(spec, []);
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
              children: specMajors.map((m: any) => {
                const leafValue = JSON.stringify([m.majorId, m.majorName]);
                return { title: m.majorName, value: leafValue, key: leafValue };
              }),
            })),
        };
      });
  });

  // ==================== 班级搜索过滤 ====================

  function filterMajorOption(input: string, option: any) {
    return option.label.toLowerCase().includes(input.toLowerCase());
  }

  // ==================== 表单 ====================

  const visibleFlag = ref(false);
  const formRef = ref<FormInstance>();
  const submitting = ref(false);
  const step = ref<'form' | 'progress'>('form');
  const progressPercent = ref(0);
  const progressStatus = ref<'active' | 'success' | 'exception'>('active');
  const progressMessage = ref('');
  const progressError = ref('');

  // ==================== 下拉数据预加载 ====================

  const dataLoading = ref(false);
  const loadError = ref(false);
  let dropdownLoadPromise: Promise<boolean> | null = null;

  /** 当前模式所需的全部下拉数据是否已就绪 */
  function datasetsReady(): boolean {
    const semesters = (semesterData.data.value || []) as any[];
    const attrs = (attrData.data.value || []) as any[];
    const majors = isMulti.value
      ? ((multiMajorData.data.value || []) as any[])
      : ((singleMajorData.data.value || []) as any[]);
    return semesters.length > 0 && attrs.length > 0 && majors.length > 0;
  }

  /**
   * 预加载本次模式所需的全部下拉数据（命中缓存则立即返回）。
   * 数据未就绪前置 dataLoading=true 显示加载动画；并发调用共享同一个请求。
   */
  function ensureDropdownData(): Promise<boolean> {
    if (datasetsReady()) {
      loadError.value = false;
      return Promise.resolve(true);
    }
    loadError.value = false;
    if (dropdownLoadPromise) return dropdownLoadPromise;

    dataLoading.value = true;
    dropdownLoadPromise = Promise.all([
      semesterData.load(),
      attrData.load(),
      isMulti.value ? multiMajorData.load() : singleMajorData.load(),
    ])
      .then(() => {
        loadError.value = !datasetsReady();
        return !loadError.value;
      })
      .finally(() => {
        dataLoading.value = false;
        dropdownLoadPromise = null;
      });
    return dropdownLoadPromise;
  }

  /** 数据就绪后，默认勾选“除通识选修外的全部课程属性” */
  function applyAttrDefaults() {
    const attrs = (attrData.data.value || []) as any[];
    if (form.courseAttributes.length === 0 && attrs.length > 0) {
      form.courseAttributes = attrs
        .filter((a) => a.label !== '通识选修')
        .map((a) => a.value);
    }
  }

  interface FormState {
    postName: string[];
    majorName: string | undefined;
    major: string[];
    courseAttributes: string[];
  }

  const formDefault: FormState = {
    postName: [],
    majorName: undefined,
    major: [],
    courseAttributes: [],
  };

  const form: FormState = reactive({ ...formDefault });

  const rules: Record<string, any[]> = {
    postName: [{ required: true, message: '请选择学年学期', type: 'array' }],
    majorName: [{ required: true, message: '请选择班级' }],
    major: [{ required: true, message: '请选择至少一个班级', type: 'array' }],
  };

  // ==================== 生命周期 ====================

  async function show() {
    Object.assign(form, formDefault);
    step.value = 'form';
    progressPercent.value = 0;
    progressStatus.value = 'active';
    progressMessage.value = '';
    progressError.value = '';
    visibleFlag.value = true;
    submitting.value = false;

    // 预加载学年学期 / 班级 / 课程属性：
    // 首次打开先显示加载动画，数据全部就绪后才渲染表单并应用默认值，避免二次打开才有数据
    await ensureDropdownData();
    applyAttrDefaults();
    await nextTick();
    formRef.value?.clearValidate();
  }

  function onClose() {
    if (step.value === 'progress' && progressPercent.value > 0 && progressPercent.value < 100) {
      visibleFlag.value = false;
      emits('backgroundRun');
      return;
    }
    clearPolling();
    Object.assign(form, formDefault);
    step.value = 'form';
    visibleFlag.value = false;
    emits('progressChange', 0);
  }

  // ==================== 单班级导出 ====================

  async function submitSingle() {
    await formRef.value!.validateFields();
    submitting.value = true;
    SmartLoading.show();

    try {
      const majorOpts = (singleMajorData.data.value || []) as any[];
      const selected = majorOpts.find((o) => o.value === form.majorName);
      const majorId = selected?.majorId || '';
      const postNameStr = form.postName.join(', ');

      // postName 传数组（可多选多个学年学期），由后端按 xnxq=a&xnxq=b 逐学期提交
      const extRes: any = await scoreApi.submitExcel({
        majorName: form.majorName!,
        majorId,
        postName: form.postName,
        courseAttributes: form.courseAttributes,
      });

      const base64Str: string = extRes?.data || extRes || '';
      if (!base64Str) throw new Error('外部系统未返回文件数据');

      downloadBase64(base64Str, `${form.majorName}.xls`);

      await scoreApi.add({
        majorName: form.majorName!,
        majorId,
        postName: postNameStr,
        file: `${form.majorName}.xls`,
        courseAttributes: form.courseAttributes?.join(','),
      });

      message.success('导出成功');
      emits('reloadList');
      onClose();
    } catch (err: any) {
      smartSentry.captureError(err);
      const msg = err?.response?.data?.msg || err?.message || '请稍后重试';
      message.error(`导出失败：${msg}`);
    } finally {
      SmartLoading.hide();
      submitting.value = false;
    }
  }

  // ==================== 多班级导出 ====================

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let resultTimer: ReturnType<typeof setInterval> | null = null;
  let currentUuid = '';

  // 轮询保护：连续失败 / 超过总时长后停止轮询，避免后端异常时无限请求
  const MAX_POLL_FAILURES = 10; // 连续失败 10 次（约 20 秒）
  const MAX_POLL_DURATION_MS = 10 * 60 * 1000; // 最长轮询 10 分钟
  let pollFailCount = 0;
  let pollStartAt = 0;

  /** 停止轮询并把界面切换到可重试的异常态 */
  function stopPollingWithError(errorMsg: string) {
    clearPolling();
    progressError.value = errorMsg;
    progressStatus.value = 'exception';
  }

  function parseSelectedMajors(): [string, string][] {
    return (form.major || [])
      .map((v) => { try { return JSON.parse(v) as [string, string]; } catch { return null; } })
      .filter((v): v is [string, string] => v !== null);
  }

  async function submitMulti() {
    await formRef.value!.validateFields();
    const selectedMajors = parseSelectedMajors();
    if (selectedMajors.length === 0) {
      message.error('请选择至少一个班级');
      return;
    }

    submitting.value = true;
    currentUuid = uuidv4();
    step.value = 'progress';
    progressPercent.value = 0;
    progressStatus.value = 'active';
    progressMessage.value = '正在提交任务...';
    progressError.value = '';

    try {
      await scoreApi.submitMultiExcel(currentUuid, {
        postName: form.postName, // 数组，可多选多个学年学期
        major: selectedMajors,
        courseAttributes: form.courseAttributes,
      });
      progressMessage.value = '后台处理中，请稍候...';
      submitting.value = false;
      startPolling();
    } catch (err) {
      submitting.value = false;
      smartSentry.captureError(err);
      message.error('提交失败，请重试');
      step.value = 'form';
    }
  }

  function startPolling() {
    pollFailCount = 0;
    pollStartAt = Date.now();
    pollTimer = setInterval(async () => {
      if (Date.now() - pollStartAt > MAX_POLL_DURATION_MS) {
        stopPollingWithError('导出超时，请稍后重试');
        return;
      }
      try {
        const res: any = await scoreApi.getProgress(currentUuid);
        pollFailCount = 0;
        const pct = parseInt(String(res?.data ?? '0'), 10);
        progressPercent.value = isNaN(pct) ? 0 : pct;
        emits('progressChange', progressPercent.value);

        if (pct >= 100) {
          clearInterval(pollTimer!);
          pollTimer = null;
          progressMessage.value = '处理完成，正在获取结果...';
          startResultPolling();
        }
      } catch (err) {
        pollFailCount += 1;
        smartSentry.captureError(err);
        if (pollFailCount >= MAX_POLL_FAILURES) {
          stopPollingWithError('进度查询持续失败，已停止轮询，请重试');
        }
      }
    }, 2000);
  }

  function startResultPolling() {
    if (resultTimer) return;
    pollFailCount = 0;
    resultTimer = setInterval(async () => {
      if (Date.now() - pollStartAt > MAX_POLL_DURATION_MS) {
        stopPollingWithError('获取导出结果超时，请重试');
        return;
      }
      try {
        const resultRes: any = await scoreApi.getResult(currentUuid);
        pollFailCount = 0;
        const { code, msg, data } = resultRes || {};
        if (code === 202 || !data) return;

        clearInterval(resultTimer!);
        resultTimer = null;
        await handleMultiResult(code, msg, data);
      } catch (err) {
        pollFailCount += 1;
        smartSentry.captureError(err);
        if (pollFailCount >= MAX_POLL_FAILURES) {
          stopPollingWithError('结果查询持续失败，已停止轮询，请重试');
        }
      }
    }, 2000);
  }

  async function handleMultiResult(code: number, msg: string, data: any) {
    try {
      if (code !== 200 && code !== 207) throw new Error(msg || '导出失败');

      const selectedMajors = parseSelectedMajors();
      const base64List: string[] = Array.isArray(data) ? data : [];

      const zip = new JSZip();
      base64List.forEach((base64Str, index) => {
        if (!base64Str) return;
        const [, mName] = selectedMajors[index] || [`class_${index}`, `班级${index + 1}`];
        const bytes = base64ToUint8Array(base64Str);
        if (bytes.length > 0) zip.file(`${mName}.xls`, bytes);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `成绩导出_${dayjs().format('YYYYMMDD_HHmmss')}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      const postNameStr = form.postName.join(', ');
      // 记录保存失败不应把已成功的导出标为失败（文件已下载），逐条尽力写入即可
      const saveResults = await Promise.allSettled(selectedMajors.map(([majorId, majorName]) =>
        scoreApi.add({
          majorName,
          majorId,
          postName: postNameStr,
          file: `${majorName}.xls`,
          courseAttributes: form.courseAttributes?.join(','),
        })
      ));
      const saveFailed = saveResults.filter((r) => r.status === 'rejected').length;
      if (saveFailed > 0) {
        message.warning(`${saveFailed} 条导出记录保存失败，不影响已下载文件`);
      }

      progressPercent.value = 100;
      progressStatus.value = 'success';
      progressMessage.value = msg || '导出完成';
      message.success(`多班级导出成功，共 ${selectedMajors.length} 个班级`);
      emits('reloadList');
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      progressError.value = err?.message || '获取导出结果失败';
      progressStatus.value = 'exception';
    }
  }

  async function retrySubmit() {
    progressError.value = '';
    progressStatus.value = 'active';
    progressMessage.value = '重新提交中...';
    if (!currentUuid) return;

    try {
      const resultRes: any = await scoreApi.getResult(currentUuid);
      if (resultRes?.code !== 202 && resultRes?.data) {
        await handleMultiResult(resultRes.code, resultRes.msg, resultRes.data);
        return;
      }
    } catch { /* ignore */ }

    const selectedMajors = parseSelectedMajors();
    try {
      await scoreApi.submitMultiExcel(currentUuid, {
        postName: form.postName, // 数组，可多选多个学年学期
        major: selectedMajors,
        courseAttributes: form.courseAttributes,
      });
      progressMessage.value = '后台处理中，请稍候...';
      startPolling();
    } catch {
      message.error('重试失败');
    }
  }

  // ==================== 通用工具 ====================

  // 组件卸载时清掉轮询定时器，避免离开页面后仍每 2 秒请求后端
  onUnmounted(() => {
    clearPolling();
  });

  function clearPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (resultTimer) { clearInterval(resultTimer); resultTimer = null; }
  }

  async function onSubmit() {
    try {
      await formRef.value!.validateFields();
    } catch {
      message.error('参数验证错误，请仔细填写表单数据!');
      return;
    }

    if (isMulti.value) {
      await submitMulti();
    } else {
      await submitSingle();
    }
  }

  function downloadBase64(base64: string, fileName: string) {
    const bytes = base64ToUint8Array(base64);
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function base64ToUint8Array(base64: string): Uint8Array {
    if (!base64) return new Uint8Array(0);
    let clean = base64.replace(/[\s\r\n]/g, '');
    clean = clean.replace(/[^A-Za-z0-9+/=]/g, '');
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
      } catch {
        return new Uint8Array(0);
      }
    }
  }

  /**
   * 后台运行后重新打开弹窗查看进度（供列表页“查看详情”调用）。
   * 后台运行期间轮询并未中断（onClose 走 backgroundRun 分支），重新显示即可；
   * 若轮询已因异常停止，界面处于 exception 态并带有“重试”按钮。
   */
  function showProgress() {
    if (!currentUuid) return;
    visibleFlag.value = true;
  }

  defineExpose({ show, showProgress });
</script>

<style scoped>
  .score-export-dropdown-loading {
    padding: 48px 0;
    text-align: center;
  }
</style>
