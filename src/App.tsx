import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layout } from './components/Layout';

type Role = 'worker' | 'employer';

type JobType = '仓储分拣' | '餐饮服务' | '活动执行' | '客服文员';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  hourlyRate: number;
  tags: string[];
  type: JobType;
  shift: string;
  date: string;
  spotsLeft: number;
  status: 'open' | 'paused';
  createdAt: string;
}

interface Application {
  id: string;
  jobId: string;
  workerName: string;
  phone: string;
  note?: string;
  createdAt: string;
}

interface AuthUser {
  id: string;
  role: Role;
  name: string;
  phone: string;
}

type AuthMode = 'login' | 'register';

const API_BASE = '/api';

const MOCK_JOBS: Job[] = [
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

export default function App() {
  const [role, setRole] = useState<Role>('worker');
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(MOCK_JOBS[0]?.id ?? null);

  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState<JobType | '全部'>('全部');

  const [workerName, setWorkerName] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerNote, setWorkerNote] = useState('');

  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem('tempjobs_auth_user');
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        if (parsed && parsed.phone) {
          return parsed;
        }
      }
    } catch {
      // ignore parse errors
    }
    return null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authFormRole, setAuthFormRole] = useState<Role>('worker');
  const [authFormName, setAuthFormName] = useState('');
  const [authFormPhone, setAuthFormPhone] = useState('');

  const [favoriteJobIds, setFavoriteJobIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem('tempjobs_favorite_jobs');
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [recentJobIds, setRecentJobIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem('tempjobs_recent_jobs');
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [newJob, setNewJob] = useState<Omit<Job, 'id' | 'createdAt' | 'status'>>({
    title: '',
    company: '',
    location: '',
    hourlyRate: 30,
    tags: [],
    type: '仓储分拣',
    shift: '',
    date: '',
    spotsLeft: 5
  });

  const mainRef = useRef<HTMLDivElement | null>(null);

  const isWorkerLoggedIn = authUser?.role === 'worker';
  const isEmployerLoggedIn = authUser?.role === 'employer';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch(`${API_BASE}/jobs`),
          fetch(`${API_BASE}/applications`)
        ]);
        if (jobsRes.ok) {
          const data = (await jobsRes.json()) as Job[];
          setJobs(data);
          if (!selectedJobId && data[0]) {
            setSelectedJobId(data[0].id);
          }
        } else {
          setJobs(MOCK_JOBS);
        }
        if (appsRes.ok) {
          const data = (await appsRes.json()) as Application[];
          setApplications(data);
        }
      } catch {
        setJobs(MOCK_JOBS);
      }
    };
    fetchAll();
  }, [selectedJobId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (authUser) {
        window.localStorage.setItem('tempjobs_auth_user', JSON.stringify(authUser));
      } else {
        window.localStorage.removeItem('tempjobs_auth_user');
      }
    } catch {
      // ignore storage errors
    }
  }, [authUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('tempjobs_favorite_jobs', JSON.stringify(favoriteJobIds));
    } catch {
      // ignore
    }
  }, [favoriteJobIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('tempjobs_recent_jobs', JSON.stringify(recentJobIds));
    } catch {
      // ignore
    }
  }, [recentJobIds]);

  const scrollToMain = () => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchLocation =
        !filterLocation || job.location.toLowerCase().includes(filterLocation.toLowerCase());
      const matchType = filterType === '全部' || job.type === filterType;
      return matchLocation && matchType;
    });
  }, [jobs, filterLocation, filterType]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) ?? filteredJobs[0] ?? null,
    [jobs, selectedJobId, filteredJobs]
  );

  const favoriteJobs = useMemo(
    () => jobs.filter((job) => favoriteJobIds.includes(job.id)),
    [jobs, favoriteJobIds]
  );

  const recentJobs = useMemo(
    () =>
      recentJobIds
        .map((id) => jobs.find((job) => job.id === id))
        .filter((job): job is Job => Boolean(job)),
    [jobs, recentJobIds]
  );

  const applicationCountByJobId = useMemo(() => {
    const map: Record<string, number> = {};
    applications.forEach((app) => {
      map[app.jobId] = (map[app.jobId] || 0) + 1;
    });
    return map;
  }, [applications]);

  const employerStats = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const openJobs = jobs.filter((job) => job.status === 'open').length;
    const jobsThisWeek = jobs.filter((job) => {
      const created = new Date(job.createdAt).getTime();
      return Number.isFinite(created) && now - created <= weekMs;
    }).length;
    const todayKey = new Date().toISOString().slice(0, 10);
    const applicationsToday = applications.filter(
      (app) => app.createdAt && app.createdAt.slice(0, 10) === todayKey
    ).length;
    return { openJobs, jobsThisWeek, applicationsToday };
  }, [jobs, applications]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!workerName.trim() || !workerPhone.trim()) {
      alert('请填写姓名和手机号');
      return;
    }
    const payload = {
      jobId: selectedJob.id,
      workerName: workerName.trim(),
      phone: workerPhone.trim(),
      note: workerNote.trim() || undefined
    };
    fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('failed');
        const created = (await res.json()) as Application;
        setApplications((prev) => [created, ...prev]);
        setWorkerName('');
        setWorkerPhone('');
        setWorkerNote('');
        alert('报名成功！');
      })
      .catch(() => {
        alert('报名请求失败，请确认后端服务已启动（npm run server）。');
      });
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title.trim() || !newJob.company.trim() || !newJob.location.trim()) {
      alert('请至少填写岗位名称、企业名称和工作地点');
      return;
    }
    const payload = {
      ...newJob
    };
    fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('failed');
        const created = (await res.json()) as Job;
        setJobs((prev) => [created, ...prev]);
        setNewJob({
          title: '',
          company: '',
          location: '',
          hourlyRate: 30,
          tags: [],
          type: '仓储分拣',
          shift: '',
          date: '',
          spotsLeft: 5
        });
        setRole('worker');
        setSelectedJobId(created.id);
        alert('岗位已发布！');
      })
      .catch(() => {
        alert('岗位发布失败，请确认后端服务已启动（npm run server）。');
      });
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = authFormPhone.trim();
    const name = authFormName.trim();
    if (!phone) {
      alert('请填写手机号');
      return;
    }

    if (authMode === 'register') {
      const user: AuthUser = {
        id: `${Date.now()}`,
        role: authFormRole,
        name: name || (authFormRole === 'worker' ? '灵人用户' : '企业用户'),
        phone
      };
      setAuthUser(user);
      setRole(user.role);
      setShowAuthModal(false);
      alert('注册并登录成功！');
      return;
    }

    if (!authUser) {
      alert('未找到账号，请先切换到注册创建账号。');
      return;
    }

    if (authUser.phone === phone && authUser.role === authFormRole) {
      setRole(authUser.role);
      setShowAuthModal(false);
      alert('登录成功！');
    } else {
      alert('未找到匹配的本地账号，请确认角色和手机号，或切换到注册。');
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setShowAuthModal(false);
    alert('已退出登录。');
  };

  const applicationsWithJob = useMemo(
    () =>
      applications.map((app) => ({
        ...app,
        job: jobs.find((j) => j.id === app.jobId)
      })),
    [applications, jobs]
  );

  const openAuthForRole = (targetRole: Role, mode?: AuthMode) => {
    const nextMode: AuthMode = mode ?? (authUser && authUser.role === targetRole ? 'login' : 'register');
    setAuthFormRole(targetRole);
    if (authUser && authUser.role === targetRole) {
      setAuthFormName(authUser.name);
      setAuthFormPhone(authUser.phone);
    } else {
      setAuthFormName('');
      setAuthFormPhone('');
    }
    setAuthMode(nextMode);
    setShowAuthModal(true);
  };

  return (
    <Layout
      authDisplay={{
        loggedIn: !!authUser,
        name: authUser?.name,
        roleLabel: authUser ? (authUser.role === 'worker' ? '灵人端' : '企业端') : undefined
      }}
      onAuthClick={() => {
        setAuthMode(authUser ? 'login' : 'register');
        setAuthFormRole(role);
        setAuthFormName(authUser?.name ?? '');
        setAuthFormPhone(authUser?.phone ?? '');
        setShowAuthModal(true);
      }}
    >
      <section className="space-y-8">
        {/* 顶部大横幅：参考 job&talent 左右分栏 */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5">
          <div className="grid md:grid-cols-2">
            {/* 左侧：灵人 */}
            <div className="relative bg-gradient-to-br from-amber-50 via-[#FFF5E6] to-[#FFE4C7] px-6 py-9 sm:px-10 sm:py-11 flex flex-col justify-between">
              <div className="max-w-md space-y-4">
                <div className="text-[10px] font-bold tracking-widest uppercase text-amber-700/90">
                  FOR JOB SEEKERS · 灵人
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight tracking-tight">
                  在手机里找到
                  <br />
                  稳定灵活的工作
                </h1>
                <p className="text-sm text-slate-700/90 leading-relaxed">
                  附近真实用工机会，按小时结算，支持日结 / 周结。
                  无需简历，几步完成报名，随时开始赚钱。
                </p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setRole('worker');
                    openAuthForRole('worker');
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 font-semibold text-white shadow-lg shadow-slate-900/25 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  立即登录 / 注册灵人端
                </button>
                <button
                  type="button"
                  onClick={() => scrollToMain()}
                  className="inline-flex items-center justify-center rounded-full border-2 border-slate-400/50 bg-white/60 px-6 py-2.5 font-semibold text-slate-800 hover:bg-slate-900/10 hover:border-slate-500/60 transition-all duration-200"
                >
                  先看看岗位
                </button>
              </div>
            </div>

            {/* 右侧：企业 */}
            <div className="relative bg-gradient-to-br from-teal-50 via-[#E6FFFA] to-[#00D3C0]/90 px-6 py-9 sm:px-10 sm:py-11 flex flex-col justify-between text-slate-900">
              <div className="max-w-md space-y-4">
                <div className="text-[10px] font-bold tracking-widest uppercase text-teal-800/90">
                  FOR COMPANIES · 企业
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-slate-900">
                  一键招满
                  <br />
                  可信赖的灵活用工
                </h2>
                <p className="text-sm text-slate-800/85 leading-relaxed">
                  触达经过平台筛选的灵人，支持多班次、多门店统一管理。
                  可对接排班、打卡与结算系统，提升用工效率。
                </p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setRole('employer');
                    scrollToMain();
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 font-semibold text-white shadow-lg shadow-slate-900/25 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  了解产品 / 立即体验
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('employer');
                    openAuthForRole('employer');
                  }}
                  className="inline-flex items-center justify-center rounded-full border-2 border-slate-900/40 bg-white/50 px-6 py-2.5 font-semibold text-slate-900 hover:bg-slate-900/10 hover:border-slate-700/60 transition-all duration-200"
                >
                  企业登录 / 注册
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 下方主体区域：根据角色切换内容，可通过滚动或按钮跳转 */}
        <div ref={mainRef} className="grid gap-6 md:grid-cols-[1.6fr,1fr]">
          {/* 左侧：列表 / 发布表单 */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-4 shadow-md shadow-slate-200/40 border border-slate-200/60">
              <div>
                <div className="text-xs font-medium text-slate-600 mb-0.5">
                  当前视图：{role === 'worker' ? '灵人页面（岗位列表 + 报名）' : '企业页面（发布岗位 + 报名概览）'}
                </div>
                <p className="text-sm text-slate-500">
                  向上滑动即可浏览完整内容，也可以在顶部卡片切换灵人 / 企业视角。
                </p>
              </div>
              <div className="inline-flex rounded-full bg-slate-100 p-1 text-[11px] font-medium ring-1 ring-slate-200/60">
                <button
                  className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                    role === 'worker' ? 'bg-white shadow-md text-slate-900 font-semibold ring-1 ring-slate-200/80' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setRole('worker')}
                  type="button"
                >
                  灵人页面
                </button>
                <button
                  className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                    role === 'employer' ? 'bg-white shadow-md text-slate-900 font-semibold ring-1 ring-slate-200/80' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setRole('employer')}
                  type="button"
                >
                  企业页面
                </button>
              </div>
            </div>

            {role === 'worker' && showJobDetail && selectedJob && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowJobDetail(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  ← 返回岗位列表
                </button>
                <div className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/40 border border-slate-200/60 ring-1 ring-slate-900/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-900">{selectedJob.title}</h2>
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand">
                          {selectedJob.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                        <span>{selectedJob.company}</span>
                        <span>·</span>
                        <span>{selectedJob.location}</span>
                        <span>·</span>
                        <span>{selectedJob.date}</span>
                        <span>·</span>
                        <span>{selectedJob.shift}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedJob.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFavoriteJobIds((prev) =>
                            prev.includes(selectedJob.id)
                              ? prev.filter((id) => id !== selectedJob.id)
                              : [...prev, selectedJob.id]
                          );
                        }}
                        className="mt-3 inline-flex items-center rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-100"
                      >
                        {favoriteJobIds.includes(selectedJob.id) ? '已收藏岗位' : '收藏该岗位'}
                      </button>
                      <div className="mt-3 text-xs text-slate-600 leading-relaxed">
                        这里是岗位详情页面示意，可根据实际业务补充更丰富的信息，例如岗位要求、到岗流程、结算规则、注意事项等。
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-emerald-600">
                        ¥{selectedJob.hourlyRate}/小时
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        剩余名额 {selectedJob.spotsLeft} 人
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 border-t pt-3 text-[11px] text-slate-500">
                    岗位要求、到岗流程、结算规则及注意事项等详情，请联系用工方确认。
                  </div>
                </div>
              </div>
            )}

            {role === 'worker' && (!showJobDetail || !selectedJob) && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-4 shadow-md shadow-slate-200/40 border border-slate-200/60">
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[150px]">
                      <label className="text-xs text-slate-500">城市 / 区域</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                        placeholder="例如：上海 静安区"
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">岗位类型</label>
                      <select
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as JobType | '全部')}
                      >
                        <option value="全部">全部</option>
                        <option value="仓储分拣">仓储分拣</option>
                        <option value="餐饮服务">餐饮服务</option>
                        <option value="活动执行">活动执行</option>
                        <option value="客服文员">客服文员</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterLocation('');
                        setFilterType('全部');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      重置筛选
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {(favoriteJobs.length > 0 || recentJobs.length > 0) && (
                    <div className="rounded-2xl bg-slate-900 text-slate-50 px-4 py-3 text-[11px] space-y-2">
                      {favoriteJobs.length > 0 && (
                        <div>
                          <div className="mb-1 font-medium">我的收藏岗位</div>
                          <div className="flex flex-wrap gap-1.5">
                            {favoriteJobs.map((job) => (
                              <button
                                key={job.id}
                                type="button"
                                onClick={() => {
                                  setSelectedJobId(job.id);
                                  setShowJobDetail(true);
                                }}
                                className="rounded-full bg-slate-800 px-2.5 py-0.5 hover:bg-slate-700"
                              >
                                {job.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {recentJobs.length > 0 && (
                        <div>
                          <div className="mt-2 mb-1 font-medium">最近浏览</div>
                          <div className="flex flex-wrap gap-1.5">
                            {recentJobs.map((job) => (
                              <button
                                key={job.id}
                                type="button"
                                onClick={() => {
                                  setSelectedJobId(job.id);
                                  setShowJobDetail(true);
                                }}
                                className="rounded-full bg-slate-800/70 px-2.5 py-0.5 hover:bg-slate-700"
                              >
                                {job.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {filteredJobs.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                      当前筛选条件下暂无岗位，试试放宽条件或切换城市。
                    </div>
                  )}
                  {filteredJobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setShowJobDetail(true);
                        setRecentJobIds((prev) => {
                          const next = [job.id, ...prev.filter((id) => id !== job.id)];
                          return next.slice(0, 6);
                        });
                      }}
                      className={`w-full text-left rounded-2xl border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                        selectedJob?.id === job.id
                          ? 'border-blue-300 shadow-lg shadow-blue-100/50 ring-2 ring-blue-300/60'
                          : 'border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-slate-900">{job.title}</h2>
                            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand">
                              {job.type}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                            <span>{job.company}</span>
                            <span>·</span>
                            <span>{job.location}</span>
                            <span>·</span>
                            <span>{job.date}</span>
                            <span>·</span>
                            <span>{job.shift}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {job.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-emerald-600">
                            ¥{job.hourlyRate}/小时
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">
                            剩余名额 {job.spotsLeft} 人
                          </div>
                          <div className="mt-2">
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                              立即报名 · 系统推荐匹配
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {role === 'employer' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-blue-50/80 border border-blue-200/60 p-4 text-xs text-slate-700 shadow-sm">
                  <div className="font-medium mb-1">快速发布灵活用工岗位</div>
                  <p>
                    发布岗位后，右侧可实时查看报名情况。岗位与报名数据将保存至平台服务器。
                  </p>
                </div>

                <form
                  onSubmit={isEmployerLoggedIn ? handleCreateJob : (e) => {
                    e.preventDefault();
                    openAuthForRole('employer');
                  }}
                  className="rounded-2xl bg-white p-4 shadow-md shadow-slate-200/40 border border-slate-200/60 space-y-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-500">岗位名称 *</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                        value={newJob.title}
                        onChange={(e) => setNewJob((j) => ({ ...j, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">企业名称 *</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                        value={newJob.company}
                        onChange={(e) => setNewJob((j) => ({ ...j, company: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">工作地点 *</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                        placeholder="例如：上海 · 闵行区"
                        value={newJob.location}
                        onChange={(e) => setNewJob((j) => ({ ...j, location: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">岗位类型</label>
                      <select
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                        value={newJob.type}
                        onChange={(e) => setNewJob((j) => ({ ...j, type: e.target.value as JobType }))}
                      >
                        <option value="仓储分拣">仓储分拣</option>
                        <option value="餐饮服务">餐饮服务</option>
                        <option value="活动执行">活动执行</option>
                        <option value="客服文员">客服文员</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">班次时间</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                        placeholder="例如：20:00 - 02:00"
                        value={newJob.shift}
                        onChange={(e) => setNewJob((j) => ({ ...j, shift: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">工作日期 / 周期</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                        placeholder="例如：本周六 / 长期"
                        value={newJob.date}
                        onChange={(e) => setNewJob((j) => ({ ...j, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">时薪（元/小时）</label>
                      <input
                        type="number"
                        min={20}
                        max={200}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                        value={newJob.hourlyRate}
                        onChange={(e) =>
                          setNewJob((j) => ({ ...j, hourlyRate: Number(e.target.value) || 0 }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">需求人数</label>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                        value={newJob.spotsLeft}
                        onChange={(e) =>
                          setNewJob((j) => ({ ...j, spotsLeft: Number(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">
                      岗位标签（用逗号分隔，如：可连做, 包工作餐）
                    </label>
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                      value={newJob.tags.join(', ')}
                      onChange={(e) =>
                        setNewJob((j) => ({
                          ...j,
                          tags: e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean)
                        }))
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setJobs(MOCK_JOBS);
                        setApplications([]);
                        if (typeof window !== 'undefined') {
                          try {
                            window.localStorage.removeItem('tempjobs_jobs');
                            window.localStorage.removeItem('tempjobs_applications');
                          } catch {
                            // ignore storage errors
                          }
                        }
                        alert('已重置为默认数据。');
                      }}
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                    >
                      清空本地数据
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewJob({
                          title: '',
                          company: '',
                          location: '',
                          hourlyRate: 30,
                          tags: [],
                          type: '仓储分拣',
                          shift: '',
                          date: '',
                          spotsLeft: 5
                        })
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      清空
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-brand px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-600"
                    >
                      {isEmployerLoggedIn ? '发布岗位' : '登录企业账号后发布'}
                    </button>
                  </div>
                </form>

                <div className="rounded-2xl bg-white p-4 shadow-md shadow-slate-200/40 border border-slate-200/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-slate-900">已发布岗位管理</div>
                    <div className="text-[11px] text-slate-500">
                      当前开放 {jobs.filter((job) => job.status === 'open').length} 个岗位
                    </div>
                  </div>
                  {jobs.length === 0 ? (
                    <div className="text-slate-500">暂无岗位，请先通过上方表单发布一个岗位。</div>
                  ) : (
                    <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
                      {jobs.map((job) => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-1.5"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="truncate text-xs font-medium text-slate-900">
                                {job.title}
                              </span>
                              <span className="rounded-full bg-slate-900 text-[10px] text-white px-1.5 py-0.5">
                                {job.type}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                报名 {applicationCountByJobId[job.id] ?? 0} 人
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {job.location} · 时薪 ¥{job.hourlyRate}/小时
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus = job.status === 'open' ? 'paused' : 'open';
                                fetch(`${API_BASE}/jobs/${job.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: nextStatus })
                                })
                                  .then((res) => {
                                    if (!res.ok) throw new Error('failed');
                                    setJobs((prev) =>
                                      prev.map((j) =>
                                        j.id === job.id ? { ...j, status: nextStatus } : j
                                      )
                                    );
                                  })
                                  .catch(() => {
                                    alert('更新岗位状态失败，请确认后端服务已启动（npm run server）。');
                                  });
                              }}
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                                job.status === 'open'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {job.status === 'open' ? '暂停招募' : '重新开放'}
                            </button>
                            <span className="text-[9px] text-slate-400">
                              {job.status === 'open' ? '开放中' : '已暂停'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：报名表单 / 报名概览 */}
          <aside className="space-y-4">
            {role === 'worker' ? (
              <div className="space-y-3">
                <div className="rounded-2xl bg-white shadow-md shadow-slate-200/40 border border-slate-200/60 p-4 ring-1 ring-slate-900/5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                    一键报名 · 快速匹配
                  </h3>
                  {selectedJob ? (
                    <>
                      <p className="text-xs text-slate-500 mb-3">
                        当前选择岗位：<span className="font-medium">{selectedJob.title}</span>
                      </p>
                      <form
                        onSubmit={isWorkerLoggedIn ? handleApply : (e) => {
                          e.preventDefault();
                          openAuthForRole('worker');
                        }}
                        className="space-y-2.5 text-xs"
                      >
                        <div>
                          <label className="text-slate-500">姓名 *</label>
                          <input
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                            placeholder="请填写真实姓名"
                            value={workerName}
                            onChange={(e) => setWorkerName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-slate-500">手机号 *</label>
                          <input
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                            placeholder="用于联系与签到"
                            value={workerPhone}
                            onChange={(e) => setWorkerPhone(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-slate-500">备注（可选）</label>
                          <textarea
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                            rows={2}
                            placeholder="例如：有类似经验，可朋友一起，某时间段不方便等"
                            value={workerNote}
                            onChange={(e) => setWorkerNote(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          className="mt-1 w-full rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-600"
                        >
                          {isWorkerLoggedIn ? '立即报名' : '登录灵人账号后报名'}
                        </button>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {isWorkerLoggedIn
                            ? '报名信息将提交至平台，用工方将根据联系方式与你沟通。'
                            : '请先以灵人身份登录或注册后再报名。'}
                        </p>
                      </form>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500">
                      请先在左侧列表中选择一个感兴趣的岗位，再进行报名。
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200/60 bg-white p-4 text-xs text-slate-500 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-1.5 text-sm">如何快速赚钱？</div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>尽量填写真实准确的个人信息，便于用工方快速沟通。</li>
                    <li>优先选择离你近、班次时间适合的岗位，提升到岗率。</li>
                    <li>保持手机畅通，注意短信和电话通知。</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl bg-white shadow-md shadow-slate-200/40 border border-slate-200/60 p-4 ring-1 ring-slate-900/5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                    报名概览
                  </h3>
                  {applicationsWithJob.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      暂无报名数据。发布岗位后，灵人报名记录将在此展示。
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {applicationsWithJob.map((app) => (
                        <div
                          key={app.id}
                          className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs"
                        >
                          <div className="flex justify-between gap-2">
                            <div>
                              <div className="font-medium text-slate-900">{app.workerName}</div>
                              <div className="text-[11px] text-slate-500">{app.phone}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[11px] text-slate-500">
                                {new Date(app.createdAt).toLocaleString('zh-CN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              {app.job && (
                                <div className="mt-1 inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-600">
                                  {app.job.title}
                                </div>
                              )}
                            </div>
                          </div>
                          {app.note && (
                            <div className="mt-1.5 text-[11px] text-slate-600">备注：{app.note}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-white p-4 text-xs text-slate-500 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-1.5 text-sm">后续可扩展方向</div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>接入后端 API，真正存储岗位与报名数据。</li>
                    <li>按城市 / 岗位类型 / 排班智能推荐合适灵活用工。</li>
                    <li>增加实名认证、劳务合同、结算等完整用工流程。</li>
                  </ul>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {showAuthModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl shadow-slate-300/40 border border-slate-200/60">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-semibold text-brand mb-0.5">账号中心</div>
                <div className="text-sm font-semibold text-slate-900">
                  {authMode === 'login' ? '登录灵活 Temp-Jobs' : '注册灵活 Temp-Jobs'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                关闭
              </button>
            </div>

            <div className="mb-3 inline-flex rounded-full bg-slate-100 p-0.5 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`px-3 py-1 rounded-full ${
                  authMode === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                }`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`px-3 py-1 rounded-full ${
                  authMode === 'register' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                }`}
              >
                注册
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthFormRole('worker')}
                  className={`flex-1 rounded-lg border px-3 py-1.5 ${
                    authFormRole === 'worker'
                      ? 'border-brand bg-brand-soft/40 text-brand'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  以灵人身份
                </button>
                <button
                  type="button"
                  onClick={() => setAuthFormRole('employer')}
                  className={`flex-1 rounded-lg border px-3 py-1.5 ${
                    authFormRole === 'employer'
                      ? 'border-brand bg-brand-soft/40 text-brand'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  以企业身份
                </button>
              </div>

              <div>
                <label className="text-slate-500">姓名（可选）</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                  placeholder={authFormRole === 'worker' ? '例如：张三' : '例如：XX 人事'}
                  value={authFormName}
                  onChange={(e) => setAuthFormName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-slate-500">手机号 *</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand/60"
                  placeholder="11 位手机号"
                  value={authFormPhone}
                  onChange={(e) => setAuthFormPhone(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="mt-1 w-full rounded-lg bg-brand px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-600"
              >
                {authMode === 'login' ? '登录' : '注册并登录'}
              </button>

              {authUser && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-slate-200 px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  退出当前登录（{authUser.name}）
                </button>
              )}

              <p className="text-[10px] text-slate-400">
                登录后可管理报名记录与岗位信息。
              </p>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

