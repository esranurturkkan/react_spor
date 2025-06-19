const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');
const app = express();
app.use(cors());
app.use(express.json());


app.post('/register', async(req, res) => {
    console.log(' Gelen veri:', req.body);
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, hashedPassword]
        );

        res.status(201).json({ user: result.rows[0] });
    } catch (err) {
        console.error('Kayıt hatası:', err);
        res.status(500).json({ error: err.message });

    }
});

app.post('/login', async(req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Bu email ile kayıtlı kullanıcı bulunamadı.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Şifre yanlış.' });
        }

        const token = jwt.sign({ userId: user.id },
            process.env.JWT_SECRET, { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Giriş başarılı!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });

    } catch (error) {
        console.error('Login hatası:', error.message);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});


function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token bulunamadı.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Geçersiz token.' });
    }
}

app.get('/profile', verifyToken, async(req, res) => {
    try {
        const result = await db.query(
            `SELECT id, name, email, age, height_cm, weight_kg,
              today_steps, today_calories, fitness_level
       FROM users WHERE id = $1`, [req.userId]
        );
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        res.status(200).json({ user });
    } catch (err) {
        console.error('Profile GET hatası:', err.message);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});


app.put('/profile', verifyToken, async(req, res) => {
    const {
        name,
        age,
        height_cm,
        weight_kg,
        today_steps,
        today_calories,
        fitness_level
    } = req.body;

    try {
        const result = await db.query(
            `UPDATE users
         SET name            = $1,
             age             = $2,
             height_cm       = $3,
             weight_kg       = $4,
             today_steps     = $5,
             today_calories  = $6,
             fitness_level   = $7
       WHERE id = $8
       RETURNING id, name, email, age, height_cm, weight_kg,
                 today_steps, today_calories, fitness_level`, [name, age, height_cm, weight_kg,
                today_steps, today_calories, fitness_level,
                req.userId
            ]
        );
        res.status(200).json({ user: result.rows[0] });
    } catch (err) {
        console.error('Profile PUT hatası:', err.message);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});

app.delete('/profile', verifyToken, async(req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.userId]);
        res.status(200).json({ message: 'Kullanıcı başarıyla silindi.' });
    } catch (err) {
        console.error('Profile DELETE hatası:', err.message);
        res.status(500).json({ error: 'Silme sırasında sunucu hatası.' });
    }
});

app.get('/goals', verifyToken, async(req, res) => {
    try {
        const result = await db.query(
            'SELECT daily_step_goal, daily_calorie_goal FROM users WHERE id = $1', [req.userId]
        );

        const goals = result.rows[0];

        if (!goals) {
            return res.status(404).json({ error: 'Hedefler bulunamadı.' });
        }

        res.status(200).json({ goals });
    } catch (err) {
        console.error('GET /goals hatası:', err.message);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});

app.put('/goals', verifyToken, async(req, res) => {
    const { daily_step_goal, daily_calorie_goal } = req.body;

    try {
        const result = await db.query(
            'UPDATE users SET daily_step_goal = $1, daily_calorie_goal = $2 WHERE id = $3 RETURNING daily_step_goal, daily_calorie_goal', [daily_step_goal, daily_calorie_goal, req.userId]
        );
        res.status(200).json({ goals: result.rows[0] });
    } catch (err) {
        console.error('Goals PUT hatası:', err.message);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});

app.get('/nutrition', verifyToken, async(req, res) => {
    try {
        const result = await db.query(
            `SELECT 
           COALESCE(water_ml, 0) AS water_ml,
           COALESCE(protein_gram, 0) AS protein_gram,
           COALESCE(carb_gram, 0) AS carb_gram,
           COALESCE(fat_gram, 0) AS fat_gram
         FROM users
         WHERE id = $1`, [req.userId]
        );

        const nutrition = result.rows[0];

        if (!nutrition) {
            return res.status(404).json({ error: 'Beslenme verisi bulunamadı.' });
        }

        res.status(200).json({ nutrition });
    } catch (err) {
        console.error('GET /nutrition hatası:', err.message);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});


app.put('/nutrition', verifyToken, async(req, res) => {
    const { water_ml, protein_gram, carb_gram, fat_gram } = req.body;

    console.log('>> Gelen veri:', req.body);

    try {
        const result = await db.query(
            `UPDATE users SET water_ml = $1, protein_gram = $2, carb_gram = $3, fat_gram = $4
         WHERE id = $5 RETURNING water_ml, protein_gram, carb_gram, fat_gram`, [water_ml, protein_gram, carb_gram, fat_gram, req.userId]
        );

        res.status(200).json({ nutrition: result.rows[0] });
    } catch (err) {
        console.error('PUT /nutrition hatası:', err.message);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});

app.post('/calendar', verifyToken, async(req, res) => {
    const { date, exercise_name, duration_minutes, calories_burned, difficulty } = req.body;
    const user = await db.query('SELECT calendar_data FROM users WHERE id = $1', [req.userId]);
    const calendarData = user.rows[0].calendar_data || {};
    const dayEntries = calendarData[date] || [];
    dayEntries.push({ exercise_name, duration: duration_minutes, calories: calories_burned, difficulty });
    calendarData[date] = dayEntries;
    await db.query('UPDATE users SET calendar_data = $1 WHERE id = $2', [calendarData, req.userId]);
    res.json({ message: 'Kaydedildi' });
});

app.get('/calendar', verifyToken, async(req, res) => {
    const { year, month } = req.query;
    const result = await db.query('SELECT calendar_data FROM users WHERE id = $1', [req.userId]);
    const calendarData = result.rows[0].calendar_data || {};


    const entries = Object.entries(calendarData)
        .filter(([date]) => date.startsWith(`${year}-${month}`))
        .flatMap(([date, list]) => list.map(e => ({
            date,
            exercise_name: e.exercise_name,
            duration_minutes: Number(e.duration),
            calories_burned: Number(e.calories),
            difficulty: e.difficulty
        })));

    res.json({ entries });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} üzerinde çalışıyor`);
});