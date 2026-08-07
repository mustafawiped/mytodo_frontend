"use client";

import { FormEvent, useState } from "react";

type Todo = {
  id: number;
  title: string;
};

type Note = {
  id: number;
  content: string;
};

const initialTodos: Todo[] = [
  { id: 1, title: "Express API yapısını planla" },
  { id: 2, title: "MongoDB koleksiyonlarını belirle" },
  { id: 3, title: "Giriş ekranını kontrol et" },
];

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [todoTitle, setTodoTitle] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  function saveTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = todoTitle.trim();

    if (!cleanTitle) return;

    if (editingTodoId !== null) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === editingTodoId ? { ...todo, title: cleanTitle } : todo,
        ),
      );
      setEditingTodoId(null);
    } else {
      setTodos((currentTodos) => [
        ...currentTodos,
        { id: Date.now(), title: cleanTitle },
      ]);
    }

    setTodoTitle("");
  }

  function startEditing(todo: Todo) {
    setEditingTodoId(todo.id);
    setTodoTitle(todo.title);
  }

  function cancelEditing() {
    setEditingTodoId(null);
    setTodoTitle("");
  }

  function deleteTodo(todoId: number) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId));

    if (editingTodoId === todoId) {
      cancelEditing();
    }
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
      <div className="ambient ambient-cyan" />
      <div className="ambient ambient-purple" />

      <header className="site-header">
        <Brand />
        <button className="text-button" type="button" onClick={() => setIsSignedIn(false)}>
          Çıkış yap
        </button>
      </header>

      <section className="dashboard-content">
        <div className="page-heading">
          <p className="eyebrow">MYTODO! ÇALIŞMA ALANI</p>
          <h1>Bugün ne yapacağız?</h1>
        </div>

        <div className="workspace-grid">
          <section className="glass-panel todo-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">YAPILACAKLAR</p>
                <h2>Listen</h2>
              </div>
              <span className="item-count">{todos.length}</span>
            </div>

            <form className="todo-form" onSubmit={saveTodo}>
              <input
                value={todoTitle}
                onChange={(event) => setTodoTitle(event.target.value)}
                placeholder={editingTodoId === null ? "Yeni bir yapılacak yaz..." : "Yapılacağı düzenle..."}
                aria-label="Yapılacak başlığı"
              />
              {editingTodoId !== null && (
                <button className="ghost-button" type="button" onClick={cancelEditing}>
                  Vazgeç
                </button>
              )}
              <button className="primary-button" type="submit">
                {editingTodoId === null ? "Ekle" : "Kaydet"}
              </button>
            </form>

            <div className="todo-list">
              {todos.length ? (
                todos.map((todo, index) => (
                  <article className={`todo-row ${editingTodoId === todo.id ? "is-editing" : ""}`} key={todo.id}>
                    <span className="todo-index">{String(index + 1).padStart(2, "0")}</span>
                    <p>{todo.title}</p>
                    <div className="todo-actions">
                      <button type="button" onClick={() => startEditing(todo)}>
                        Düzenle
                      </button>
                      <button className="delete-button" type="button" onClick={() => deleteTodo(todo.id)}>
                        Sil
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-list">Henüz yapılacak eklenmedi.</div>
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

function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAuthenticated();
  }

  return (
    <main className="auth-page">
      <div className="ambient ambient-cyan" />
      <div className="ambient ambient-purple" />

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
