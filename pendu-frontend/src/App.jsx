
import React, { useState, useRef, useEffect } from 'react';

const motsMarseillais = [
  'PASTIS',
  'CALANQUE',
  'BOUILLABAISSE',
  'CANEBIERE',
  'SOLEIL',
  'MINOT',
  'BANDIDO',
  'MISTRAL',
  'PETANQUE',
  'MASSILIA',
  'JUL',
];

async function getMotAleatoire() {
  try {
    const response = await fetch('https://trouve-mot.fr/api/random');
    if (!response.ok) throw new Error('Erreur API');
    const data = await response.json();
    return data[0].name.toUpperCase();
  } catch {
    return motsMarseillais[Math.floor(Math.random() * motsMarseillais.length)];
  }
}

const NB_VIES = 10;


const App = () => {
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [nomValide, setNomValide] = useState(false);
  const [motSecret, setMotSecret] = useState('');
  const [lettresTrouvees, setLettresTrouvees] = useState([]);
  const [mauvaisesLettres, setMauvaisesLettres] = useState([]);
  const [vies, setVies] = useState(NB_VIES);
  const [message, setMessage] = useState('');
  const [messagePerdu, setMessagePerdu] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [partieFinie, setPartieFinie] = useState(false);
  const [scores, setScores] = useState([]);
  const [scoreEnvoye, setScoreEnvoye] = useState(false);
  const inputRef = useRef(null);
  const nomInputRef = useRef(null);


  // Démarre une nouvelle partie
  const demarrerPartie = async () => {
    const mot = await getMotAleatoire();
    setMotSecret(mot);
    setLettresTrouvees(Array(mot.length).fill('_'));
    setMauvaisesLettres([]);
    setVies(NB_VIES);
    setMessage('');
    setMessagePerdu(false);
    setInputValue('');
    setPartieFinie(false);
    setScoreEnvoye(false);
    if (inputRef.current) inputRef.current.focus();
  };

  // Pour vraiment "rejouer" (changer de nom)
  const resetNomEtPartie = () => {
    setNomValide(false);
    setNomUtilisateur('');
    demarrerPartie();
  };


  useEffect(() => {
    if (nomValide) {
      demarrerPartie();
    } else if (nomInputRef.current) {
      nomInputRef.current.focus();
    }
    // eslint-disable-next-line
  }, [nomValide]);

  // Met à jour l'image du pendu
  const imagePendu = `images/pendu${NB_VIES - vies}.jpg`;


  // Vérifie la lettre saisie
  const traiterLettre = (e) => {
    if (e) e.preventDefault();
    setMessage('');
    const lettre = inputValue.toUpperCase();
    if (!lettre || !/^[A-Z]$/.test(lettre)) {
      setInputValue('');
      return;
    }
    if (lettresTrouvees.includes(lettre) || mauvaisesLettres.includes(lettre)) {
      setMessage(`Oh c*n ! Tia déjà donné la lettre "${lettre}"`);
      setMessagePerdu(false);
      setInputValue('');
      return;
    }
    if (motSecret.includes(lettre)) {
      // Place la lettre au bon endroit
      const nouvellesLettres = [...lettresTrouvees];
      [...motSecret].forEach((char, i) => {
        if (char === lettre) nouvellesLettres[i] = lettre;
      });
      setLettresTrouvees(nouvellesLettres);
      // Victoire ?
      if (!nouvellesLettres.includes('_')) {
        setMessage('Bravo !! Tié un monstre');
        setMessagePerdu(false);
        setPartieFinie(true);
        // envoyerScore(vies); // score = nombre de vies restantes (déplacé dans useEffect)
      }
    } else {
      // Mauvaise lettre
      setMauvaisesLettres([...mauvaisesLettres, lettre]);
      if (vies - 1 === 0) {
        setMessage('Perdu zeubi... Tié une merguez');
        setMessagePerdu(true);
        setPartieFinie(true);
        // envoyerScore(0); // score = 0 (déplacé dans useEffect)
      }
      setVies(vies - 1);
    }
    setInputValue('');
    if (inputRef.current) inputRef.current.focus();
  };
  // Envoi du score à la fin de la partie (victoire ou défaite)
  useEffect(() => {
    // On n'envoie le score que si la partie vient de se finir et qu'il n'a pas déjà été envoyé
    if (partieFinie && !scoreEnvoye) {
      const victoire = !lettresTrouvees.includes('_');
      envoyerScore(victoire ? vies : 0);
      setScoreEnvoye(true);
    }
    // eslint-disable-next-line
  }, [partieFinie, scoreEnvoye]);

  // Gère la touche Entrée
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      traiterLettre(e);
    }
  };


  // Envoie le score au back et met à jour les scores
  const envoyerScore = async (score) => {
    if (!nomUtilisateur) return;
    try {
      const response = await fetch('http://127.0.0.1:8000/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom_utilisateur: nomUtilisateur, score }),
      });
      if (!response.ok) throw new Error('Erreur envoi score');
      const data = await response.json();
      console.log('Score enregistré', data);
      await recupererScores(); // Met à jour les scores après envoi
    } catch (error) {
      console.error(error);
    }
  };


  // Affichage du score
  const recupererScores = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/scores');
      const data = await res.json();
      setScores(data);
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    recupererScores();
  }, []);

  // Validation du nom utilisateur (bouton ou Entrée)
  const validerNom = (e) => {
    if (e) e.preventDefault();
    if (nomUtilisateur.trim().length > 0) {
      setNomValide(true);
    }
  };

  const handleNomKeyDown = (e) => {
    if (e.key === 'Enter') {
      validerNom(e);
    }
  };

  // Affichage JSX

  return (
    <div>
      <header>
        <h1>Le petit Pendu des familles :/</h1>
      </header>
      {!nomValide && (
        <form className="nom-utilisateur" onSubmit={validerNom} style={{ marginBottom: 20 }}>
          <label htmlFor="nom">Par pitié donne-moi ton nom :</label>
          <input
            id="nom"
            type="text"
            ref={nomInputRef}
            value={nomUtilisateur}
            onChange={e => setNomUtilisateur(e.target.value)}
            onKeyDown={handleNomKeyDown}
            autoFocus
          />
          <button type="submit">Valider</button>
        </form>
      )}
      {nomValide && (
        <>
          <section className="controle">
            <button className="btn-rejouer" onClick={resetNomEtPartie}>
              Tu veux rejouer mon gaté ??
            </button>
            <span style={{marginLeft: 20}}>Wesh <b>{nomUtilisateur}</b> ! Tia intérêt à performer</span>
          </section>
          <section className="zone-vies">
            <div className="vies">
              {[...Array(NB_VIES)].map((_, i) => (
                <span key={i} className={`coeur${i >= vies ? ' perdu' : ''}`}>❤</span>
              ))}
            </div>
          </section>
          <section className="jeu">
            <div className="mot">
              <p>{lettresTrouvees.join(' ')}</p>
            </div>
            <div className="pendu">
              <img src={imagePendu} alt="pendu" />
            </div>
          </section>
          <section className="zone-lettres">
            <div className="lettres-donnees">
              <label htmlFor="lettre">Donne-moi une lettre le sang </label>
              <input
                type="text"
                id="lettre"
                maxLength="1"
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={partieFinie || vies === 0}
                autoComplete="off"
              />
              <button className="btn-valider" onClick={traiterLettre} disabled={partieFinie || vies === 0}>
                Tié sûr le tigre ?
              </button>
            </div>
            <div className="mauvaises-lettres">
              <p>Mauvaises lettres :</p>
              <div className="fausses">
                {mauvaisesLettres.map((lettre, i) => (
                  <span key={i} className="mauvaise">{lettre}</span>
                ))}
              </div>
            </div>
          </section>
          <section className="message">
            {message && (
              <p className={messagePerdu ? 'perdu' : ''}>{message}</p>
            )}
          </section>
          <section className="top-scores">
            <h2>Top Scores</h2>
            <ul>
              {scores
                .filter(s => s.nom_utilisateur !== "string")
                .map((s, i) => (
                  <li key={s.id}>
                    <span>
                      {i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : `${i + 1}. `}
                      {s.nom_utilisateur}
                    </span>
                    <span>{s.score}</span>
                  </li>
                ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
};

export default App;
