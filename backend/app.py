from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from sqlalchemy import func, extract
import os

app = Flask(__name__)
CORS(app)

# 数据库配置
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'mysql+pymysql://root:password@localhost:3306/literacy_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_AS_ASCII'] = False

db = SQLAlchemy(app)

# 数据库模型
class Word(db.Model):
    """汉字表"""
    __tablename__ = 'words'
    
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(10), nullable=False)
    pinyin = db.Column(db.String(50), nullable=False)
    meaning = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联学习记录
    learning_records = db.relationship('LearningRecord', backref='word', lazy=True, cascade='all, delete-orphan')

class LearningRecord(db.Model):
    """学习记录表"""
    __tablename__ = 'learning_records'
    
    id = db.Column(db.Integer, primary_key=True)
    word_id = db.Column(db.Integer, db.ForeignKey('words.id'), nullable=False)
    learned_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    week = db.Column(db.Integer, nullable=False)
    
    def __init__(self, word_id):
        self.word_id = word_id
        now = datetime.utcnow()
        self.learned_at = now
        # 计算ISO周数
        self.year = now.year
        self.week = now.isocalendar()[1]

class StarRecord(db.Model):
    """星星记录表"""
    __tablename__ = 'star_records'
    
    id = db.Column(db.Integer, primary_key=True)
    stars = db.Column(db.Integer, default=0, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 辅助函数
def get_week_dates(year, week):
    """根据年份和周数获取该周的起止日期"""
    # ISO周的第一天是周一
    first_day = datetime.strptime(f'{year}-W{week:02d}-1', '%Y-W%W-%w')
    last_day = first_day + timedelta(days=6)
    return first_day, last_day

# API路由
@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/words', methods=['GET'])
def get_words():
    """获取所有汉字"""
    words = Word.query.order_by(Word.created_at.desc()).all()
    result = []
    for word in words:
        # 检查是否已学习
        learned = LearningRecord.query.filter_by(word_id=word.id).first() is not None
        last_record = LearningRecord.query.filter_by(word_id=word.id).order_by(LearningRecord.learned_at.desc()).first()
        
        result.append({
            'id': word.id,
            'word': word.word,
            'pinyin': word.pinyin,
            'meaning': word.meaning,
            'learned': learned,
            'lastReviewed': last_record.learned_at.isoformat() if last_record else None
        })
    return jsonify(result)

@app.route('/api/words', methods=['POST'])
def add_word():
    """添加新汉字"""
    data = request.get_json()
    
    if not data or not data.get('word') or not data.get('pinyin') or not data.get('meaning'):
        return jsonify({'error': '缺少必要字段'}), 400
    
    word = Word(
        word=data['word'],
        pinyin=data['pinyin'],
        meaning=data['meaning']
    )
    db.session.add(word)
    db.session.commit()
    
    return jsonify({
        'id': word.id,
        'word': word.word,
        'pinyin': word.pinyin,
        'meaning': word.meaning,
        'learned': False,
        'lastReviewed': None
    }), 201

@app.route('/api/words/<int:word_id>', methods=['PUT'])
def update_word(word_id):
    """更新汉字"""
    word = Word.query.get_or_404(word_id)
    data = request.get_json()
    
    if data.get('word'):
        word.word = data['word']
    if data.get('pinyin'):
        word.pinyin = data['pinyin']
    if data.get('meaning'):
        word.meaning = data['meaning']
    
    db.session.commit()
    
    learned = LearningRecord.query.filter_by(word_id=word.id).first() is not None
    last_record = LearningRecord.query.filter_by(word_id=word.id).order_by(LearningRecord.learned_at.desc()).first()
    
    return jsonify({
        'id': word.id,
        'word': word.word,
        'pinyin': word.pinyin,
        'meaning': word.meaning,
        'learned': learned,
        'lastReviewed': last_record.learned_at.isoformat() if last_record else None
    })

@app.route('/api/words/<int:word_id>', methods=['DELETE'])
def delete_word(word_id):
    """删除汉字"""
    word = Word.query.get_or_404(word_id)
    db.session.delete(word)
    db.session.commit()
    return jsonify({'message': '删除成功'}), 200

@app.route('/api/learn/<int:word_id>', methods=['POST'])
def mark_as_learned(word_id):
    """标记汉字为已学习"""
    word = Word.query.get_or_404(word_id)
    
    # 创建学习记录
    record = LearningRecord(word_id=word.id)
    db.session.add(record)
    
    # 增加星星
    star_record = StarRecord.query.first()
    if not star_record:
        star_record = StarRecord(stars=10)
        db.session.add(star_record)
    else:
        star_record.stars += 10
    
    db.session.commit()
    
    return jsonify({
        'message': '学习成功',
        'stars': star_record.stars,
        'year': record.year,
        'week': record.week
    }), 200

@app.route('/api/stars', methods=['GET'])
def get_stars():
    """获取星星总数"""
    star_record = StarRecord.query.first()
    return jsonify({'stars': star_record.stars if star_record else 0})

@app.route('/api/stars/reset', methods=['POST'])
def reset_stars():
    """重置所有进度"""
    # 删除所有学习记录
    LearningRecord.query.delete()
    
    # 重置星星
    star_record = StarRecord.query.first()
    if star_record:
        star_record.stars = 0
    
    db.session.commit()
    return jsonify({'message': '重置成功', 'stars': 0})

@app.route('/api/weekly-stats', methods=['GET'])
def get_weekly_stats():
    """获取每周学习统计"""
    # 获取所有学习记录，按周分组
    stats = db.session.query(
        LearningRecord.year,
        LearningRecord.week,
        func.count(LearningRecord.id).label('count')
    ).group_by(
        LearningRecord.year,
        LearningRecord.week
    ).order_by(
        LearningRecord.year.desc(),
        LearningRecord.week.desc()
    ).all()
    
    result = []
    for stat in stats:
        first_day, last_day = get_week_dates(stat.year, stat.week)
        result.append({
            'year': stat.year,
            'week': stat.week,
            'count': stat.count,
            'startDate': first_day.strftime('%Y-%m-%d'),
            'endDate': last_day.strftime('%Y-%m-%d'),
            'label': f'{stat.year}年第{stat.week}周'
        })
    
    return jsonify(result)

@app.route('/api/weekly-words/<int:year>/<int:week>', methods=['GET'])
def get_weekly_words(year, week):
    """查询指定周学习的汉字"""
    records = db.session.query(LearningRecord).filter(
        LearningRecord.year == year,
        LearningRecord.week == week
    ).order_by(LearningRecord.learned_at.desc()).all()
    
    result = []
    for record in records:
        word = record.word
        result.append({
            'id': word.id,
            'word': word.word,
            'pinyin': word.pinyin,
            'meaning': word.meaning,
            'learnedAt': record.learned_at.isoformat()
        })
    
    first_day, last_day = get_week_dates(year, week)
    
    return jsonify({
        'year': year,
        'week': week,
        'startDate': first_day.strftime('%Y-%m-%d'),
        'endDate': last_day.strftime('%Y-%m-%d'),
        'count': len(result),
        'words': result
    })

@app.route('/api/current-week', methods=['GET'])
def get_current_week_stats():
    """获取当前周学习统计"""
    now = datetime.utcnow()
    year = now.year
    week = now.isocalendar()[1]
    
    count = LearningRecord.query.filter(
        LearningRecord.year == year,
        LearningRecord.week == week
    ).count()
    
    first_day, last_day = get_week_dates(year, week)
    
    return jsonify({
        'year': year,
        'week': week,
        'count': count,
        'startDate': first_day.strftime('%Y-%m-%d'),
        'endDate': last_day.strftime('%Y-%m-%d'),
        'label': f'{year}年第{week}周'
    })

@app.route('/api/init-db', methods=['POST'])
def init_database():
    """初始化数据库（仅用于开发）"""
    try:
        db.create_all()
        
        # 添加默认汉字（如果没有）
        if Word.query.count() == 0:
            default_words = [
                {'word': '日', 'pinyin': 'rì', 'meaning': '太阳'},
                {'word': '月', 'pinyin': 'yuè', 'meaning': '月亮'},
                {'word': '水', 'pinyin': 'shuǐ', 'meaning': '液体'},
                {'word': '火', 'pinyin': 'huǒ', 'meaning': '燃烧'},
                {'word': '山', 'pinyin': 'shān', 'meaning': '高大的地形'},
                {'word': '木', 'pinyin': 'mù', 'meaning': '树木'},
                {'word': '人', 'pinyin': 'rén', 'meaning': '人类'},
                {'word': '口', 'pinyin': 'kǒu', 'meaning': '嘴巴'},
            ]
            for w in default_words:
                word = Word(**w)
                db.session.add(word)
            db.session.commit()
        
        return jsonify({'message': '数据库初始化成功'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

