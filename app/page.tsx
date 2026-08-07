"use client";

import { FormEvent, useState } from "react";

type Todo = {
  id: number;
  title: string;
  detail: string;
  priority: boolean;
  completed: boolean;
};

type Note = {
  id: number;
  content: string;
};

const initialTodos: Todo[] = [
  {
    id: 1,
    title: "Express API yapısını planla",
    detail: "Kullanıcı ve yapılacak endpointlerini listele.",
    priority: true,
    completed: false,
  },
  {
    id: 2,
    title: "MongoDB koleksiyonlarını belirle",
    detail: "User ve todo belgelerinin alanlarını netleştir.",
    priority: false,
    completed: false,
  },
  {
    id: 3,
    title: "Giriş ekranını kontrol et",
    detail: "Mobil görünümde form alanlarını gözden geçir.",
    priority: false,
    completed: true,
  },
];

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [todoTitle, setTodoTitle] = useState("");
  const [todoDetail, setTodoDetail] = useState("");
  const [todoPriority, setTodoPriority] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  const activeTodos = todos.filter((todo) => !todo.completed);
  const priorityTodos = activeTodos.filter((todo) => todo.priority);
  const standardTodos = activeTodos.filter((todo) => !todo.priority);
  const completedTodos = todos.filter((todo) => todo.completed);

  function resetTodoForm() {
    setTodoTitle("");
    setTodoDetail("");
    setTodoPriority(false);
    setEditingTodoId(null);
  }

  function saveTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = todoTitle.trim();
    const cleanDetail = todoDetail.trim();

    if (!cleanTitle) return;

    if (editingTodoId !== null) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === editingTodoId
            ? { ...todo, title: cleanTitle, detail: cleanDetail, priority: todoPriority }
            : todo,
        ),
      );
    } else {
      setTodos((currentTodos) => [
        ...currentTodos,
        {
          id: Date.now(),
          title: cleanTitle,
          detail: cleanDetail,
          priority: todoPriority,
          completed: false,
        },
      ]);
    }

    resetTodoForm();
  }

  function startEditing(todo: Todo) {
    setEditingTodoId(todo.id);
    setTodoTitle(todo.title);
    setTodoDetail(todo.detail);
    setTodoPriority(todo.priority);
  }

  function deleteTodo(todoId: number) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId));

    if (editingTodoId === todoId) {
      resetTodoForm();
    }
  }

  function toggleTodo(todoId: number) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanNote = noteText.trim();

    if (!cleanNote) return;

    setNotes((currentNotes) => [
      { id: Date.now(), content: cleanNote },
      ...currentNotes,
    ]);
    setNoteText("");
  }

  if (!isSignedIn) {
    return <AuthScreen onAuthenticated={() => setIsSignedIn(true)} />;
  }

  return (
    <main className="dashboard-page">
      <header className="site-header">
        <Brand />
        <button className="text-button" type="button" onClick={() => setIsSignedIn(false)}>
          Çıkış yap
        </button>
      </header>

      <section className="dashboard-content">
        <div className="page-heading">
          <p className="eyebrow">My ToDo! Kaydedilen Notların</p>
          <h1>Bugün ne yapmak istiyorsun??</h1>
        </div>

        <div className="workspace-grid">
          <section className="glass-panel todo-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Kaydedilenler</p>
                <h2>Listen</h2>
              </div>
              <span className="item-count">{activeTodos.length}</span>
            </div>

            <form className="todo-form" onSubmit={saveTodo}>
              <input
                className="todo-title-input"
                value={todoTitle}
                onChange={(event) => setTodoTitle(event.target.value)}
                placeholder={editingTodoId === null ? "Yeni bir yapılacak yaz..." : "Yapılacağı düzenle..."}
                aria-label="Yapılacak başlığı"
                required
              />
              <textarea
                className="todo-detail-input"
                value={todoDetail}
                onChange={(event) => setTodoDetail(event.target.value)}
                placeholder="Detay ekle..."
                aria-label="Yapılacak detayı"
              />
              <div className="todo-form-footer">
                <label className="priority-toggle">
                  <input
                    type="checkbox"
                    checked={todoPriority}
                    onChange={(event) => setTodoPriority(event.target.checked)}
                  />
                  <span>Öncelikli</span>
                </label>
                <div className="todo-form-actions">
                  {editingTodoId !== null && (
                    <button className="ghost-button" type="button" onClick={resetTodoForm}>
                      Vazgeç
                    </button>
                  )}
                  <button className="primary-button" type="submit">
                    {editingTodoId === null ? "Ekle" : "Kaydet"}
                  </button>
                </div>
              </div>
            </form>

            <div className="todo-list">
              <TodoGroup
                title="Öncelikli"
                todos={priorityTodos}
                emptyText="Öncelikli yapılacak yok."
                editingTodoId={editingTodoId}
                onToggle={toggleTodo}
                onEdit={startEditing}
                onDelete={deleteTodo}
              />
              <TodoGroup
                title="Diğer yapılacaklar"
                todos={standardTodos}
                emptyText="Diğer yapılacak yok."
                editingTodoId={editingTodoId}
                onToggle={toggleTodo}
                onEdit={startEditing}
                onDelete={deleteTodo}
              />
              {completedTodos.length > 0 && (
                <TodoGroup
                  title="Tamamlananlar"
                  todos={completedTodos}
                  editingTodoId={editingTodoId}
                  onToggle={toggleTodo}
                  onEdit={startEditing}
                  onDelete={deleteTodo}
                />
              )}
            </div>
          </section>

          <section className="notes-column">
            <form className="glass-panel note-form" onSubmit={saveNote}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">NOT DEFTERİ</p>
                  <h2>Bir not bırak</h2>
                </div>
              </div>
              <textarea
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="Aklındaki notu buraya yaz..."
                aria-label="Not içeriği"
              />
              <button className="primary-button note-save-button" type="submit">
                Notu kaydet
              </button>
            </form>

            {notes.length > 0 && (
              <section className="saved-notes" aria-label="Kaydedilen notlar">
                {notes.map((note) => (
                  <article className="saved-note" key={note.id}>
                    <span className="note-mark" />
                    <p>{note.content}</p>
                  </article>
                ))}
              </section>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

type TodoGroupProps = {
  title: string;
  todos: Todo[];
  emptyText?: string;
  editingTodoId: number | null;
  onToggle: (todoId: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todoId: number) => void;
};

function TodoGroup({
  title,
  todos,
  emptyText,
  editingTodoId,
  onToggle,
  onEdit,
  onDelete,
}: TodoGroupProps) {
  return (
    <section className="todo-group">
      <div className="todo-group-heading">
        <h3>{title}</h3>
        <span>{todos.length}</span>
      </div>
      <div className="todo-group-items">
        {todos.length ? (
          todos.map((todo) => (
            <article
              className={`todo-row ${todo.completed ? "is-completed" : ""} ${editingTodoId === todo.id ? "is-editing" : ""}`}
              key={todo.id}
            >
              <button
                className="complete-button"
                type="button"
                onClick={() => onToggle(todo.id)}
                aria-label={todo.completed ? "Yapılmadı olarak işaretle" : "Yapıldı olarak işaretle"}
              >
                {todo.completed ? "✓" : ""}
              </button>
              <div className="todo-content">
                <div className="todo-title-line">
                  <h4>{todo.title}</h4>
                  {todo.priority && <span className="priority-badge">Öncelikli</span>}
                </div>
                {todo.detail && <p>{todo.detail}</p>}
              </div>
              <div className="todo-actions">
                <button type="button" onClick={() => onEdit(todo)}>
                  Düzenle
                </button>
                <button className="delete-button" type="button" onClick={() => onDelete(todo.id)}>
                  Sil
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="group-empty">{emptyText}</div>
        )}
      </div>
    </section>
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAuthenticated();
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <Brand />
        <div className="intro-copy">
          <p className="eyebrow">SADE. HIZLI. SENİN.</p>
          <h1>Aklındakileri<br />yerine koy.</h1>
          <p>Yapılacaklarını ve kısa notlarını tek, sakin bir alanda tut.</p>
        </div>
        <div className="intro-card" aria-hidden="true">
          <span className="intro-card-line long" />
          <span className="intro-card-line short" />
          <span className="intro-card-glow" />
        </div>
      </section>

      <section className="auth-card glass-panel">
        <div className="auth-tabs" role="tablist" aria-label="Hesap işlemleri">
          <button
            className={authMode === "login" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={authMode === "login"}
            onClick={() => setAuthMode("login")}
          >
            Giriş yap
          </button>
          <button
            className={authMode === "register" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={authMode === "register"}
            onClick={() => setAuthMode("register")}
          >
            Kayıt ol
          </button>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">{authMode === "login" ? "TEKRAR HOŞ GELDİN" : "MYTODO!'YA KATIL"}</p>
          <h2>{authMode === "login" ? "Hesabına giriş yap" : "Yeni hesap oluştur"}</h2>
        </div>

        <form className="auth-form" onSubmit={submitAuth}>
          {authMode === "register" && (
            <label className="form-field">
              <span>Ad soyad</span>
              <input type="text" placeholder="Adınız ve soyadınız" required />
            </label>
          )}
          <label className="form-field">
            <span>E-posta</span>
            <input type="email" placeholder="ornek@eposta.com" required />
          </label>
          <label className="form-field">
            <span>Şifre</span>
            <input type="password" placeholder="••••••••" minLength={6} required />
          </label>
          {authMode === "register" && (
            <label className="form-field">
              <span>Şifre tekrar</span>
              <input type="password" placeholder="••••••••" minLength={6} required />
            </label>
          )}
          <button className="primary-button auth-submit" type="submit">
            {authMode === "login" ? "Giriş yap" : "Kayıt ol"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-symbol">M!</span>
      <span>MyToDo!</span>
    </div>
  );
}
