from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models, schemas


def get_todos_by_date(db: Session, task_date: date) -> list[models.Todo]:
    statement = select(models.Todo).where(models.Todo.task_date == task_date).order_by(models.Todo.id.asc())
    return list(db.scalars(statement).all())


def get_todo(db: Session, todo_id: int) -> models.Todo | None:
    return db.get(models.Todo, todo_id)


def create_todo(db: Session, todo: schemas.TodoCreate) -> models.Todo:
    db_todo = models.Todo(task_date=todo.task_date, title=todo.title)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


def update_todo(db: Session, db_todo: models.Todo, todo_update: schemas.TodoUpdate) -> models.Todo:
    update_data = todo_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_todo, field, value)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


def delete_todo(db: Session, db_todo: models.Todo) -> None:
    db.delete(db_todo)
    db.commit()
