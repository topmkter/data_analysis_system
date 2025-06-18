# generate_todos.py
# 说明:
# 用于向 'Todos' 表批量插入随机生成的待办事项数据。
# 运行前，请确保 'Users' 表中已存在用户数据。

# --- 第一步: 安装所需库 ---
# uv pip install mysql-connector-python Faker

import mysql.connector
import random
from faker import Faker
from datetime import datetime

# --- 第二步: 配置 ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1215',  # <-- 替换为您的MySQL密码
    'database': 'edu_analysis_db'
}

# 数据生成约束
NUM_TODOS_TO_GENERATE = 50  # 要生成的待办事项数量
TODO_STATUSES = ['pending', 'completed']


def generate_todo_data():
    """生成待办事项数据并存入数据库"""

    faker = Faker('zh_CN')
    conn = None

    try:
        print("--- 开始执行待办事项数据生成脚本 ---")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("数据库连接成功。")

        # 1. 从Users表中获取所有现有的用户ID
        print("正在获取有效的用户ID...")
        cursor.execute("SELECT id FROM Users")
        user_ids = [item[0] for item in cursor.fetchall()]

        if not user_ids:
            print("错误: 'Users' 表中没有任何用户，无法关联待办事项。请先生成用户。")
            return

        print(f"获取到 {len(user_ids)} 个用户ID。")

        # 2. 准备批量插入
        print(f"正在准备生成 {NUM_TODOS_TO_GENERATE} 条待办事项...")
        todos_data_to_insert = []
        for _ in range(NUM_TODOS_TO_GENERATE):
            now = datetime.now()
            todo_record = (
                faker.sentence(nb_words=6),  # 随机标题
                faker.text(max_nb_chars=200),  # 随机内容
                random.choice(TODO_STATUSES),  # 随机状态
                random.choice(user_ids),  # 随机关联一个用户
                now,
                now
            )
            todos_data_to_insert.append(todo_record)

        # 3. 执行批量插入
        sql_insert_query = """
                           INSERT INTO Todos (title, content, status, userId, createdAt, updatedAt)
                           VALUES (%s, %s, %s, %s, %s, %s) \
                           """

        print("正在执行批量插入...")
        cursor.executemany(sql_insert_query, todos_data_to_insert)
        conn.commit()

        print(f"操作成功！已成功插入 {cursor.rowcount} 条待办事项。")

    except mysql.connector.Error as err:
        print(f"数据库错误: {err}")
    except Exception as e:
        print(f"发生未知错误: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            print("数据库连接已关闭。")
        print("--- 脚本执行完毕 ---")


if __name__ == '__main__':
    generate_todo_data()
