// --- 文件: client/src/api/data.ts (请创建或替换此文件) ---
import api from '@/api';

// 定义学生数据类型接口，用于类型检查
export interface Student {
    id?: number;
    name: string;
    studentId: string;
    className: string;
    score: number | null;
    createdAt?: string; // 可选，因为创建时不需要
    updatedAt?: string; // 可选
}

// 获取学生列表
export const getStudentsAPI = () => api.get('/data');

// 新增一个学生
export const addStudentAPI = (student: Student) => api.post('/data', student);

// 更新一个学生
export const updateStudentAPI = (id: number, student: Student) => api.put(`/data/${id}`, student);

// 删除一个学生
export const deleteStudentAPI = (id: number) => api.delete(`/data/${id}`);

// 导入Excel文件
export const importStudentsAPI = (formData: FormData) => api.post('/data/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});

// 导出为Excel文件
export const exportStudentsAPI = () => api.get('/data/export', { responseType: 'blob' });
