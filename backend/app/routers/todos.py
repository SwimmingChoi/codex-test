from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/todos", tags=["todos"])


@router.get("", response_model=list[schemas.TodoRead])
def read_todos(
    task_date: date = Query(..., alias="date", description="Todo date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
) -> list[schemas.TodoRead]:
    return crud.get_todos_by_date(db, task_date)


@router.post("", response_model=schemas.TodoRead, status_code=status.HTTP_201_CREATED)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)) -> schemas.TodoRead:
    return crud.create_todo(db, todo)


@router.patch("/{todo_id}", response_model=schemas.TodoRead)
def update_todo(todo_id: int, todo_update: schemas.TodoUpdate, db: Session = Depends(get_db)) -> schemas.TodoRead:
    db_todo = crud.get_todo(db, todo_id)
    if db_todo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    return crud.update_todo(db, db_todo, todo_update)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)) -> None:
    db_todo = crud.get_todo(db, todo_id)
    if db_todo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    crud.delete_todo(db, db_todo)
