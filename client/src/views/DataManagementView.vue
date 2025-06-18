/*
 * =================================================================
 * 3. 数据管理页面 (`client/src/views/`)
 * 采用了新的Flexbox布局，以完美实现固定表头的内部滚动。
 * (已重新启用 onBeforeRouteUpdate 策略来处理组件复用)
 * =================================================================
 */

// --- 文件: client/src/views/DataManagementView.vue (请替换此文件) ---
<template>
  <div class="data-management-page">
    <!-- 1. 顶部控制区 -->
    <div class="page-controls">
      <span class="header-title">学生数据管理</span>
      <div class="button-group">
        <el-input v-model="searchQuery" placeholder="按姓名、学号或班级搜索" clearable :prefix-icon="Search" class="search-input" />
        <el-button type="primary" :icon="Plus" @click="handleAdd" class="animated-button">新增</el-button>
        <el-upload :show-file-list="false" :http-request="handleImport" accept=".xlsx, .xls">
          <el-button :icon="Upload" :loading="importing" plain class="animated-button">导入</el-button>
        </el-upload>
        <el-button :icon="Download" @click="handleExport" plain class="animated-button">导出</el-button>
        <el-tooltip :content="showActionsColumn ? '隐藏操作列' : '显示操作列'" placement="top">
          <el-button @click="showActionsColumn = !showActionsColumn" :icon="showActionsColumn ? Hide : View" circle />
        </el-tooltip>
      </div>
    </div>

    <!-- 2. 表格区域 -->
    <el-card class="table-card">
      <el-table :data="paginatedStudents" v-loading="loading" border stripe height="100%" @row-click="handleRowClick" :row-class-name="tableRowClassName">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="studentId" label="学号" min-width="150" />
        <el-table-column prop="className" label="班级" min-width="150" />
        <el-table-column prop="score" label="成绩" sortable align="center" width="120" />
        <el-table-column v-if="showActionsColumn" label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="编辑" placement="top">
              <el-button type="primary" :icon="Edit" @click.stop="handleEdit(row)" text circle></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button type="danger" :icon="Delete" @click.stop="handleDelete(row.id)" text circle></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据，请尝试新增或导入" />
        </template>
      </el-table>
    </el-card>

    <!-- 3. 分页区域 -->
    <div class="pagination-container">
      <el-pagination v-if="filteredStudents.length > 0" background :small="isSmallScreen" layout="total, sizes, prev, pager, next, jumper" :total="filteredStudents.length" v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]" />
    </div>
  </div>

  <!-- 新增/编辑对话框 -->
  <el-dialog v-model="dialogVisible" :title="isEditMode ? '编辑学生信息' : '新增学生'" :width="dialogWidth" @close="resetForm" draggable>
    <el-form :model="currentStudent" :rules="formRules" ref="studentFormRef" label-width="80px">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="currentStudent.name" placeholder="请输入学生姓名" />
      </el-form-item>
      <el-form-item label="学号" prop="studentId">
        <el-input v-model="currentStudent.studentId" placeholder="请输入学号" />
      </el-form-item>
      <el-form-item label="班级" prop="className">
        <el-input v-model="currentStudent.className" placeholder="请输入班级" />
      </el-form-item>
      <el-form-item label="成绩" prop="score">
        <el-input-number v-model="currentStudent.score" :min="0" :max="150" placeholder="请输入成绩" style="width: 100%;" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import {
    ref,
    onMounted,
    onUnmounted,
    computed,
    reactive,
    watch
  } from 'vue';
  import { onBeforeRouteUpdate } from 'vue-router'; // (已重新引入)
  import {
    getStudentsAPI,
    addStudentAPI,
    updateStudentAPI,
    deleteStudentAPI,
    importStudentsAPI,
    exportStudentsAPI,
    type Student
  } from '@/api/data';
  import {
    ElMessage,
    ElMessageBox
  } from 'element-plus';
  import {
    Upload,
    Download,
    Plus,
    Edit,
    Delete,
    Search,
    View,
    Hide
  } from '@element-plus/icons-vue';
  import type {
    FormInstance,
    FormRules
  } from 'element-plus';

  const allStudents = ref < Student[] > ([]);
  const loading = ref(false);
  const importing = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const searchQuery = ref('');
  const showActionsColumn = ref(true);
  const highlightedRowId = ref < number | null > (null);

  const dialogVisible = ref(false);
  const isEditMode = ref(false);
  const studentFormRef = ref < FormInstance > ();
  const initialFormState: Student = {
    name: '',
    studentId: '',
    className: '',
    score: null
  };
  let currentStudent = reactive < Student > ({ ...initialFormState
  });
  const formRules = reactive < FormRules > ({
    name: [{
      required: true,
      message: '学生姓名不能为空',
      trigger: 'blur'
    }],
    score: [{
      required: true,
      message: '学生成绩不能为空',
      trigger: 'blur'
    }],
  });

  const screenWidth = ref(window.innerWidth);
  const isSmallScreen = computed(() => screenWidth.value < 768);
  const dialogWidth = computed(() => (isSmallScreen.value ? '90%' : '500px'));
  const updateScreenWidth = () => {
    screenWidth.value = window.innerWidth;
  };

  const filteredStudents = computed(() => {
    if (!searchQuery.value) return allStudents.value;
    const query = searchQuery.value.toLowerCase();
    return allStudents.value.filter(student =>
      student.name.toLowerCase().includes(query) ||
      (student.studentId && student.studentId.toLowerCase().includes(query)) ||
      (student.className && student.className.toLowerCase().includes(query))
    );
  });
  const paginatedStudents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredStudents.value.slice(start, end);
  });

  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  const handleRowClick = (row: Student) => {
    if (highlightedRowId.value === row.id) {
      highlightedRowId.value = null;
    } else {
      highlightedRowId.value = row.id!;
    }
  };
  const tableRowClassName = ({
    row
  }: {
    row: Student
  }) => {
    if (row.id === highlightedRowId.value) {
      return 'highlighted-row';
    }
    return '';
  };

  const fetchStudents = async () => {
    loading.value = true;
    try {
      const res = await getStudentsAPI();
      allStudents.value = res.data;
    } finally {
      loading.value = false;
    }
  };
  const handleAdd = () => {
    isEditMode.value = false;
    resetForm();
    dialogVisible.value = true;
  };
  const handleEdit = (row: Student) => {
    isEditMode.value = true;
    Object.assign(currentStudent, row);
    dialogVisible.value = true;
  };
  const handleDelete = async (id: number) => {
    try {
      await ElMessageBox.confirm('您确定要永久删除这条数据吗?', '危险操作', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      });
      await deleteStudentAPI(id);
      ElMessage.success('删除成功');
      fetchStudents();
    } catch (e) {
      console.log('删除操作已取消');
    }
  };
  const resetForm = () => {
    Object.assign(currentStudent, initialFormState);
    studentFormRef.value?.clearValidate();
  };
  const submitForm = async () => {
    if (!studentFormRef.value) return;
    await studentFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (isEditMode.value) {
            await updateStudentAPI(currentStudent.id!, currentStudent);
            ElMessage.success('更新成功');
          } else {
            await addStudentAPI(currentStudent);
            ElMessage.success('新增成功');
          }
          dialogVisible.value = false;
          fetchStudents();
        } catch (e) {
          ElMessage.error('操作失败');
        }
      }
    });
  };
  const handleImport = async (options: {
    file: File
  }) => {
    const formData = new FormData();
    formData.append('file', options.file);
    importing.value = true;
    try {
      await importStudentsAPI(formData);
      ElMessage.success('导入成功！');
      fetchStudents();
    } finally {
      importing.value = false;
    }
  };
  const handleExport = async () => {
    try {
      const res = await exportStudentsAPI();
      const blob = new Blob([res.data], {
        type: res.headers['content-type']
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `students_export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      ElMessage.success('导出任务已开始');
    } catch (e) {
      ElMessage.error('导出失败');
    }
  };

  // 在组件挂载时获取初始数据
  onMounted(() => {
    fetchStudents();
    window.addEventListener('resize', updateScreenWidth);
  });

  // 在组件卸载时清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', updateScreenWidth);
  });

  // (已重新引入) onBeforeRouteUpdate 守卫
  // 当组件被复用时 (例如，从 /data/class-1 导航到 /data/class-2),
  // 这个守卫会被触发，从而重新加载数据。
  onBeforeRouteUpdate(async (to, from) => {
    if (to.path !== from.path) {
      await fetchStudents();
      // 重置页面状态以获得干净的视图
      currentPage.value = 1;
      searchQuery.value = '';
      highlightedRowId.value = null;
    }
  });
</script>

<style scoped>
  /* (已重构) 使用Flexbox构建页面布局 */
  .data-management-page {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .page-controls {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    background-color: #fff;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .header-title {
    font-size: 1.2rem;
    font-weight: 600;
  }

  .button-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .search-input {
    width: 240px;
  }

  .animated-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  /* (已重构) 表格卡片现在是可伸缩的核心 */
  .table-card {
    flex-grow: 1;
    /* 占据所有剩余空间 */
    overflow: hidden;
    /* 防止其子元素溢出 */
    display: flex;
    flex-direction: column;
  }

  :deep(.el-card__body) {
    flex-grow: 1;
    padding: 0;
    /* 移除内边距，让表格完全填充 */
    overflow: hidden;
  }

  .pagination-container {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    margin-top: 20px;
  }

  .fade-in-enter-active {
    transition: opacity 0.5s ease;
  }

  .fade-in-enter-from {
    opacity: 0;
  }

  :deep(.el-table__row) {
    transition: all 0.2s ease-in-out;
    cursor: pointer;
  }

  :deep(.el-table__row.highlighted-row) {
    transform: scale(1.015);
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
    background-color: var(--el-color-primary-light-9) !important;
    z-index: 10;
  }

  @media (max-width: 768px) {
    .page-controls {
      flex-direction: column;
      align-items: stretch;
    }
    .pagination-container {
      justify-content: center;
    }
  }
</style>
