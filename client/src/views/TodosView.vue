/*
 * =================================================================
 * 待办事项页面 (`client/src/views/`)
 * 说明: 增加了悬停预览Markdown内容的功能。
 * =================================================================
 */

// --- 文件: client/src/views/TodosView.vue  ---
<template>
  <div class="todos-view">
    <!-- 1. 日历视图 -->
    <el-card class="calendar-card">
      <el-calendar v-model="selectedDate">
        <template #header="{ date }">
          <div class="calendar-header">
            <span>{{ date }}</span>
            <div class="calendar-actions">
              <el-tooltip content="导入Markdown">
                <el-upload :show-file-list="false" :before-upload="handleBeforeUpload" accept=".md">
                  <el-button :icon="Upload" circle />
                </el-upload>
              </el-tooltip>
              <el-tooltip content="导出当天待办为Markdown">
                <el-button :icon="Download" @click="handleExport" circle />
              </el-tooltip>
            </div>
          </div>
        </template>
        <template #date-cell="{ data }">
          <div class="date-cell" :class="{ 'is-selected': isSelected(data) }">
            <p class="calendar-day">{{ data.day.split('-').slice(2).join('') }}</p>
            <div v-if="getTodosForDay(data.day).length > 0" class="todo-summary">
              <div class="todo-summary-item">
                <div class="todo-marker" :class="`priority-${getTodosForDay(data.day)[0].priority}`"></div>
                <span>{{ getTodosForDay(data.day)[0].title }}</span>
              </div>
              <div v-if="getTodosForDay(data.day).length > 1" class="todo-summary-more">
                + {{ getTodosForDay(data.day).length - 1 }} more
              </div>
            </div>
          </div>
        </template>
      </el-calendar>
    </el-card>

    <!-- 2. 当日待办事项列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="list-header">
          <span>{{ formattedSelectedDate }} 的待办事项</span>
          <el-button type="primary" :icon="Plus" @click="handleOpenDialog()">新增待办</el-button>
        </div>
      </template>

      <el-skeleton :rows="3" animated v-if="isLoadingDate" />

      <div class="todo-list" v-else>
        <el-empty v-if="!currentTodos.length" description="今天没有待办事项，轻松一下吧！"></el-empty>
        <transition-group name="todo-list-anim" tag="div">
          <div v-for="todo in currentTodos" :key="todo.id" class="todo-item" @click="handleOpenDialog(todo)">
              <el-checkbox :model-value="todo.status === 'completed'" @change="toggleStatus(todo)" @click.stop/>

              <!-- (新增) Popover for Markdown Preview -->
              <el-popover
                placement="right"
                :width="400"
                trigger="hover"
                :disabled="!todo.content"
              >
                <template #reference>
                  <span class="todo-title" :class="{completed: todo.status === 'completed'}">{{ todo.title }}</span>
                </template>
                <div class="markdown-preview-container">
                  <v-md-preview :text="todo.content"></v-md-preview>
                </div>
              </el-popover>

              <div class="flex-grow" />
              <el-tag :type="priorityMap[todo.priority].type" size="small" effect="light">{{ priorityMap[todo.priority].label }}</el-tag>
              <el-button type="danger" :icon="Delete" text circle size="small" @click.stop="handleDelete(todo.id)"/>
          </div>
        </transition-group>
      </div>
    </el-card>
  </div>

    <!-- 3. 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEditMode ? '编辑待办事项' : '新增待办事项'" width="60%" top="5vh" destroy-on-close>
       <el-form :model="currentTodo" label-position="top">
         <el-form-item label="标题">
           <el-input v-model="currentTodo.title" placeholder="请输入标题..." />
         </el-form-item>
         <el-form-item label="优先级">
            <el-radio-group v-model="currentTodo.priority">
                <el-radio-button label="high">高</el-radio-button>
                <el-radio-button label="medium">中</el-radio-button>
                <el-radio-button label="low">低</el-radio-button>
            </el-radio-group>
         </el-form-item>
         <el-form-item label="内容 (支持 Markdown)">
            <v-md-editor v-model="currentTodo.content" height="300px"></v-md-editor>
         </el-form-item>
       </el-form>
       <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">保存</el-button>
          </div>
       </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue';
import { getTodosByDateAPI, createTodoAPI, updateTodoAPI, deleteTodoAPI, exportTodosAPI, importTodosAPI, type Todo } from '@/api/todos';
import { useAuthStore } from '@/store/auth';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete, Upload, Download } from '@element-plus/icons-vue';
import { format, isSameDay } from 'date-fns';

// --- 核心状态 ---
const authStore = useAuthStore();
const selectedDate = ref(new Date());
const todosByDate = ref<Record<string, Todo[]>>({});
const isLoadingDate = ref(false);

// --- 对话框状态 ---
const dialogVisible = ref(false);
const isEditMode = ref(false);
const initialTodoState: Todo = { title: '', content: '', status: 'pending', priority: 'medium', dueDate: ''};
const currentTodo = reactive<Partial<Todo>>({ ...initialTodoState });

// --- 辅助数据与计算属性 ---
const priorityMap = { high: { label: '高', type: 'danger'}, medium: { label: '中', type: 'warning'}, low: { label: '低', type: 'info'}};
const formattedSelectedDate = computed(() => format(selectedDate.value, 'yyyy年M月d日'));
const currentTodos = computed(() => todosByDate.value[format(selectedDate.value, 'yyyy-MM-dd')] || []);
const getTodosForDay = (day: string) => todosByDate.value[day] || [];
const isSelected = (data: { day: string }) => isSameDay(new Date(data.day), selectedDate.value);

// --- API 调用与逻辑处理 ---
const fetchTodosForDate = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    isLoadingDate.value = true;
    try {
        const res = await getTodosByDateAPI(dateStr);
        todosByDate.value[dateStr] = res.data;
    } catch (error) {
        todosByDate.value[dateStr] = [];
    } finally {
        isLoadingDate.value = false;
    }
};

watch(selectedDate, (newDate) => { if (newDate) fetchTodosForDate(newDate); }, { immediate: true });

const handleOpenDialog = (todo?: Todo) => {
    if (todo) {
        isEditMode.value = true;
        Object.assign(currentTodo, todo);
    } else {
        isEditMode.value = false;
        Object.assign(currentTodo, { ...initialTodoState, dueDate: format(selectedDate.value, 'yyyy-MM-dd') });
    }
    dialogVisible.value = true;
};

const handleSubmit = async () => {
    if (!currentTodo.title) return ElMessage.warning('标题不能为空');
    try {
        if (isEditMode.value && currentTodo.id) {
            await updateTodoAPI(currentTodo.id, currentTodo);
            ElMessage.success("更新成功");
        } else {
            if (!authStore.user?.id) return ElMessage.error("用户未登录，无法创建");
            await createTodoAPI({ ...currentTodo, userId: authStore.user.id } as Todo);
            ElMessage.success("新增成功");
        }
        dialogVisible.value = false;
        fetchTodosForDate(selectedDate.value);
    } catch (error) { ElMessage.error("操作失败"); }
};

const toggleStatus = async (todo: Todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    await updateTodoAPI(todo.id!, { ...todo, status: newStatus });
    fetchTodosForDate(selectedDate.value);
};

const handleDelete = async (id: number) => {
    try {
      await ElMessageBox.confirm('确定要删除这个待办事项吗？', '确认', { type: 'warning' });
      await deleteTodoAPI(id);
      ElMessage.success("删除成功");
      fetchTodosForDate(selectedDate.value);
    } catch(e) {}
};

const handleExport = async () => {
    const todosToExport = currentTodos.value;
    if (todosToExport.length === 0) return ElMessage.info("当前日期没有可导出的待办事项");
    const res = await exportTodosAPI(todosToExport);
    const blob = new Blob([res.data], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `todos-${format(selectedDate.value, 'yyyy-MM-dd')}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
};

const handleBeforeUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
            const res = await importTodosAPI(content);
            const importedTodos = res.data;
            if (importedTodos.length === 0) return ElMessage.info("未在文件中找到可识别的待办事项");
            await ElMessageBox.confirm(`成功解析到 ${importedTodos.length} 条待办事项，是否导入到 ${formattedSelectedDate.value}?`, '确认导入', { type: 'success' });
            for (const todo of importedTodos) {
                await createTodoAPI({ ...todo, dueDate: format(selectedDate.value, 'yyyy-MM-dd'), userId: authStore.user!.id } as Todo);
            }
            ElMessage.success("导入成功！");
            fetchTodosForDate(selectedDate.value);
        } catch (error) { ElMessage.error("导入失败"); }
    };
    reader.readAsText(file);
    return false;
};
</script>

<style scoped>
.todos-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.calendar-card {
  border-radius: 12px;
}
.list-card {
  border-radius: 12px;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.calendar-card :deep(.el-calendar-day) {
    height: 80px;
    padding: 6px;
}
.date-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  transition: background-color .2s;
  padding: 4px;
}
.date-cell:hover {
  background-color: #f5f7fa;
}
.date-cell.is-selected {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: bold;
}
.calendar-day { text-align: left; font-size: 14px; }
.todo-summary {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 4px;
}
.todo-summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.todo-summary-more {
  color: #909399;
  margin-top: 2px;
}
.todo-marker { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;}
.priority-high { background-color: var(--el-color-danger); }
.priority-medium { background-color: var(--el-color-warning); }
.priority-low { background-color: var(--el-color-info); }

.list-header { display: flex; justify-content: space-between; align-items: center; }
.todo-list { display: flex; flex-direction: column; gap: 12px; max-height: calc(100vh - 250px); overflow-y: auto; padding: 5px; }
.todo-item { display: flex; align-items: center; padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; border: 1px solid #e4e7ed; box-shadow: var(--el-box-shadow-light); }
.todo-item:hover { transform: translateY(-2px); box-shadow: var(--el-box-shadow); }
.todo-title { margin: 0 12px; font-weight: 500;}
.todo-title.completed { text-decoration: line-through; color: var(--el-text-color-disabled); }
.flex-grow { flex-grow: 1; }

.todo-list-anim-move,
.todo-list-anim-enter-active,
.todo-list-anim-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.todo-list-anim-enter-from,
.todo-list-anim-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}
.todo-list-anim-leave-active {
  position: absolute;
}
.markdown-preview-container {
  max-height: 400px;
  overflow-y: auto;
}
</style>
