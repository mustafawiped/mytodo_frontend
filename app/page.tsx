"use client";

import { FormEvent, useMemo, useState } from "react";

type TaskStatus = "todo" | "in-progress" | "completed";
type TaskPriority = "Düşük" | "Orta" | "Yüksek";

type Task = {
  id: number;
  title: string;
  category: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
};

const starterTasks: Task[] = [
  {
    id: 1,
    title: "MongoDB veri modelini netleştir",
    category: "Altyapı",
    dueDate: "Bugün",
    status: "in-progress",
    priority: "Yüksek",
  },
  {
    id: 2,
    title: "Giriş ekranı metinlerini gözden geçir",
    category: "Ürün",
    dueDate: "Yarın",
    status: "todo",
    priority: "Orta",
  },
  {
    id: 3,
    title: "Görev filtreleri için boş durum tasarla",
    category: "Tasarım",
    dueDate: "10 Ağu",
    status: "completed",
    priority: "Düşük",
  },
  {
    id: 4,
    title: "Express API uçlarını listele",
    category: "Altyapı",
    dueDate: "12 Ağu",
    status: "todo",
    priority: "Yüksek",
  },
  {
    id: 5,
    title: "Mobil görünümü kontrol et",
    category: "Tasarım",
    dueDate: "14 Ağu",
    status: "in-progress",
    priority: "Orta",
  },
];

const statusLabels: Record<TaskStatus, string> = {
  todo: "Yapılacak",
  "in-progress": "Devam ediyor",
  completed: "Tamamlandı",
};

const emptyTask: Omit<Task, "id"> = {
  title: "",
  category: "Ürün",
  dueDate: "Bugün",
  status: "todo",
  priority: "Orta",
};

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | TaskStatus>("all");
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [taskDraft, setTaskDraft] = useState(emptyTask);

  const visibleTasks = useMemo(() => {
    const normalizedSearch = searchText.trim().toLocaleLowerCase("tr-TR");

    return tasks.filter((task) => {
      const matchesFilter = activeFilter === "all" || task.status === activeFilter;
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLocaleLowerCase("tr-TR").includes(normalizedSearch) ||
        task.category.toLocaleLowerCase("tr-TR").includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchText, tasks]);

  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const activeCount = tasks.filter((task) => task.status === "in-progress").length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  function openNewTaskForm() {
    setEditingTaskId(null);
    setTaskDraft(emptyTask);
    setIsTaskFormOpen(true);
  }

  function openEditTaskForm(task: Task) {
    setEditingTaskId(task.id);
    setTaskDraft({
      title: task.title,
      category: task.category,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority,
    });
    setIsTaskFormOpen(true);
  }

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = taskDraft.title.trim();
    if (!cleanTitle) return;

    if (editingTaskId) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId ? { ...task, ...taskDraft, title: cleanTitle } : task,
        ),
      );
    } else {
      setTasks((currentTasks) => [
        { ...taskDraft, title: cleanTitle, id: Date.now() },
        ...currentTasks,
      ]);
    }

    setIsTaskFormOpen(false);
  }

  function deleteTask(taskId: number) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  function toggleTask(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "completed" ? "todo" : "completed" }
          : task,
      ),
    );
  }

  if (!isSignedIn) {
    return <SignInScreen onSignIn={() => setIsSignedIn(true)} />;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">M!</span>
          <span>MyToDo!</span>
        </div>

        <nav className="main-nav" aria-label="Ana menü">
          <button className="nav-item active" type="button">
            <span aria-hidden="true">⌂</span>
            Bugün
            <span className="nav-count">{tasks.length}</span>
          </button>
          <button className="nav-item" type="button">
            <span aria-hidden="true">◫</span>
            Tüm görevler
          </button>
          <button className="nav-item" type="button">
            <span aria-hidden="true">✓</span>
            Tamamlananlar
          </button>
        </nav>

        <div className="sidebar-section">
          <p className="sidebar-label">Listelerim</p>
          <button className="list-item" type="button">
            <span className="list-dot product" /> Ürün
          </button>
          <button className="list-item" type="button">
            <span className="list-dot design" /> Tasarım
          </button>
          <button className="list-item" type="button">
            <span className="list-dot backend" /> Altyapı
          </button>
        </div>

        <div className="sidebar-note">
          <span className="note-spark">✦</span>
          <strong>Küçük adımlar,</strong>
          <span>büyük işleri bitirir.</span>
        </div>

        <button className="profile" type="button" onClick={() => setIsSignedIn(false)}>
          <span className="avatar">DA</span>
          <span className="profile-copy">
            <strong>Deniz Akın</strong>
            <small>Çıkış yap</small>
          </span>
          <span aria-hidden="true">↗</span>
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="mobile-brand" type="button" aria-label="Menüyü aç">
            <span className="brand-mark">M!</span>
          </button>
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Görevlerde ara..."
              aria-label="Görevlerde ara"
            />
            <kbd>⌘ K</kbd>
          </label>
          <button className="notification-button" type="button" aria-label="Bildirimler">
            ♢<span />
          </button>
        </header>

        <div className="content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">7 AĞUSTOS, CUMA</p>
              <h1>Günaydın, Deniz <span aria-hidden="true">👋</span></h1>
              <p>Bugün önünde {tasks.length - completedCount} açık görev var. Sakin, sırayla gideriz.</p>
            </div>
            <button className="primary-button" type="button" onClick={openNewTaskForm}>
              <span aria-hidden="true">＋</span> Yeni görev
            </button>
          </section>

          <section className="summary-grid" aria-label="Görev özeti">
            <article className="summary-card coral-card">
              <span className="summary-icon">○</span>
              <div>
                <small>Toplam görev</small>
                <strong>{tasks.length}</strong>
              </div>
              <span className="summary-caption">Bu hafta</span>
            </article>
            <article className="summary-card blue-card">
              <span className="summary-icon">↗</span>
              <div>
                <small>Devam eden</small>
                <strong>{activeCount}</strong>
              </div>
              <span className="summary-caption">Odakta</span>
            </article>
            <article className="summary-card green-card">
              <span className="summary-icon">✓</span>
              <div>
                <small>Tamamlanan</small>
                <strong>{completedCount}</strong>
              </div>
              <span className="summary-caption">%{progress} bitti</span>
            </article>
          </section>

          <section className="tasks-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">GÜNÜN PLANI</p>
                <h2>Görevlerin</h2>
              </div>
              <div className="filter-tabs" role="group" aria-label="Görevleri filtrele">
                {[
                  ["all", "Tümü"],
                  ["todo", "Yapılacak"],
                  ["in-progress", "Devam eden"],
                  ["completed", "Bitenler"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={activeFilter === value ? "active" : ""}
                    onClick={() => setActiveFilter(value as "all" | TaskStatus)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="task-list">
              {visibleTasks.length ? (
                visibleTasks.map((task) => (
                  <article className={`task-card ${task.status === "completed" ? "is-complete" : ""}`} key={task.id}>
                    <button
                      className="task-check"
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      aria-label={task.status === "completed" ? "Görevi yeniden aç" : "Görevi tamamla"}
                    >
                      {task.status === "completed" ? "✓" : ""}
                    </button>
                    <div className="task-copy">
                      <h3>{task.title}</h3>
                      <div className="task-meta">
                        <span>{task.category}</span>
                        <span className="meta-divider">•</span>
                        <span>{task.dueDate}</span>
                        <span className={`priority priority-${task.priority.toLocaleLowerCase("tr-TR")}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <span className={`status-pill status-${task.status}`}>{statusLabels[task.status]}</span>
                    <div className="task-actions">
                      <button type="button" onClick={() => openEditTaskForm(task)} aria-label={`${task.title} görevini düzenle`}>
                        Düzenle
                      </button>
                      <button className="danger" type="button" onClick={() => deleteTask(task.id)} aria-label={`${task.title} görevini sil`}>
                        Sil
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <span>✓</span>
                  <h3>Burada görev görünmüyor.</h3>
                  <p>Aramayı veya filtreyi değiştirince görevlerin burada belirecek.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      {isTaskFormOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setIsTaskFormOpen(false)}>
          <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{editingTaskId ? "GÖREVİ GÜNCELLE" : "YENİ BİR ADIM"}</p>
                <h2 id="task-modal-title">{editingTaskId ? "Görevi düzenle" : "Yeni görev ekle"}</h2>
              </div>
              <button type="button" onClick={() => setIsTaskFormOpen(false)} aria-label="Pencereyi kapat">×</button>
            </div>
            <form onSubmit={saveTask}>
              <label className="form-field full-width">
                <span>Görev başlığı</span>
                <input
                  autoFocus
                  required
                  value={taskDraft.title}
                  onChange={(event) => setTaskDraft({ ...taskDraft, title: event.target.value })}
                  placeholder="Örn. API sözleşmesini hazırla"
                />
              </label>
              <div className="form-grid">
                <label className="form-field">
                  <span>Liste</span>
                  <select value={taskDraft.category} onChange={(event) => setTaskDraft({ ...taskDraft, category: event.target.value })}>
                    <option>Ürün</option>
                    <option>Tasarım</option>
                    <option>Altyapı</option>
                  </select>
                </label>
                <label className="form-field">
                  <span>Tarih</span>
                  <input value={taskDraft.dueDate} onChange={(event) => setTaskDraft({ ...taskDraft, dueDate: event.target.value })} />
                </label>
                <label className="form-field">
                  <span>Durum</span>
                  <select value={taskDraft.status} onChange={(event) => setTaskDraft({ ...taskDraft, status: event.target.value as TaskStatus })}>
                    <option value="todo">Yapılacak</option>
                    <option value="in-progress">Devam ediyor</option>
                    <option value="completed">Tamamlandı</option>
                  </select>
                </label>
                <label className="form-field">
                  <span>Öncelik</span>
                  <select value={taskDraft.priority} onChange={(event) => setTaskDraft({ ...taskDraft, priority: event.target.value as TaskPriority })}>
                    <option>Düşük</option>
                    <option>Orta</option>
                    <option>Yüksek</option>
                  </select>
                </label>
              </div>
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={() => setIsTaskFormOpen(false)}>Vazgeç</button>
                <button className="primary-button" type="submit">{editingTaskId ? "Değişiklikleri kaydet" : "Görevi ekle"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function SignInScreen({ onSignIn }: { onSignIn: () => void }) {
  function submitSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSignIn();
  }

  return (
    <main className="sign-in-page">
      <section className="sign-in-panel">
        <div className="brand sign-in-brand">
          <span className="brand-mark">M!</span>
          <span>MyToDo!</span>
        </div>
        <div className="sign-in-copy">
          <p className="eyebrow">YENİDEN HOŞ GELDİN</p>
          <h1>İşlerini aklından,<br />listene taşı.</h1>
          <p>Sade bir plan, berrak bir gün. Kaldığın yerden devam etmek için giriş yap.</p>
        </div>
        <form className="sign-in-form" onSubmit={submitSignIn}>
          <label className="form-field">
            <span>E-posta</span>
            <input type="email" defaultValue="deniz@mytodo.app" required />
          </label>
          <label className="form-field">
            <span>Şifre</span>
            <input type="password" defaultValue="mytodo123" required />
          </label>
          <div className="sign-in-options">
            <label><input type="checkbox" defaultChecked /> Beni hatırla</label>
            <button type="button">Şifremi unuttum</button>
          </div>
          <button className="primary-button sign-in-button" type="submit">Giriş yap <span>→</span></button>
        </form>
        <p className="demo-note">Bu ilk arayüz sürümüdür; herhangi bir e-posta ile giriş yapabilirsin.</p>
      </section>
      <section className="sign-in-visual" aria-hidden="true">
        <div className="visual-orbit orbit-one" />
        <div className="visual-orbit orbit-two" />
        <div className="floating-note note-one"><span>✓</span> Bugünün planı hazır</div>
        <div className="floating-note note-two"><strong>3</strong><span>görev tamamlandı</span></div>
        <p>“Bitirmek, başlamanın<br />en güzel hâli.”</p>
      </section>
    </main>
  );
}
