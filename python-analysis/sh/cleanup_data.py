# cleanup_data.py
# 说明:
# 用于清理数据库中的测试数据。
# - 会删除 'Students' 表中的所有记录。
# - 会删除 'Todos' 表中的所有记录。
# - 会删除 'Users' 表中除 'admin' 之外的所有用户。

import mysql.connector

# --- 配置 ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1215',  # <-- 替换为您的MySQL密码
    'database': 'edu_analysis_db'
}


def cleanup_database():
    """连接数据库并清理测试数据"""

    conn = None

    try:
        print("--- 开始执行数据清理脚本 ---")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("数据库连接成功。")

        # 禁用外键检查，以便能顺利删除被引用的用户
        print("临时禁用外键检查...")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")

        # 1. 清理 Students 表
        print("正在清理 'Students' 表...")
        cursor.execute("DELETE FROM Students;")
        print(f"成功删除 {cursor.rowcount} 条记录。")

        # 2. 清理 Todos 表
        print("正在清理 'Todos' 表...")
        cursor.execute("DELETE FROM Todos;")
        print(f"成功删除 {cursor.rowcount} 条记录。")

        # 3. 清理 Users 表 (保留 admin)
        print("正在清理 'Users' 表 (保留 admin 用户)...")
        cursor.execute("DELETE FROM Users WHERE username != 'admin';")
        print(f"成功删除 {cursor.rowcount} 条用户记录。")

        # 重新启用外键检查
        print("重新启用外键检查...")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

        # 提交事务
        conn.commit()
        print("所有清理操作已成功提交！")

    except mysql.connector.Error as err:
        print(f"数据库错误: {err}")
        if conn and conn.is_connected():
            conn.rollback()  # 出错时回滚

    except Exception as e:
        print(f"发生未知错误: {e}")

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            print("数据库连接已关闭。")
        print("--- 脚本执行完毕 ---")


if __name__ == '__main__':
    # 添加一个确认步骤，防止误操作
    confirm = input("警告：此操作将删除大量数据，且无法恢复！\n确定要继续吗？ (输入 'yes' 以确认): ")
    if confirm.lower() == 'yes':
        cleanup_database()
    else:
        print("操作已取消。")
