/*
 * =================================================================
 * API 服务层 (`client/src/api/`)
 * 说明: 新增了Markdown导入/导出的API函数。
 * =================================================================
 */

// --- 文件: client/src/api/todos.ts ---
import rustApi from './rustApi';

export interface Todo {
    id?: number;
    title: string;
    content: string | null;
    status: 'pending' | 'completed';
    priority: 'high' | 'medium' | 'low';
    dueDate: string; // YYYY-MM-DD
    userId?: number;
}

export const getTodosByDateAPI = (date: string) => rustApi.get(`/todos/${date}`);
export const createTodoAPI = (todo: Todo) => rustApi.post('/todos', todo);
export const updateTodoAPI = (id: number, todo: Partial<Todo>) => rustApi.put(`/todos/${id}`, todo);
export const deleteTodoAPI = (id: number) => rustApi.delete(`/todos/${id}`);
// (新增)
export const exportTodosAPI = (todos: Todo[]) => rustApi.post<string>('/todos/export', todos);
export const importTodosAPI = (markdown: string) => rustApi.post<Partial<Todo>[]>('/todos/import', markdown, {
    headers: { 'Content-Type': 'text/plain' }
});
