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

export const gradeGetRequest = (url, params) => {
  return gradeAxios.request({ url, method: 'get', params });
};

export const gradePostRequest = (url, data) => {
  return gradeAxios.request({ url, data, method: 'post' });
};

export default gradeAxios;
