"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ApiError,
  AuthSession,
  Note,
  Todo,
  User,
  createNote,
  createTodo,
  getCurrentUser,
  getNotes,
  getTodos,
  login,
  register,
  removeTodo,
  updateTodo,
} from "../lib/api";

const tokenKey = "mytodo_access_token";

function sortTodos(todos: Todo[]) {
  return [...todos].sort((first, second) => {
    if (first.completed !== second.completed) {
      return Number(first.completed) - Number(second.completed);
    }

    if (first.priority !== second.priority) {
      return Number(second.priority) - Number(first.priority);
    }

    return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return "İşlem tamamlanamadı.";
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoTitle, setTodoTitle] = useState("");
  const [todoDetail, setTodoDetail] = useState("");
  const [todoPriority, setTodoPriority] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [message, setMessage] = useState("");
  const [isSavingTodo, setIsSavingTodo] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(tokenKey);
    let isActive = true;

    async function restoreSession() {
      try {
        if (!storedToken) return;

        const [{ user: currentUser }, { todos: savedTodos }, { notes: savedNotes }] = await Promise.all([
          getCurrentUser(storedToken),
          getTodos(storedToken),
          getNotes(storedToken),
        ]);

        if (!isActive) return;

        setToken(storedToken);
        setUser(currentUser);
        setTodos(sortTodos(savedTodos));
        setNotes(savedNotes);
      } catch (error) {
        if (!isActive) return;

        window.localStorage.removeItem(tokenKey);
        setMessage(getErrorMessage(error));
      } finally {
        if (isActive) {
          setIsCheckingSession(false);
        }
      }
    }

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

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

  async function handleAuthenticated(session: AuthSession) {
    window.localStorage.setItem(tokenKey, session.token);
    setToken(session.token);
    setUser(session.user);
    setMessage("");

    try {
      const [{ todos: savedTodos }, { notes: savedNotes }] = await Promise.all([
        getTodos(session.token),
        getNotes(session.token),
      ]);
      setTodos(sortTodos(savedTodos));
      setNotes(savedNotes);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  function signOut() {
    window.localStorage.removeItem(tokenKey);
    setToken(null);
    setUser(null);
    setTodos([]);
    setNotes([]);
    setMessage("");
    resetTodoForm();
  }

  async function saveTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !todoTitle.trim()) return;

    setIsSavingTodo(true);
    setMessage("");

    try {
      if (editingTodoId) {
        const { todo } = await updateTodo(token, editingTodoId, {
          title: todoTitle.trim(),
          detail: todoDetail.trim(),
          priority: todoPriority,
        });
        setTodos((currentTodos) =>
          sortTodos(currentTodos.map((currentTodo) => currentTodo.id === todo.id ? todo : currentTodo)),
        );
      } else {
        const { todo } = await createTodo(token, {
          title: todoTitle.trim(),
          detail: todoDetail.trim(),
          priority: todoPriority,
        });
        setTodos((currentTodos) => sortTodos([...currentTodos, todo]));
      }

      resetTodoForm();
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsSavingTodo(false);
    }
  }

  function startEditing(todo: Todo) {
    setEditingTodoId(todo.id);
    setTodoTitle(todo.title);
    setTodoDetail(todo.detail);
    setTodoPriority(todo.priority);
  }

  async function deleteTodo(todoId: string) {
    if (!token) return;

    setMessage("");

    try {
      await removeTodo(token, todoId);
      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId));

      if (editingTodoId === todoId) {
        resetTodoForm();
      }
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function toggleTodo(todoId: string) {
    if (!token) return;

    const currentTodo = todos.find((todo) => todo.id === todoId);
    if (!currentTodo) return;

    setMessage("");

    try {
      const { todo } = await updateTodo(token, todoId, { completed: !currentTodo.completed });
      setTodos((currentTodos) =>
        sortTodos(currentTodos.map((item) => item.id === todo.id ? todo : item)),
      );
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !noteText.trim()) return;

    setIsSavingNote(true);
    setMessage("");

    try {
      const { note } = await createNote(token, noteText.trim());
      setNotes((currentNotes) => [note, ...currentNotes]);
      setNoteText("");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsSavingNote(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="loading-page">
        <Brand />
        <p>Oturum kontrol ediliyor...</p>
      </main>
    );
  }

  if (!token || !user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} initialMessage={message} />;
  }

  return (
    <main className="dashboard-page">
      <header className="site-header">
        <Brand />
        <div className="account-area">
          <span>{user.name}</span>
          <button className="text-button" type="button" onClick={signOut}>
            Çıkış yap
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="page-heading">
          <p className="eyebrow">My ToDo! Kaydedilen Notların</p>
          <h1>Bugün ne yapmak istiyorsun??</h1>
        </div>

        {message && <div className="status-message" role="alert">{message}</div>}

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
                  <button className="primary-button" type="submit" disabled={isSavingTodo}>
                    {isSavingTodo ? "Kaydediliyor..." : editingTodoId === null ? "Ekle" : "Kaydet"}
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
              <button className="primary-button note-save-button" type="submit" disabled={isSavingNote}>
                {isSavingNote ? "Kaydediliyor..." : "Notu kaydet"}
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
  editingTodoId: string | null;
  onToggle: (todoId: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todoId: string) => void;
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

type AuthScreenProps = {
  onAuthenticated: (session: AuthSession) => Promise<void>;
  initialMessage?: string;
};

function AuthScreen({ onAuthenticated, initialMessage = "" }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [errorMessage, setErrorMessage] = useState(initialMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      let session: AuthSession;

      if (authMode === "register") {
        const passwordConfirmation = String(formData.get("passwordConfirmation") || "");

        if (password !== passwordConfirmation) {
          throw new Error("Şifreler eşleşmiyor.");
        }

        session = await register({
          name: String(formData.get("name") || ""),
          email,
          password,
        });
      } else {
        session = await login({ email, password });
      }

      await onAuthenticated(session);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(mode: "login" | "register") {
    setAuthMode(mode);
    setErrorMessage("");
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
            onClick={() => switchMode("login")}
          >
            Giriş yap
          </button>
          <button
            className={authMode === "register" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={authMode === "register"}
            onClick={() => switchMode("register")}
          >
            Kayıt ol
          </button>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">{authMode === "login" ? "TEKRAR HOŞ GELDİN" : "MYTODO!'YA KATIL"}</p>
          <h2>{authMode === "login" ? "Hesabına giriş yap" : "Yeni hesap oluştur"}</h2>
        </div>

        {errorMessage && <div className="status-message auth-message" role="alert">{errorMessage}</div>}

        <form className="auth-form" onSubmit={submitAuth}>
          {authMode === "register" && (
            <label className="form-field">
              <span>Ad soyad</span>
              <input name="name" type="text" placeholder="Adınız ve soyadınız" required />
            </label>
          )}
          <label className="form-field">
            <span>E-posta</span>
            <input name="email" type="email" placeholder="ornek@eposta.com" required />
          </label>
          <label className="form-field">
            <span>Şifre</span>
            <input name="password" type="password" placeholder="••••••••" minLength={8} required />
          </label>
          {authMode === "register" && (
            <label className="form-field">
              <span>Şifre tekrar</span>
              <input name="passwordConfirmation" type="password" placeholder="••••••••" minLength={8} required />
            </label>
          )}
          <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Gönderiliyor..." : authMode === "login" ? "Giriş yap" : "Kayıt ol"}
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
