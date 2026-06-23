/*
 * 成绩管理 API
 *
 * @Author:
 * @Date:      2026-04-25
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */
import gradeAxios from '/@/lib/grade-axios';

export const gradeApi = {
  /**
   * 导出个人成绩单 - 返回 base64 编码的 PDF 数据
   * @param {string} xsxh 学号
   * @param {string} xsmc 姓名
   */
  exportPdf: async (xsxh: string, xsmc: string) => {
    const response = await gradeAxios.post('/addpdf', {
      xsxh,
      xsmc,
    });
    // 接口返回 base64 字符串（后端已处理：Buffer.from(r.data).toString('base64')）
    const resData = response.data;
    // 如果是 JSON 对象，尝试提取 data 字段
    if (typeof resData === 'object' && resData !== null) {
      return resData.data || resData;
    }
    // 如果是字符串，直接作为 base64 返回
    return resData;
  },

  /**
   * 成绩绩点计算 - 上传 Excel 文件，返回各分类 base64 编码的 Excel 数据
   * @param {File[]} files 上传的 Excel 文件列表
   * @param {boolean} determine 是否生成排名表
   */
  getGPA: async (files: File[], determine: boolean) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('file', file);
    });
    formData.append('determine', String(determine));

    const response = await gradeAxios.post('/getGPA', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
