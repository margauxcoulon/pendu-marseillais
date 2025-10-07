// 1. Données globales

const viesDiv = document.getElementById('vies');
const inputLettre = document.getElementById('lettre');
const btnValider = document.getElementById('btnValider');
const motDiv = document.querySelector('.mot p');
const faussesDiv = document.getElementById('fausses');
const message = document.getElementById('message');
const btnRejouer = document.getElementById('btnRejouer');

// État du jeu regroupé dans un objet
let jeu = {
  vies: 10,
  motSecret: '',
  lettresTrouvees: [],
  mauvaisesLettres: [],
};

// Liste fallback si l’API échoue
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

// 2. API / Données

async function getMotAleatoire() {
  try {
    const response = await fetch('https://trouve-mot.fr/api/random');
    if (!response.ok) throw new Error('Erreur API');
    const data = await response.json();
    return data[0].name.toUpperCase(); // L'API renvoie un tableau, donc on prend le premier élément
  } catch {
    return motsMarseillais[Math.floor(Math.random() * motsMarseillais.length)];
  }
}

// 3. Gestion de l'état du jeu

async function demarrerPartie() {
  jeu.motSecret = await getMotAleatoire(); // Choix aléatoire du mot
  jeu.lettresTrouvees = Array(jeu.motSecret.length).fill('_'); // Affichage du mot sous forme de _
  // Réinitialisation variables
  jeu.mauvaisesLettres = [];
  jeu.vies = 10;

  // Réinitialisation affichages
  afficherMot();
  afficherVies();
  mettreAJourImage();
  faussesDiv.innerHTML = '';
  message.textContent = '';

  // Réactivation des champs
  inputLettre.disabled = false;
  btnValider.disabled = false;
  inputLettre.focus();
}

function perdreVie() {
  if (jeu.vies > 0) {
    jeu.vies--;
    afficherVies();
    mettreAJourImage();
  }
}

// 4. Affichage

// Affichage du compteur de vies
function afficherVies() {
  viesDiv.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const coeur = document.createElement('span');
    coeur.textContent = '❤';
    coeur.classList.add('coeur');
    if (i >= jeu.vies) coeur.classList.add('perdu');
    viesDiv.appendChild(coeur);
  }
}

// Affichage de l'image du pendu
function mettreAJourImage() {
  let etape = 10 - jeu.vies;
  document.getElementById('imagePendu').src = `images/pendu${etape}.jpg`;
}

// Affichage du mot actualisé avec les lettres correctes
function afficherMot() {
  motDiv.textContent = jeu.lettresTrouvees.join(' ');
}

// Affichage des mauvaises lettres
function afficherMauvaiseLettre(lettre) {
  const span = document.createElement('span');
  span.textContent = lettre;
  span.classList.add('mauvaise');
  faussesDiv.appendChild(span);
}

// 5. Logique du jeu

function verifierLettre(lettre) {
  if (jeu.motSecret.includes(lettre)) {
    // Si la lettre est dans le mot
    // Place la lettre au bon endroit
    [...jeu.motSecret].forEach((char, i) => {
      if (char === lettre) jeu.lettresTrouvees[i] = lettre;
    });
    afficherMot();
  } else if (!jeu.mauvaisesLettres.includes(lettre)) {
    // Si la lettre  n'est pas dans le mot
    jeu.mauvaisesLettres.push(lettre);
    afficherMauvaiseLettre(lettre);
    perdreVie();
  }
}

// Fin du jeu
function verifierFinDePartie() {
  // Si toutes les lettres ont été trouvées → victoire
  if (!jeu.lettresTrouvees.includes('_')) {
    message.textContent = 'Bravo !! Tié un monstre';
    message.classList.remove('perdu');
    inputLettre.disabled = true;
    btnValider.disabled = true;
  }

  // Si plus de vies → défaite
  if (jeu.vies === 0) {
    message.textContent = `Perdu zeubi... Tié une merguez`;
    message.classList.add('perdu');
    inputLettre.disabled = true;
    btnValider.disabled = true;
  }
}

// 6. Interaction utilisateur

// Traiter la lettre saisie
function traiterLettre() {
  message.textContent = '';

  let lettre = inputLettre.value.toUpperCase();

  if (lettre && /^[A-Z]$/.test(lettre)) {
    // Si la lettre a déjà été donnée
    if (
      jeu.lettresTrouvees.includes(lettre) ||
      jeu.mauvaisesLettres.includes(lettre)
    ) {
      message.textContent = `Oh c*n ! Tia déjà donné la lettre "${lettre}"`;
      message.classList.remove('perdu');
    } else {
      // Si la lettre est nouvelle, mise à jour du jeu en conséquence
      verifierLettre(lettre);
      verifierFinDePartie();
    }
  }

  inputLettre.value = '';
  inputLettre.focus();
}

// Bouton Valider
btnValider.addEventListener('click', traiterLettre);
// Valider avec la touche Entrée du clavier
inputLettre.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') traiterLettre();
});
// Bouton Rejouer
btnRejouer.addEventListener('click', demarrerPartie);

//Initialisation
demarrerPartie();
