# db_user.py
# 说明:
# 这是一个用于初始化数据库管理员用户的Python脚本。
# 它会连接到您的MySQL数据库，并创建或更新一个名为 'admin' 的用户，
# 密码为 'adminadmin' (密码会被bcrypt加密后存储)。

# --- 第一步: 安装所需库 ---
# 在运行此脚本前，请确保您已在PyCharm的终端中安装了以下两个库:
# pip install mysql-connector-python bcrypt
# 如果您使用 uv, 则运行: uv pip install mysql-connector-python bcrypt

import mysql.connector
import bcrypt
from datetime import datetime

# --- 第二步: 配置您的数据库连接信息 ---
# 请将以下变量替换为您自己的真实信息
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',  # 您的MySQL用户名
    'password': '1215',  # <-- 替换为您的MySQL密码
    'database': 'edu_analysis_db'  # 您的数据库名称
}

# --- 第三步: 定义要创建的管理员用户信息 ---
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'adminadmin'  # 明文密码
ADMIN_ROLE = 'admin'


def setup_admin_user():
    """连接数据库并创建/更新admin用户"""
    try:
        # 1. 对密码进行加密
        #    我们必须使用 utf-8 对密码进行编码，以便bcrypt处理
        hashed_password = bcrypt.hashpw(ADMIN_PASSWORD.encode('utf-8'), bcrypt.gensalt())

        # 2. 连接到数据库
        print(f"正在连接到数据库 '{DB_CONFIG['database']}'...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("数据库连接成功！")

        # 3. 准备SQL语句
        #    我们使用 "INSERT ... ON DUPLICATE KEY UPDATE" 语句。
        #    - 如果 'admin' 用户不存在，它会创建新用户。
        #    - 如果 'admin' 用户已存在，它会用新的加密密码更新该用户，确保密码是正确的。
        #    这比先删除再插入更安全、更健壮。
        sql_query = """
                    INSERT INTO Users (username, password, role, createdAt, updatedAt)
                    VALUES (%s, %s, %s, %s, %s) ON DUPLICATE KEY \
                    UPDATE \
                        password = \
                    VALUES (password), role = \
                    VALUES (role), updatedAt = \
                    VALUES (updatedAt) \
                    """

        # 获取当前时间
        now = datetime.now()

        # 准备要插入的数据
        user_data = (ADMIN_USERNAME, hashed_password.decode('utf-8'), ADMIN_ROLE, now, now)

        # 4. 执行SQL
        print(f"正在数据库中创建/更新用户 '{ADMIN_USERNAME}'...")
        cursor.execute(sql_query, user_data)

        # 5. 提交事务
        conn.commit()
        print("操作成功！")

        if cursor.rowcount == 1:
            print(f"结果: 已成功创建新用户 '{ADMIN_USERNAME}'。")
        elif cursor.rowcount == 2:  # 在更新时, rowcount会是2
            print(f"结果: 已成功更新现有用户 '{ADMIN_USERNAME}' 的密码。")
        else:
            print("结果: 用户数据没有变化。")


    except mysql.connector.Error as err:
        print(f"数据库错误: {err}")
        if 'conn' in locals() and conn.is_connected():
            conn.rollback()  # 如果出错，则回滚

    except Exception as e:
        print(f"发生未知错误: {e}")

    finally:
        # 6. 关闭连接
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()
            print("数据库连接已关闭。")


# --- 第四步: 运行脚本 ---
if __name__ == '__main__':
    print("--- 开始执行数据库管理员设置脚本 ---")
    setup_admin_user()
    print("--- 脚本执行完毕 ---")

