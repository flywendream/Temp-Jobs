const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

/** In-memory data store for demo purposes */
let jobs = [
  {
    id: '1',
    title: '仓库分拣员（日结）',
    company: '顺丰仓储',
    location: '上海 · 闵行区',
    hourlyRate: 32,
    tags: ['包工作餐', '可连做', '简单易上手'],
    type: '仓储分拣',
    shift: '20:00 - 02:00',
    date: '今天',
    spotsLeft: 12,
    status: 'open',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: '音乐节现场检票',
    company: '某文化传媒',
    location: '上海 · 浦东新区',
    hourlyRate: 45,
    tags: ['室外', '年轻团队', '可朋友同岗'],
    type: '活动执行',
    shift: '16:00 - 23:00',
    date: '本周六',
    spotsLeft: 6,
    status: 'open',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: '咖啡店兼职店员',
    company: '城市角落咖啡',
    location: '上海 · 静安区',
    hourlyRate: 35,
    tags: ['可长期', '环境舒适'],
    type: '餐饮服务',
    shift: '09:00 - 18:00',
    date: '工作日排班',
    spotsLeft: 3,
    status: 'open',
    createdAt: new Date().toISOString()
  }
];

let applications = [];

app.get('/api/health', (req, res) => {
  res.json({ ok: true, jobs: jobs.length, applications: applications.length });
});

app.get('/api/jobs', (req, res) => {
  res.json(jobs);
});

app.post('/api/jobs', (req, res) => {
  const body = req.body || {};
  const id = String(Date.now());
  const job = {
    id,
    title: body.title || '未命名岗位',
    company: body.company || '某企业',
    location: body.location || '待定',
    hourlyRate: Number(body.hourlyRate) || 30,
    tags: Array.isArray(body.tags) ? body.tags : [],
    type: body.type || '仓储分拣',
    shift: body.shift || '',
    date: body.date || '',
    spotsLeft: Number(body.spotsLeft) || 0,
    status: 'open',
    createdAt: new Date().toISOString()
  };
  jobs = [job, ...jobs];
  res.status(201).json(job);
});

app.patch('/api/jobs/:id', (req, res) => {
  const { id } = req.params;
  const index = jobs.findIndex((job) => job.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Job not found' });
  }
  const patch = req.body || {};
  jobs[index] = { ...jobs[index], ...patch };
  res.json(jobs[index]);
});

app.get('/api/applications', (req, res) => {
  res.json(applications);
});

app.post('/api/applications', (req, res) => {
  const body = req.body || {};
  if (!body.jobId) {
    return res.status(400).json({ error: 'jobId is required' });
  }
  const id = String(Date.now());
  const application = {
    id,
    jobId: String(body.jobId),
    workerName: body.workerName || '匿名灵人',
    phone: body.phone || '',
    note: body.note || '',
    createdAt: new Date().toISOString()
  };
  applications = [application, ...applications];
  res.status(201).json(application);
});

// Static frontend in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`灵活 Temp-Jobs API + Web running on http://localhost:${PORT}`);
});


