# generate_students.py
# 说明:
# 用于向 'Students' 表批量插入随机生成的学生数据。
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
    'password': 'Yours  password',  # <-- 替换为您的MySQL密码
    'database': 'edu_analysis_db'
}

# 数据生成约束
NUM_STUDENTS_TO_GENERATE = 200  # 要生成的学生记录数量
SCORE_RANGE = (40.0, 120.0)  # 随机分数范围
CLASS_NAMES = ['一年级一班', '一年级二班', '二年级一班', '三年级一班', '三年级三班']


def generate_student_data():
    """生成学生数据并存入数据库"""

    faker = Faker('zh_CN')  # 使用中文数据生成器
    conn = None

    try:
        print("--- 开始执行学生数据生成脚本 ---")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("数据库连接成功。")

        # 1. 首先，从Users表中获取所有现有的用户ID
        print("正在获取有效的用户ID...")
        cursor.execute("SELECT id FROM Users")
        user_ids = [item[0] for item in cursor.fetchall()]

        if not user_ids:
            print("错误: 'Users' 表中没有任何用户，无法关联学生数据。请先生成用户。")
            return

        print(f"获取到 {len(user_ids)} 个用户ID。")

        # 2. 准备批量插入
        print(f"正在准备生成 {NUM_STUDENTS_TO_GENERATE} 条学生数据...")
        students_data_to_insert = []
        for i in range(NUM_STUDENTS_TO_GENERATE):
            now = datetime.now()
            student_record = (
                faker.name(),  # 随机姓名
                f"S{random.randint(20230000, 20239999)}",  # 随机学号
                random.choice(CLASS_NAMES),  # 随机班级
                round(random.uniform(SCORE_RANGE[0], SCORE_RANGE[1]), 2),  # 随机分数
                random.choice(user_ids),  # 从现有用户中随机选择一个userId
                now,
                now
            )
            students_data_to_insert.append(student_record)

        # 3. 执行批量插入
        sql_insert_query = """
                           INSERT INTO Students (name, studentId, className, score, userId, createdAt, updatedAt)
                           VALUES (%s, %s, %s, %s, %s, %s, %s) \
                           """

        print("正在执行批量插入...")
        cursor.executemany(sql_insert_query, students_data_to_insert)
        conn.commit()

        print(f"操作成功！已成功插入 {cursor.rowcount} 条学生记录。")

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
    generate_student_data()
