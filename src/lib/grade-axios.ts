/*
 * 成绩服务 axios 封装（后端二：localhost:5000）
 *
 * 与 SmartAdmin 主后端（localhost:1024）组成双后端架构，
 * 开发环境通过 Vite 代理 /grade-service → localhost:5000
 *
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */
import axios from 'axios';

const gradeAxios = axios.create({
  baseURL: import.meta.env.VITE_APP_GRADE_API_URL || '/grade-service',
  timeout: 60000,
});

// ================================= 统一响应错误拦截 =================================
// 各调用方已各自处理错误提示（grade-gpa/grade-export 等会用 error.response + smartSentry toast），
// 队列监控轮询类请求（如 fetchStats）用 catch{} 会静默吞掉失败。
// 因此这里只做两件事，不改变任何调用方契约：
//   1) 统一打印错误日志 —— 让原先被 catch{} 静默吞掉的失败在控制台可见；
//   2) 原样 rethrow 原始 error —— 保留 .response/.message/.config，供调用方与 sentry 继续使用。
// 不做自动 toast、不替换 error：避免与页面自身的错误提示重复、避免丢失 response 细节。
gradeAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const method = error && error.config ? String(error.config.method || '').toUpperCase() : '';
    const url = error && error.config ? error.config.url : '';
    let detail = '';
    if (error && error.message === 'timeout') {
      detail = '成绩服务网络超时';
    } else if (error && error.message === 'Network Error') {
      detail = '成绩服务连接失败';
    } else if (error && error.response) {
      const bodyMsg = error.response.data && (error.response.data.msg || error.response.data.error);
      detail = bodyMsg ? String(bodyMsg) : `HTTP ${error.response.status}`;
    } else if (error && error.message) {
      detail = String(error.message);
    }
    console.error(`[grade-api] ${method} ${url} 请求失败: ${detail}`);
    return Promise.reject(error);
  }
);

export const gradeGetRequest = (url, params) => {
  return gradeAxios.request({ url, method: 'get', params });
};

export const gradePostRequest = (url, data) => {
  return gradeAxios.request({ url, data, method: 'post' });
};

export default gradeAxios;
