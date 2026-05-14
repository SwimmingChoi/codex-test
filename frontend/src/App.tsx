import { FormEvent, useEffect, useMemo, useState } from 'react';

import { createTodo, deleteTodo, fetchTodos, updateTodo } from './api';
import type { Todo } from './types';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDate(dateString: string, amount: number): string {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return formatDate(date);
}

const today = formatDate(new Date());

function App() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedCount = useMemo(() => todos.filter((todo) => todo.is_done).length, [todos]);

  useEffect(() => {
    let ignore = false;

    async function loadTodos() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTodos(selectedDate);
        if (!ignore) {
          setTodos(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : '할 일을 불러오지 못했습니다.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTodos();
    return () => {
      ignore = true;
    };
  }, [selectedDate]);

  async function handleCreateTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      setError('할 일을 입력해 주세요.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const created = await createTodo({ task_date: selectedDate, title: trimmedTitle });
      setTodos((current) => [...current, created]);
      setNewTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '할 일을 추가하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(todo: Todo) {
    setError(null);
    try {
      const updated = await updateTodo(todo.id, { is_done: !todo.is_done });
      setTodos((current) => current.map((item) => (item.id === todo.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : '완료 상태를 변경하지 못했습니다.');
    }
  }

  function startEditing(todo: Todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle('');
  }

  async function handleSaveEdit(todoId: number) {
    const trimmedTitle = editingTitle.trim();
    if (!trimmedTitle) {
      setError('수정할 내용을 입력해 주세요.');
      return;
    }

    setError(null);
    try {
      const updated = await updateTodo(todoId, { title: trimmedTitle });
      setTodos((current) => current.map((item) => (item.id === todoId ? updated : item)));
      cancelEditing();
    } catch (err) {
      setError(err instanceof Error ? err.message : '할 일을 수정하지 못했습니다.');
    }
  }

  async function handleDelete(todoId: number) {
    setError(null);
    try {
      await deleteTodo(todoId);
      setTodos((current) => current.filter((todo) => todo.id !== todoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : '할 일을 삭제하지 못했습니다.');
    }
  }

  return (
    <main className="app-shell">
      <section className="todo-card">
        <header className="app-header">
          <p className="eyebrow">매일의 할 일을 날짜별로 관리하세요</p>
          <h1>Daily Todo</h1>
        </header>

        <section className="date-panel" aria-label="날짜 선택">
          <button type="button" className="secondary-button" onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}>
            이전 날짜
          </button>
          <label className="date-picker-label">
            날짜 선택
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </label>
          <button type="button" className="secondary-button" onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}>
            다음 날짜
          </button>
        </section>

        <div className="summary" aria-live="polite">
          {selectedDate} · 총 {todos.length}개 중 {completedCount}개 완료
        </div>

        <form className="create-form" onSubmit={handleCreateTodo}>
          <input
            type="text"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="새 할 일을 입력하세요"
            aria-label="새 할 일"
          />
          <button type="submit" disabled={isSaving}>
            {isSaving ? '추가 중...' : '추가'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {isLoading && <div className="loading-message">할 일을 불러오는 중...</div>}

        <ul className="todo-list">
          {!isLoading && todos.length === 0 && <li className="empty-state">이 날짜에 등록된 할 일이 없습니다.</li>}
          {todos.map((todo) => (
            <li key={todo.id} className="todo-item">
              <input type="checkbox" checked={todo.is_done} onChange={() => handleToggle(todo)} aria-label={`${todo.title} 완료`} />

              {editingId === todo.id ? (
                <input
                  className="edit-input"
                  type="text"
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSaveEdit(todo.id);
                    }
                    if (event.key === 'Escape') {
                      cancelEditing();
                    }
                  }}
                  autoFocus
                />
              ) : (
                <span className={todo.is_done ? 'todo-title done' : 'todo-title'}>{todo.title}</span>
              )}

              <div className="todo-actions">
                {editingId === todo.id ? (
                  <>
                    <button type="button" className="secondary-button compact" onClick={() => handleSaveEdit(todo.id)}>
                      저장
                    </button>
                    <button type="button" className="ghost-button compact" onClick={cancelEditing}>
                      취소
                    </button>
                  </>
                ) : (
                  <button type="button" className="secondary-button compact" onClick={() => startEditing(todo)}>
                    수정
                  </button>
                )}
                <button type="button" className="danger-button compact" onClick={() => handleDelete(todo.id)}>
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
