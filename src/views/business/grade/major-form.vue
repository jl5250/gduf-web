<!--
 * 班级专业信息 弹窗表单
 *
 * @Author:
 * @Date:      2026-04-25
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <a-modal
    :title="form.id ? '编辑' : '新增'"
    width="600px"
    :open="visibleFlag"
    @cancel="onClose"
    :maskClosable="false"
    :destroyOnClose="true"
    forceRender
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }">
      <a-form-item label="年级编号" name="gradeId">
        <a-input style="width: 100%" v-model:value="form.gradeId" placeholder="如: 2022" :maxlength="5" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
<script setup lang="ts">
  import type { FormInstance } from 'ant-design-vue';
  import { reactive, ref, nextTick } from 'vue';
  import _ from 'lodash';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { majorApi } from '/@/api/business/grade/major-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const emits = defineEmits<{ (e: 'reloadList'): void }>();

  const visibleFlag = ref(false);
  const formRef = ref<FormInstance>();

  interface FormState {
    id: number | undefined;
    majorId: string | undefined;
    gradeId: string | undefined;
    majorEnid: string | undefined;
    majorName: string | undefined;
    majorCampus: string | undefined;
    majorSpecialized: string | undefined;
  }

  const formDefault: FormState = {
    id: undefined,
    majorId: undefined,
    gradeId: undefined,
    majorEnid: undefined,
    majorName: undefined,
    majorCampus: undefined,
    majorSpecialized: undefined,
  };

  const form: FormState = reactive({ ...formDefault });

  const rules: Record<string, any[]> = {
    gradeId: [{ required: true, message: '请输入年级编号' }],
  };

  function show(rowData?: FormState) {
    Object.assign(form, formDefault);
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
    }
    visibleFlag.value = true;
    nextTick(() => {
      formRef.value?.clearValidate();
      const domArr = document.getElementsByClassName('ant-modal');
      if (domArr && domArr.length > 0) {
        Array.from(domArr).forEach((item) => {
          if (item.childNodes && item.childNodes.length > 0) {
            Array.from(item.childNodes).forEach((child) => {
              if (child.setAttribute) {
                child.setAttribute('aria-hidden', 'false');
              }
            });
          }
        });
      }
    });
  }

  function onClose() {
    Object.assign(form, formDefault);
    visibleFlag.value = false;
  }

  async function onSubmit() {
    try {
      await formRef.value.validateFields();
      SmartLoading.show();
      try {
        if (form.id) {
          await majorApi.update(form);
          message.success('操作成功');
        } else {
          // 调用后端 scraper 抓取专业信息并自动写入 smart-admin（已包含去重逻辑）
          const extData = await majorApi.addMajor(form.gradeId);
          message.success(extData.msg || '操作成功');
        }
        emits('reloadList');
      } catch (err) {
        smartSentry.captureError(err);
      } finally {
        SmartLoading.hide();
        onClose();
      }
    } catch {
      message.error('参数验证错误，请仔细填写表单数据!');
    }
  }

  defineExpose({ show });
</script>
