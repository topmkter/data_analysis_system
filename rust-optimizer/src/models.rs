// =================================================================
// 文件: rust-optimizer/src/models.rs (已更新)
// =================================================================
use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use chrono::{NaiveDateTime, NaiveDate};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Todo {
    pub id: i32,
    pub title: String,
    pub content: Option<String>,
    pub status: String,
    pub priority: String,
    pub due_date: Option<NaiveDate>,
    pub user_id: i32,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTodo {
    pub title: String,
    pub content: Option<String>,
    pub priority: String,
    #[serde(rename = "dueDate")]
    pub due_date: NaiveDate,
    #[serde(rename = "userId")]
    pub user_id: i32,
}
// ... UpdateTodo 结构体保持不变 ...
#[derive(Debug, Deserialize)]
pub struct UpdateTodo {
    pub title: String,
    pub content: Option<String>,
    pub priority: String,
    pub status: String,
}

