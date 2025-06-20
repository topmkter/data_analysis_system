# generate_users.py
# 说明:
# 用于向 'Users' 表批量插入随机生成的普通用户数据。
# 密码会以'password'的明文存储，由bcrypt加密。

# --- 第一步: 安装所需库 ---
# uv pip install mysql-connector-python Faker bcrypt

import mysql.connector
import random
import bcrypt
from faker import Faker
from datetime import datetime

# --- 第二步: 配置 ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Yours Password',  # <-- 替换为您的MySQL密码
    'database': 'edu_analysis_db'
}

# 数据生成约束
NUM_USERS_TO_GENERATE = 10  # 要生成的普通用户数量
DEFAULT_PASSWORD = '1215'  # 为所有生成的用户设置一个统一的简单密码


def generate_user_data():
    """生成用户数据并存入数据库"""

    faker = Faker()  # 使用默认的英文数据生成器，以获得更像用户名的名字
    conn = None

    try:
        print("--- 开始执行普通用户数据生成脚本 ---")

        # 1. 加密默认密码
        hashed_password = bcrypt.hashpw(DEFAULT_PASSWORD.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("数据库连接成功。")

        # 2. 准备批量插入
        print(f"正在准备生成 {NUM_USERS_TO_GENERATE} 条普通用户数据...")
        users_data_to_insert = []
        for _ in range(NUM_USERS_TO_GENERATE):
            now = datetime.now()
            user_record = (
                faker.user_name(),  # 随机用户名
                hashed_password,  # 加密后的密码
                'user',  # 角色为普通用户
                now,
                now
            )
            users_data_to_insert.append(user_record)

        # 3. 执行批量插入
        sql_insert_query = """
                           INSERT INTO Users (username, password, role, createdAt, updatedAt)
                           VALUES (%s, %s, %s, %s, %s) \
                           """

        print("正在执行批量插入...")
        cursor.executemany(sql_insert_query, users_data_to_insert)
        conn.commit()

        print(f"操作成功！已成功插入 {cursor.rowcount} 条用户记录。")

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
    generate_user_data()
