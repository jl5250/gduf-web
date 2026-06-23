/**
 * 成绩导出记录表 api 封装
 *
 * @Author:    loong
 * @Date:      2026-04-25 20:34:01
 * @Copyright  gduf
 */
import { postRequest, getRequest } from '/@/lib/axios';
import gradeAxios from '/@/lib/grade-axios';

/** 保存时提交的参数 */
export interface ScoreAddParam {
  majorName: string;
  majorId?: string;
  postName: string;
  file?: string;
  courseAttributes?: string;
}

/** 分页查询参数 */
export interface ScoreQueryParam {
  pageNum: number;
  pageSize: number;
  keywords?: string;
}

export const scoreApi = {
  /**
   * 分页查询  @author  loong
   */
  queryPage: (param: ScoreQueryParam) => {
    return postRequest('/score/queryPage', param);
  },

  /**
   * 增加  @author  loong
   */
  add: (param: ScoreAddParam) => {
    return postRequest('/score/add', param);
  },

  /**
   * 删除  @author  loong
   */
  delete: (id: number) => {
    return getRequest(`/score/delete/${id}`);
  },

  /**
   * 批量删除  @author  loong
   */
  batchDelete: (idList: number[]) => {
    return postRequest('/score/batchDelete', idList);
  },

  /**
   * 获取所有班级信息（名称 + 编号，从 t_major 表）
   */
  listAllMajor: () => {
    return getRequest('/major/listAllMajor');
  },

  /**
   * 获取所有班级信息（含 gradeId），用于多班级导出时按年级分组
   */
  listAllWithGrade: () => {
    return getRequest('/major/listAllWithGrade');
  },

  /**
   * 获取学年学期列表（从外部系统）
   */
  listSemesters: async () => {
    const res = await gradeAxios.get('/listmajor');
    return res.data;
  },

  /**
   * 获取课程属性列表（从外部系统动态获取）
   */
  listCourseAttributes: async () => {
    const res = await gradeAxios.get('/listCourseAttributes');
    return res.data;
  },

  /** 班级导出统计 */
  exportStats: () => {
    return getRequest('/score/exportStats');
  },

  /** 课程属性使用分布 */
  attributeStats: () => {
    return getRequest('/score/attributeStats');
  },

  /**
   * 提交导出到外部系统（单个班级）
   */
  submitExcel: async (params: { majorName: string; majorId: string; postName: string; courseAttributes?: string[] }) => {
    const res = await gradeAxios.post('/getExcel', params);
    return res.data;
  },

  /**
   * 提交多班级导出到外部系统（异步，带进度）
   * @param uuid 前端生成的 UUID
   * @param params postName + major [[majorId, majorName], ...] + courseAttributes
   */
  submitMultiExcel: async (uuid: string, params: { postName: string; major: [string, string][]; courseAttributes?: string[] }) => {
    const res = await gradeAxios.post(`/getExcel1/${uuid}`, params);
    return res.data;
  },

  /**
   * 查询多班级导出进度
   * @param uuid 前端生成的 UUID
   * @returns { data: "0" ~ "100" }
   */
  getProgress: async (uuid: string) => {
    const res = await gradeAxios.get(`/getProgress/${uuid}`);
    return res.data;
  },

  /**
   * 获取多班级导出结果
   * @param uuid 前端生成的 UUID
   * @returns { code: 200, msg: string, data: string[] }  data 为 base64 xlsx 数组
   */
  getResult: async (uuid: string) => {
    const res = await gradeAxios.get(`/getResult/${uuid}`);
    return res.data;
  },
};
