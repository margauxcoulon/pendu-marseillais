# Le Pendu Marseillais

## Description
Projet réalisé dans le cadre d’un exercice de développement web.  
Le but : créer une version marseillaise du célèbre jeu du pendu, avec trois déclinaisons :
- **Vanilla JS** : une version simple, 100 % en JavaScript, HTML et CSS.
- **React** : une version moderne avec React pour le front.
- **FastAPI** : un backend en Python pour la gestion et la sauvegarde des scores (base SQLite).


## Structure du projet
```
pendu-marseillais/
│
├── pendu-vanilla/ → version simple en Vanilla JS
│
├── pendu-frontend/ → application React
│
└── pendu-backend/ → API FastAPI pour les scores
```

## Technologies utilisées

### Frontend
- HTML / CSS / JavaScript (Vanilla)
- React (hooks, composants fonctionnels)

### Backend
- Python 3
- FastAPI
- SQLModel (pour la gestion de la base SQLite)

### Base de données
- SQLite (fichier `scores.db` créé automatiquement)


## Installation et exécution

### 1 - Cloner le dépôt
```bash
git clone https://github.com/<margauxcoulon>/pendu-marseillais.git
cd pendu-marseillais
```

### 2 - Lancer le backend (FastAPI)
```bash
cd pendu-backend
uvicorn main:app --reload
```
L’API sera disponible sur http://127.0.0.1:8000/docs#/

### 3 - Lancer le frontend (React)
```bash
cd pendu-frontend
npm install
npm start
```
L’application sera accessible sur http://localhost:3000

### Optionel - Version Vanilla JS
Ouvre simplement le fichier index.html dans ton navigateur.

## 
Projet développé par Margaux Coulon, étudiante à Centrale Marseille, en octobre 2025.