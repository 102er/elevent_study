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
    pinyin = db.Column(db.String(50), nullable=True)  # 改为可选
    meaning = db.Column(db.String(200), nullable=True)  # 改为可选
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

class Book(db.Model):
    """书籍表"""
    __tablename__ = 'books'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(100))
    cover_color = db.Column(db.String(20), default='blue')
    total_pages = db.Column(db.Integer, default=0)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联阅读记录
    reading_records = db.relationship('ReadingRecord', backref='book', lazy=True, cascade='all, delete-orphan')

class ReadingRecord(db.Model):
    """阅读记录表"""
    __tablename__ = 'reading_records'
    
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    current_page = db.Column(db.Integer, default=0)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    notes = db.Column(db.Text)

class TravelPlan(db.Model):
    """旅行计划表"""
    __tablename__ = 'travel_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    destination = db.Column(db.String(200), nullable=False)
    budget = db.Column(db.Numeric(10, 2), default=0)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    notes = db.Column(db.Text)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # 关联旅行足迹
    footprints = db.relationship('TravelFootprint', backref='plan', lazy=True, cascade='all, delete-orphan')

class TravelFootprint(db.Model):
    """旅行足迹表"""
    __tablename__ = 'travel_footprints'
    
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey('travel_plans.id'), nullable=False)
    expense = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Poem(db.Model):
    """古诗表"""
    __tablename__ = 'poems'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100))
    content = db.Column(db.Text, nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

class DailyTask(db.Model):
    """日常任务表"""
    __tablename__ = 'daily_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(200), nullable=False)
    reward_stars = db.Column(db.Integer, default=0)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联完成记录
    completions = db.relationship('TaskCompletion', backref='task', lazy=True, cascade='all, delete-orphan')

class TaskCompletion(db.Model):
    """任务完成记录表"""
    __tablename__ = 'task_completions'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('daily_tasks.id'), nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    stars_earned = db.Column(db.Integer, default=0)

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
            'pinyin': word.pinyin or '',  # 处理None值
            'meaning': word.meaning or '',  # 处理None值
            'learned': learned,
            'lastReviewed': last_record.learned_at.isoformat() if last_record else None
        })
    return jsonify(result)

@app.route('/api/words', methods=['POST'])
def add_word():
    """添加新汉字"""
    data = request.get_json()
    
    # 只有汉字是必填的
    if not data or not data.get('word'):
        return jsonify({'error': '汉字不能为空'}), 400
    
    word = Word(
        word=data['word'],
        pinyin=data.get('pinyin', ''),  # 可选，默认空字符串
        meaning=data.get('meaning', '')  # 可选，默认空字符串
    )
    db.session.add(word)
    db.session.commit()
    
    return jsonify({
        'id': word.id,
        'word': word.word,
        'pinyin': word.pinyin or '',
        'meaning': word.meaning or '',
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
    if 'pinyin' in data:
        word.pinyin = data['pinyin'] or ''
    if 'meaning' in data:
        word.meaning = data['meaning'] or ''
    
    db.session.commit()
    
    learned = LearningRecord.query.filter_by(word_id=word.id).first() is not None
    last_record = LearningRecord.query.filter_by(word_id=word.id).order_by(LearningRecord.learned_at.desc()).first()
    
    return jsonify({
        'id': word.id,
        'word': word.word,
        'pinyin': word.pinyin or '',
        'meaning': word.meaning or '',
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
    
    # 增加星星 - 一个汉字一颗星
    star_record = StarRecord.query.first()
    if not star_record:
        star_record = StarRecord(stars=1)
        db.session.add(star_record)
    else:
        star_record.stars += 1
    
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
        
        # 获取该周学习的具体汉字
        records = db.session.query(LearningRecord).filter(
            LearningRecord.year == stat.year,
            LearningRecord.week == stat.week
        ).order_by(LearningRecord.learned_at.desc()).all()
        
        words = []
        for record in records:
            word = record.word
            words.append({
                'id': word.id,
                'word': word.word,
                'pinyin': word.pinyin or '',
                'meaning': word.meaning or '',
                'learnedAt': record.learned_at.isoformat()
            })
        
        result.append({
            'year': stat.year,
            'week': stat.week,
            'count': stat.count,
            'startDate': first_day.strftime('%Y-%m-%d'),
            'endDate': last_day.strftime('%Y-%m-%d'),
            'label': f'{stat.year}年第{stat.week}周',
            'words': words  # 添加具体汉字列表
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
            'pinyin': word.pinyin or '',  # 处理None值
            'meaning': word.meaning or '',  # 处理None值
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

# ====================
# 书籍管理 API
# ====================

@app.route('/api/books', methods=['GET'])
def get_books():
    """获取所有书籍及其阅读状态"""
    books = Book.query.order_by(Book.created_at.desc()).all()
    result = []
    for book in books:
        # 查找阅读记录
        reading_record = ReadingRecord.query.filter_by(book_id=book.id).first()
        
        result.append({
            'id': book.id,
            'title': book.title,
            'author': book.author,
            'coverColor': book.cover_color,
            'totalPages': book.total_pages,
            'description': book.description,
            'isCompleted': reading_record.is_completed if reading_record else False,
            'currentPage': reading_record.current_page if reading_record else 0,
            'startedAt': reading_record.started_at.isoformat() if reading_record and reading_record.started_at else None,
            'completedAt': reading_record.completed_at.isoformat() if reading_record and reading_record.completed_at else None,
            'notes': reading_record.notes if reading_record else '',
            'hasRecord': reading_record is not None
        })
    return jsonify(result)

@app.route('/api/books', methods=['POST'])
def add_book():
    """添加新书籍"""
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': '书名不能为空'}), 400
    
    book = Book(
        title=data['title'],
        author=data.get('author', ''),
        cover_color=data.get('coverColor', 'blue'),
        total_pages=data.get('totalPages', 0),
        description=data.get('description', '')
    )
    db.session.add(book)
    db.session.commit()
    
    return jsonify({
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'coverColor': book.cover_color,
        'totalPages': book.total_pages,
        'description': book.description,
        'isCompleted': False,
        'currentPage': 0,
        'hasRecord': False
    }), 201

@app.route('/api/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    """更新书籍信息"""
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    
    if data.get('title'):
        book.title = data['title']
    if data.get('author') is not None:
        book.author = data['author']
    if data.get('coverColor'):
        book.cover_color = data['coverColor']
    if data.get('totalPages') is not None:
        book.total_pages = data['totalPages']
    if data.get('description') is not None:
        book.description = data['description']
    
    db.session.commit()
    
    reading_record = ReadingRecord.query.filter_by(book_id=book.id).first()
    
    return jsonify({
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'coverColor': book.cover_color,
        'totalPages': book.total_pages,
        'description': book.description,
        'isCompleted': reading_record.is_completed if reading_record else False,
        'currentPage': reading_record.current_page if reading_record else 0,
        'hasRecord': reading_record is not None
    })

@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    """删除书籍"""
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': '删除成功'}), 200

# ====================
# 阅读记录 API
# ====================

@app.route('/api/reading/<int:book_id>/start', methods=['POST'])
def start_reading(book_id):
    """开始阅读书籍"""
    book = Book.query.get_or_404(book_id)
    
    # 检查是否已有阅读记录
    record = ReadingRecord.query.filter_by(book_id=book.id).first()
    
    if not record:
        record = ReadingRecord(book_id=book.id)
        db.session.add(record)
        db.session.commit()
    
    return jsonify({
        'message': '开始阅读',
        'bookId': book.id,
        'startedAt': record.started_at.isoformat()
    }), 200

@app.route('/api/reading/<int:book_id>/complete', methods=['POST'])
def complete_reading(book_id):
    """标记书籍为已读完"""
    book = Book.query.get_or_404(book_id)
    
    record = ReadingRecord.query.filter_by(book_id=book.id).first()
    
    if not record:
        record = ReadingRecord(book_id=book.id)
        db.session.add(record)
    
    record.is_completed = True
    record.completed_at = datetime.utcnow()
    record.current_page = book.total_pages
    
    db.session.commit()
    
    return jsonify({
        'message': '恭喜读完！',
        'bookId': book.id,
        'completedAt': record.completed_at.isoformat()
    }), 200

@app.route('/api/reading/<int:book_id>/progress', methods=['POST'])
def update_reading_progress(book_id):
    """更新阅读进度"""
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    
    if not data or 'currentPage' not in data:
        return jsonify({'error': '缺少页数信息'}), 400
    
    record = ReadingRecord.query.filter_by(book_id=book.id).first()
    
    if not record:
        record = ReadingRecord(book_id=book.id)
        db.session.add(record)
    
    record.current_page = data['currentPage']
    
    # 如果读完了，自动标记为完成
    if book.total_pages > 0 and record.current_page >= book.total_pages:
        record.is_completed = True
        record.completed_at = datetime.utcnow()
    
    if data.get('notes'):
        record.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({
        'message': '进度已更新',
        'currentPage': record.current_page,
        'isCompleted': record.is_completed
    }), 200

@app.route('/api/reading/stats', methods=['GET'])
def get_reading_stats():
    """获取阅读统计"""
    total_books = Book.query.count()
    completed_books = db.session.query(ReadingRecord).filter(
        ReadingRecord.is_completed == True
    ).count()
    reading_books = db.session.query(ReadingRecord).filter(
        ReadingRecord.is_completed == False
    ).count()
    
    return jsonify({
        'totalBooks': total_books,
        'completedBooks': completed_books,
        'readingBooks': reading_books,
        'unreadBooks': total_books - completed_books - reading_books
    })

# ====================
# 旅行计划 API
# ====================

@app.route('/api/travel-plans', methods=['GET'])
def get_travel_plans():
    """获取所有旅行计划"""
    plans = TravelPlan.query.order_by(TravelPlan.created_at.desc()).all()
    result = []
    for plan in plans:
        # 计算总花费
        total_expense = db.session.query(func.sum(TravelFootprint.expense)).filter(
            TravelFootprint.plan_id == plan.id
        ).scalar() or 0
        
        result.append({
            'id': plan.id,
            'destination': plan.destination,
            'budget': float(plan.budget) if plan.budget else 0,
            'startDate': plan.start_date.isoformat() if plan.start_date else None,
            'endDate': plan.end_date.isoformat() if plan.end_date else None,
            'notes': plan.notes or '',
            'isCompleted': plan.is_completed,
            'createdAt': plan.created_at.isoformat(),
            'completedAt': plan.completed_at.isoformat() if plan.completed_at else None,
            'totalExpense': float(total_expense),
            'starsEarned': int(total_expense)  # 1元=1颗星
        })
    return jsonify(result)

@app.route('/api/travel-plans', methods=['POST'])
def add_travel_plan():
    """添加旅行计划"""
    data = request.get_json()
    
    if not data or not data.get('destination'):
        return jsonify({'error': '目的地不能为空'}), 400
    
    plan = TravelPlan(
        destination=data['destination'],
        budget=data.get('budget', 0),
        start_date=datetime.strptime(data['startDate'], '%Y-%m-%d').date() if data.get('startDate') else None,
        end_date=datetime.strptime(data['endDate'], '%Y-%m-%d').date() if data.get('endDate') else None,
        notes=data.get('notes', '')
    )
    db.session.add(plan)
    db.session.commit()
    
    return jsonify({
        'id': plan.id,
        'destination': plan.destination,
        'budget': float(plan.budget),
        'startDate': plan.start_date.isoformat() if plan.start_date else None,
        'endDate': plan.end_date.isoformat() if plan.end_date else None,
        'notes': plan.notes or '',
        'isCompleted': plan.is_completed,
        'totalExpense': 0,
        'starsEarned': 0
    }), 201

@app.route('/api/travel-plans/<int:plan_id>', methods=['PUT'])
def update_travel_plan(plan_id):
    """更新旅行计划"""
    plan = TravelPlan.query.get_or_404(plan_id)
    data = request.get_json()
    
    if data.get('destination'):
        plan.destination = data['destination']
    if 'budget' in data:
        plan.budget = data['budget']
    if data.get('startDate'):
        plan.start_date = datetime.strptime(data['startDate'], '%Y-%m-%d').date()
    if data.get('endDate'):
        plan.end_date = datetime.strptime(data['endDate'], '%Y-%m-%d').date()
    if 'notes' in data:
        plan.notes = data['notes']
    if 'isCompleted' in data:
        plan.is_completed = data['isCompleted']
        if data['isCompleted']:
            plan.completed_at = datetime.utcnow()
    
    db.session.commit()
    
    total_expense = db.session.query(func.sum(TravelFootprint.expense)).filter(
        TravelFootprint.plan_id == plan.id
    ).scalar() or 0
    
    return jsonify({
        'id': plan.id,
        'destination': plan.destination,
        'budget': float(plan.budget),
        'startDate': plan.start_date.isoformat() if plan.start_date else None,
        'endDate': plan.end_date.isoformat() if plan.end_date else None,
        'notes': plan.notes or '',
        'isCompleted': plan.is_completed,
        'totalExpense': float(total_expense),
        'starsEarned': int(total_expense)
    })

@app.route('/api/travel-plans/<int:plan_id>', methods=['DELETE'])
def delete_travel_plan(plan_id):
    """删除旅行计划"""
    plan = TravelPlan.query.get_or_404(plan_id)
    db.session.delete(plan)
    db.session.commit()
    return jsonify({'message': '删除成功'}), 200

# 旅行足迹 API
@app.route('/api/travel-plans/<int:plan_id>/footprints', methods=['GET'])
def get_footprints(plan_id):
    """获取旅行足迹"""
    TravelPlan.query.get_or_404(plan_id)  # 验证计划存在
    footprints = TravelFootprint.query.filter_by(plan_id=plan_id).order_by(TravelFootprint.created_at.desc()).all()
    
    result = []
    for fp in footprints:
        result.append({
            'id': fp.id,
            'expense': float(fp.expense),
            'description': fp.description or '',
            'createdAt': fp.created_at.isoformat(),
            'starsEarned': int(fp.expense)
        })
    return jsonify(result)

@app.route('/api/travel-plans/<int:plan_id>/footprints', methods=['POST'])
def add_footprint(plan_id):
    """添加旅行足迹（花费记录，自动奖励星星）"""
    TravelPlan.query.get_or_404(plan_id)  # 验证计划存在
    data = request.get_json()
    
    if not data or 'expense' not in data:
        return jsonify({'error': '花费金额不能为空'}), 400
    
    expense = float(data['expense'])
    
    # 创建足迹记录
    footprint = TravelFootprint(
        plan_id=plan_id,
        expense=expense,
        description=data.get('description', '')
    )
    db.session.add(footprint)
    
    # 增加星星 - 1元=1颗星
    stars_to_add = int(expense)
    star_record = StarRecord.query.first()
    if not star_record:
        star_record = StarRecord(stars=stars_to_add)
        db.session.add(star_record)
    else:
        star_record.stars += stars_to_add
    
    db.session.commit()
    
    return jsonify({
        'id': footprint.id,
        'expense': float(footprint.expense),
        'description': footprint.description or '',
        'createdAt': footprint.created_at.isoformat(),
        'starsEarned': stars_to_add,
        'totalStars': star_record.stars
    }), 201

@app.route('/api/travel-footprints/<int:footprint_id>', methods=['DELETE'])
def delete_footprint(footprint_id):
    """删除旅行足迹"""
    footprint = TravelFootprint.query.get_or_404(footprint_id)
    
    # 减少星星
    stars_to_remove = int(footprint.expense)
    star_record = StarRecord.query.first()
    if star_record:
        star_record.stars = max(0, star_record.stars - stars_to_remove)
    
    db.session.delete(footprint)
    db.session.commit()
    return jsonify({'message': '删除成功'}), 200

# ====================
# 古诗 API
# ====================

@app.route('/api/poems', methods=['GET'])
def get_poems():
    """获取所有古诗"""
    poems = Poem.query.order_by(Poem.created_at.desc()).all()
    result = []
    for poem in poems:
        result.append({
            'id': poem.id,
            'title': poem.title,
            'author': poem.author or '',
            'content': poem.content,
            'isCompleted': poem.is_completed,
            'createdAt': poem.created_at.isoformat(),
            'completedAt': poem.completed_at.isoformat() if poem.completed_at else None
        })
    return jsonify(result)

@app.route('/api/poems', methods=['POST'])
def add_poem():
    """添加古诗"""
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('content'):
        return jsonify({'error': '诗名和内容不能为空'}), 400
    
    poem = Poem(
        title=data['title'],
        author=data.get('author', ''),
        content=data['content']
    )
    db.session.add(poem)
    db.session.commit()
    
    return jsonify({
        'id': poem.id,
        'title': poem.title,
        'author': poem.author or '',
        'content': poem.content,
        'isCompleted': poem.is_completed,
        'createdAt': poem.created_at.isoformat()
    }), 201

@app.route('/api/poems/<int:poem_id>', methods=['PUT'])
def update_poem(poem_id):
    """更新古诗"""
    poem = Poem.query.get_or_404(poem_id)
    data = request.get_json()
    
    if data.get('title'):
        poem.title = data['title']
    if 'author' in data:
        poem.author = data['author']
    if data.get('content'):
        poem.content = data['content']
    
    db.session.commit()
    
    return jsonify({
        'id': poem.id,
        'title': poem.title,
        'author': poem.author or '',
        'content': poem.content,
        'isCompleted': poem.is_completed,
        'createdAt': poem.created_at.isoformat(),
        'completedAt': poem.completed_at.isoformat() if poem.completed_at else None
    })

@app.route('/api/poems/<int:poem_id>', methods=['DELETE'])
def delete_poem(poem_id):
    """删除古诗"""
    poem = Poem.query.get_or_404(poem_id)
    db.session.delete(poem)
    db.session.commit()
    return jsonify({'message': '删除成功'}), 200

@app.route('/api/poems/<int:poem_id>/complete', methods=['POST'])
def complete_poem(poem_id):
    """标记古诗为已完成（奖励5颗星）"""
    poem = Poem.query.get_or_404(poem_id)
    
    if poem.is_completed:
        return jsonify({'error': '该古诗已经完成过了'}), 400
    
    poem.is_completed = True
    poem.completed_at = datetime.utcnow()
    
    # 增加星星 - 一首古诗5颗星
    star_record = StarRecord.query.first()
    if not star_record:
        star_record = StarRecord(stars=5)
        db.session.add(star_record)
    else:
        star_record.stars += 5
    
    db.session.commit()
    
    return jsonify({
        'message': '完成古诗！获得5颗星',
        'stars': star_record.stars,
        'completedAt': poem.completed_at.isoformat()
    }), 200

# ====================
# 日常任务 API
# ====================

@app.route('/api/daily-tasks', methods=['GET'])
def get_daily_tasks():
    """获取所有日常任务"""
    tasks = DailyTask.query.order_by(DailyTask.created_at.desc()).all()
    result = []
    for task in tasks:
        completions_count = TaskCompletion.query.filter_by(task_id=task.id).count()
        last_completion = TaskCompletion.query.filter_by(task_id=task.id).order_by(TaskCompletion.completed_at.desc()).first()
        
        result.append({
            'id': task.id,
            'taskName': task.task_name,
            'rewardStars': task.reward_stars,
            'description': task.description or '',
            'createdAt': task.created_at.isoformat(),
            'completionsCount': completions_count,
            'lastCompletedAt': last_completion.completed_at.isoformat() if last_completion else None
        })
    return jsonify(result)

@app.route('/api/daily-tasks', methods=['POST'])
def add_daily_task():
    """添加日常任务"""
    data = request.get_json()
    
    if not data or not data.get('taskName'):
        return jsonify({'error': '任务名称不能为空'}), 400
    
    task = DailyTask(
        task_name=data['taskName'],
        reward_stars=data.get('rewardStars', 0),
        description=data.get('description', '')
    )
    db.session.add(task)
    db.session.commit()
    
    return jsonify({
        'id': task.id,
        'taskName': task.task_name,
        'rewardStars': task.reward_stars,
        'description': task.description or '',
        'createdAt': task.created_at.isoformat(),
        'completionsCount': 0
    }), 201

@app.route('/api/daily-tasks/<int:task_id>', methods=['PUT'])
def update_daily_task(task_id):
    """更新日常任务"""
    task = DailyTask.query.get_or_404(task_id)
    data = request.get_json()
    
    if data.get('taskName'):
        task.task_name = data['taskName']
    if 'rewardStars' in data:
        task.reward_stars = data['rewardStars']
    if 'description' in data:
        task.description = data['description']
    
    db.session.commit()
    
    completions_count = TaskCompletion.query.filter_by(task_id=task.id).count()
    
    return jsonify({
        'id': task.id,
        'taskName': task.task_name,
        'rewardStars': task.reward_stars,
        'description': task.description or '',
        'createdAt': task.created_at.isoformat(),
        'completionsCount': completions_count
    })

@app.route('/api/daily-tasks/<int:task_id>', methods=['DELETE'])
def delete_daily_task(task_id):
    """删除日常任务"""
    task = DailyTask.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': '删除成功'}), 200

@app.route('/api/daily-tasks/<int:task_id>/complete', methods=['POST'])
def complete_daily_task(task_id):
    """完成日常任务（奖励星星）"""
    task = DailyTask.query.get_or_404(task_id)
    data = request.get_json() or {}
    
    # 创建完成记录
    completion = TaskCompletion(
        task_id=task.id,
        notes=data.get('notes', ''),
        stars_earned=task.reward_stars
    )
    db.session.add(completion)
    
    # 增加星星
    star_record = StarRecord.query.first()
    if not star_record:
        star_record = StarRecord(stars=task.reward_stars)
        db.session.add(star_record)
    else:
        star_record.stars += task.reward_stars
    
    db.session.commit()
    
    return jsonify({
        'message': f'完成任务！获得{task.reward_stars}颗星',
        'stars': star_record.stars,
        'starsEarned': task.reward_stars,
        'completedAt': completion.completed_at.isoformat()
    }), 200

@app.route('/api/daily-tasks/<int:task_id>/completions', methods=['GET'])
def get_task_completions(task_id):
    """获取任务完成记录"""
    DailyTask.query.get_or_404(task_id)  # 验证任务存在
    completions = TaskCompletion.query.filter_by(task_id=task_id).order_by(TaskCompletion.completed_at.desc()).all()
    
    result = []
    for comp in completions:
        result.append({
            'id': comp.id,
            'completedAt': comp.completed_at.isoformat(),
            'notes': comp.notes or '',
            'starsEarned': comp.stars_earned
        })
    return jsonify(result)

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

