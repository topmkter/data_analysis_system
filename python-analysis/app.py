# =================================================================
# 文件: python-analysis/app.py (功能增强版)
# 说明: 新增了“总体统计概览”的分析功能，并对现有代码
# 进行了微调，使其更健壮。
# =================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import KBinsDiscretizer


class DataAnalyzer:
    """
    一个封装了所有学生数据分析逻辑的类。
    每个公共方法对应一个特定的分析任务。
    """

    def __init__(self, data):
        if not isinstance(data, list) or not data:
            self.df = pd.DataFrame()
        else:
            self.df = pd.DataFrame(data)
            if 'score' in self.df.columns:
                # 确保分数列是数值类型，非数值转为NaN
                self.df['score'] = pd.to_numeric(self.df['score'], errors='coerce')

    def analyze_overall_statistics(self):
        """(新增) 计算数据集的总体统计信息"""
        if self.df.empty or 'score' not in self.df.columns:
            return {"student_count": 0, "class_count": 0, "overall_average": 0, "overall_median": 0,
                    "overall_std_dev": 0}

        # 在计算前丢弃分数为NaN的行
        valid_scores = self.df['score'].dropna()
        if valid_scores.empty:
            return {"student_count": 0, "class_count": 0, "overall_average": 0, "overall_median": 0,
                    "overall_std_dev": 0}

        student_count = int(self.df.shape[0])
        class_count = int(self.df['className'].nunique())
        overall_average = float(valid_scores.mean().round(2))
        overall_median = float(valid_scores.median())
        overall_std_dev = float(valid_scores.std().round(2))

        return {
            "student_count": student_count,
            "class_count": class_count,
            "overall_average": overall_average,
            "overall_median": overall_median,
            "overall_std_dev": overall_std_dev,
        }

    def analyze_grade_distribution(self):
        """分析成绩分布 (用于饼图)"""
        if self.df.empty or 'score' not in self.df.columns:
            return {"data": []}

        # 在计算前丢弃分数为NaN的行
        df_valid = self.df.dropna(subset=['score'])

        bins = [0, 60, 70, 80, 90, 151]
        labels = ['不及格 (0-59)', '及格 (60-69)', '中等 (70-79)', '良好 (80-89)', '优秀 (90-150)']
        df_valid['grade_range'] = pd.cut(df_valid['score'], bins=bins, labels=labels, right=False)
        distribution = df_valid['grade_range'].value_counts().sort_index()

        result = [{'name': str(index), 'value': int(value)} for index, value in distribution.items()]
        return {"data": result}

    def analyze_class_score_trend(self):
        """分析各班级成绩趋势 (用于折线/柱状图)"""
        if self.df.empty or 'className' not in self.df.columns or 'score' not in self.df.columns:
            return {"data": {'classNames': [], 'averageScores': [], 'maxScores': [], 'minScores': []}}

        # 在计算前丢弃分数为NaN的行
        df_valid = self.df.dropna(subset=['score'])

        class_stats = df_valid.groupby('className')['score'].agg(['mean', 'max', 'min']).reset_index()
        class_stats['mean'] = class_stats['mean'].round(2)

        result = {
            'classNames': class_stats['className'].tolist(),
            'averageScores': class_stats['mean'].tolist(),
            'maxScores': class_stats['max'].tolist(),
            'minScores': class_stats['min'].tolist(),
        }
        return {"data": result}

    def analyze_score_heatmap(self):
        """分析分数段-班级热力图"""
        if self.df.empty or 'className' not in self.df.columns or 'score' not in self.df.columns:
            return {"data": [], "xLabels": [], "yLabels": []}

        df_valid = self.df.dropna(subset=['score'])

        discretizer = KBinsDiscretizer(n_bins=10, encode='ordinal', strategy='uniform', subsample=None)
        df_valid['score_bin'] = discretizer.fit_transform(df_valid[['score']]).astype(int)

        class_list = sorted(df_valid['className'].unique())
        bin_edges = discretizer.fit(df_valid[['score']]).bin_edges_[0]
        bin_labels = [f'{int(bin_edges[i])}-{int(bin_edges[i + 1])}' for i in range(len(bin_edges) - 1)]

        heatmap_data = pd.crosstab(df_valid['className'], df_valid['score_bin'])

        result_data = []
        for y_idx, class_name in enumerate(class_list):
            for x_idx, _ in enumerate(bin_labels):
                value = heatmap_data.loc[
                    class_name, x_idx] if x_idx in heatmap_data.columns and class_name in heatmap_data.index else 0
                result_data.append([x_idx, y_idx, int(value)])

        return {"data": result_data, "xLabels": bin_labels, "yLabels": class_list}

    def analyze_student_relation_model(self):
        """分析学生关系模型 (用于力导向图)"""
        if self.df.empty or 'score' not in self.df.columns:
            return {"nodes": [], "links": [], "categories": []}

        df_valid = self.df.dropna(subset=['score'])

        nodes, links = [], []
        for _, row in df_valid.iterrows():
            nodes.append(
                {"id": str(row['id']), "name": row['name'], "category": row['className'], "value": row['score']})

        class_groups = df_valid.groupby('className')
        for _, group in class_groups:
            for i in range(len(group)):
                for j in range(i + 1, len(group)):
                    student1 = group.iloc[i]
                    student2 = group.iloc[j]
                    if abs(student1['score'] - student2['score']) <= 5:
                        links.append({"source": str(student1['id']), "target": str(student2['id'])})

        categories = [{"name": name} for name in df_valid['className'].unique()]

        return {"nodes": nodes, "links": links, "categories": categories}


# --- Flask App 设置 ---
app = Flask(__name__)
CORS(app)


# 主API路由，作为任务分发器
@app.route('/analyze', methods=['POST'])
def analyze():
    TASK_MAP = {
        'grade_distribution': 'analyze_grade_distribution',
        'class_score_trend': 'analyze_class_score_trend',
        'score_heatmap': 'analyze_score_heatmap',
        'student_relation_model': 'analyze_student_relation_model',
        'overall_statistics': 'analyze_overall_statistics',  # (新增) 任务映射
    }
    try:
        json_data = request.get_json()
        if not json_data:
            return jsonify({"error": "Invalid JSON"}), 400

        task = json_data.get('task')
        data = json_data.get('data')

        if not task or task not in TASK_MAP:
            return jsonify({"error": f"Unknown or missing task: {task}"}), 400

        analyzer = DataAnalyzer(data)
        method_to_call = getattr(analyzer, TASK_MAP[task])
        result = method_to_call()

        # (已修正) 统一返回格式，确保前端能正确解析
        if 'data' not in result and task not in ['student_relation_model', 'overall_statistics']:
            return jsonify({'data': result})
        return jsonify(result)

    except Exception as e:
        print(f"An error occurred during task '{request.get_json().get('task')}': {e}")
        return jsonify({"error": "An internal server error occurred during analysis"}), 500


if __name__ == '__main__':
    print("启动 Python 数据分析服务，监听 http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
