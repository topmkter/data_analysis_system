
// =================================================================
// 文件: rust-optimizer/src/main.rs 
// =================================================================
use axum::{
    routing::{get, post},
    Router,
};
use sqlx::mysql::{MySqlPool, MySqlPoolOptions};
use std::net::SocketAddr;
use std::sync::Arc;
use dotenvy::dotenv;
use std::env;
use tower_http::cors::{CorsLayer, Any};

mod models;
mod handlers;

// 引入需要的处理器函数
use handlers::{
    create_todo, get_todos_by_date, update_todo, delete_todo,
    export_todos_as_markdown, import_todos_from_markdown,
};

#[derive(Clone)]
pub struct AppState {
    pub db_pool: MySqlPool,
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = MySqlPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
        .expect("Failed to create database pool.");
    println!("Database connection successful.");

    let app_state = Arc::new(AppState { db_pool: pool });

    let cors = CorsLayer::new()
        .allow_origin(Any).allow_methods(Any).allow_headers(Any);

    // (已更新) 定义我们的应用路由
    let app = Router::new()
        .route("/todos", post(create_todo))
        .route("/todos/:param", get(get_todos_by_date).put(update_todo).delete(delete_todo))
        .route("/todos/export", post(export_todos_as_markdown))
        .route("/todos/import", post(import_todos_from_markdown))
        .with_state(app_state)
        .layer(cors);

    let addr_str = env::var("RUST_SERVER_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".to_string());
    let addr: SocketAddr = addr_str.parse().expect("Invalid server address");
    println!("Rust server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

