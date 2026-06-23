/**
 * 班级专业信息表 api 封装
 *
 * @Author:    loong
 * @Date:      2026-04-25 17:37:50
 * @Copyright  gduf
 */
import { postRequest, getRequest } from '/@/lib/axios';
import gradeAxios from '/@/lib/grade-axios';

export const majorApi = {
  /**
   * 分页查询  @author  loong
   */
  queryPage: (param: { pageNum: number; pageSize: number; keywords?: string }) => {
    return postRequest('/major/queryPage', param);
  },

  /**
   * 增加  @author  loong
   */
  add: (param: { gradeId: string; majorId: string; majorEnid?: string; majorName: string; majorCampus?: string; majorSpecialized?: string }) => {
    return postRequest('/major/add', param);
  },

  /**
   * 修改  @author  loong
   */
  update: (param: {
    id: number;
    gradeId: string;
    majorId: string;
    majorEnid?: string;
    majorName: string;
    majorCampus?: string;
    majorSpecialized?: string;
  }) => {
    return postRequest('/major/update', param);
  },

  /**
   * 删除  @author  loong
   */
  delete: (id: number) => {
    return getRequest(`/major/delete/${id}`);
  },

  /**
   * 批量删除  @author  loong
   */
  batchDelete: (idList: number[]) => {
    return postRequest('/major/batchDelete', idList);
  },

  /**
   * 批量新增（去重）
   */
  addBatch: (itemList: any[]) => {
    return postRequest('/major/addBatch', itemList);
  },

  /**
   * 添加班级专业（向外部系统发送，仅传 gradeId）
   */
  addMajor: async (gradeId: string) => {
    const res = await gradeAxios.post('/addmajor', { gradeId });
    return res.data;
  },
};
