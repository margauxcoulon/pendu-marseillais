from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Annotated, Optional, List

# Configuration BDD
engine = create_engine(
    "sqlite:///./scores.db",
    echo=False,
    connect_args={"check_same_thread": False}  # nécessaire pour SQLite avec FastAPI
)

# Modèle Score
class Score(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nom_utilisateur: str
    score: int = Field(index=True, ge=0)

# Schéma pour création de score
class ScoreCreate(SQLModel):
    nom_utilisateur: str
    score: int

# Dépendance pour session DB
def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

# Application FastAPI

app = FastAPI(title="Pendu Marseillais API")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Autorise toutes les origines, à restreindre en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Création des tables au démarrage
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# Routes API
# GET /scores → récupérer tous les scores (top 50)
@app.get("/scores", response_model=List[Score])
def list_scores(session: SessionDep, limit: int = 50):
    stmt = select(Score).order_by(Score.score.desc()).limit(limit)
    return session.exec(stmt).all()

# POST /scores → ajouter un nouveau score
@app.post("/scores", response_model=Score, status_code=201)
def create_score(data: ScoreCreate, session: SessionDep):
    obj = Score(**data.model_dump())
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj

# DELETE /scores/string → supprimer tous les scores de test avec nom_utilisateur = 'string'
@app.delete("/scores/string", status_code=204)
def delete_test_scores(session: SessionDep):
    session.exec(select(Score).where(Score.nom_utilisateur == "string")).delete()
    session.commit()
