// =================================================================
// 文件: rust-optimizer/src/handlers.rs 
// =================================================================
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::sync::Arc;
use crate::{AppState, models::{Todo, CreateTodo, UpdateTodo}};
use chrono::NaiveDate;
use serde_json::json;
use regex::Regex;

// (已补全) 创建待办事项
pub async fn create_todo(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateTodo>,
) -> impl IntoResponse {
    let now = chrono::Utc::now().naive_utc();
    let result = sqlx::query!(
        r#"
        INSERT INTO Todos (title, content, priority, due_date, user_id, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
        "#,
        payload.title,
        payload.content,
        payload.priority,
        payload.due_date,
        payload.user_id,
        now,
        now
    )
        .execute(&state.db_pool)
        .await;

    match result {
        Ok(res) => Ok((StatusCode::CREATED, Json(json!({ "id": res.last_insert_id() })))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

// (已补全) 根据日期获取待办事项
pub async fn get_todos_by_date(
    State(state): State<Arc<AppState>>,
    Path(param): Path<String>,
) -> impl IntoResponse {
    let parsed_date = match NaiveDate::parse_from_str(&param, "%Y-%m-%d") {
        Ok(d) => d,
        // (已修正) 返回一个空的Todo向量，以保证类型一致
        Err(_) => return Ok(Json(Vec::<Todo>::new())),
    };

    let todos = sqlx::query_as!(
        Todo,
        r#"
        SELECT 
            id as "id!", 
            title as "title!", 
            content as "content?",
            status as "status!",
            priority as "priority!",
            due_date as "due_date?",
            user_id as "user_id!",
            created_at as "created_at!",
            updated_at as "updated_at!"
        FROM Todos 
        WHERE due_date = ?
        "#,
        parsed_date
    )
        .fetch_all(&state.db_pool)
        .await;

    match todos {
        Ok(todos) => Ok(Json(todos)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

// (已补全) 更新待办事项
pub async fn update_todo(
    State(state): State<Arc<AppState>>,
    Path(param): Path<String>,
    Json(payload): Json<UpdateTodo>,
) -> impl IntoResponse {
    let id: i32 = match param.parse() {
        Ok(num) => num,
        Err(_) => return Err((StatusCode::BAD_REQUEST, "Invalid ID format".to_string())),
    };

    let now = chrono::Utc::now().naive_utc();
    let result = sqlx::query!(
        "UPDATE Todos SET title = ?, content = ?, status = ?, priority = ?, updated_at = ? WHERE id = ?",
        payload.title,
        payload.content,
        payload.status,
        payload.priority,
        now,
        id
    )
        .execute(&state.db_pool)
        .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => Ok(StatusCode::OK),
        Ok(_) => Err((StatusCode::NOT_FOUND, "Todo not found".to_string())),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

// (已补全) 删除待办事项
pub async fn delete_todo(
    State(state): State<Arc<AppState>>,
    Path(param): Path<String>,
) -> impl IntoResponse {
    let id: i32 = match param.parse() {
        Ok(num) => num,
        Err(_) => return Err((StatusCode::BAD_REQUEST, "Invalid ID format".to_string())),
    };

    let result = sqlx::query!("DELETE FROM Todos WHERE id = ?", id)
        .execute(&state.db_pool)
        .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => Ok(StatusCode::NO_CONTENT),
        Ok(_) => Err((StatusCode::NOT_FOUND, "Todo not found".to_string())),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}


// 将待办事项列表导出为Markdown格式的文本
pub async fn export_todos_as_markdown(
    Json(payload): Json<Vec<Todo>>,
) -> impl IntoResponse {
    let mut markdown_string = String::new();

    if let Some(first_todo) = payload.first() {
        if let Some(due_date) = first_todo.due_date {
            markdown_string.push_str(&format!("# {}(待办事项)\n\n", due_date.format("%Y-%m-%d")));
        }
    }

    for todo in payload {
        let status_char = if todo.status == "completed" { "x" } else { " " };
        let priority_tag = format!("(优先级: {})", todo.priority);
        markdown_string.push_str(&format!("- [{}] {} {}\n", status_char, todo.title, priority_tag));
        if let Some(content) = &todo.content {
            if !content.is_empty() {
                // Indent content for better readability
                let indented_content = content.lines().map(|line| format!("  > {}", line)).collect::<Vec<String>>().join("\n");
                markdown_string.push_str(&format!("{}\n", indented_content));
            }
        }
    }

    (StatusCode::OK, markdown_string)
}

// 从Markdown文本中解析出待办事项
pub async fn import_todos_from_markdown(
    body: String,
) -> impl IntoResponse {
    let re = Regex::new(r"-\s*\[( |x)\]\s*(.+?)\s*\(优先级:\s*(high|medium|low)\)").unwrap();
    let mut todos_to_create = Vec::new();

    for line in body.lines() {
        if let Some(caps) = re.captures(line) {
            let status = if &caps[1] == "x" { "completed" } else { "pending" };
            let title = caps[2].trim().to_string();
            let priority = caps[3].trim().to_string();

            todos_to_create.push(json!({
                "title": title,
                "content": "", // Import doesn't handle multi-line content for simplicity
                "priority": priority,
                "status": status,
            }));
        }
    }

    (StatusCode::OK, Json(todos_to_create))
}
