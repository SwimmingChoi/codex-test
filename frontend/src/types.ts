export interface Todo {
  id: number;
  task_date: string;
  title: string;
  is_done: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoCreatePayload {
  task_date: string;
  title: string;
}

export interface TodoUpdatePayload {
  title?: string;
  is_done?: boolean;
}
