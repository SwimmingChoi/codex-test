import type { Todo, TodoCreatePayload, TodoUpdatePayload } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `API 요청에 실패했습니다. (${response.status})`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody.detail === 'string') {
        message = errorBody.detail;
      }
    } catch {
      // Keep the default message when the response body is not JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function fetchTodos(date: string): Promise<Todo[]> {
  return request<Todo[]>(`/api/todos?date=${encodeURIComponent(date)}`);
}

export function createTodo(payload: TodoCreatePayload): Promise<Todo> {
  return request<Todo>('/api/todos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTodo(todoId: number, payload: TodoUpdatePayload): Promise<Todo> {
  return request<Todo>(`/api/todos/${todoId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteTodo(todoId: number): Promise<void> {
  return request<void>(`/api/todos/${todoId}`, {
    method: 'DELETE',
  });
}
