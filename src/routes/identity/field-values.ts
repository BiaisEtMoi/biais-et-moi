// Field values and display names for the identity form
// Centralized for easy maintenance

export const SEXE_OPTIONS = [
  { value: "homme", label: "Homme" },
  { value: "femme", label: "Femme" },
  { value: "non-binaire", label: "Non-binaire" },
  { value: "ne-se-prononce-pas", label: "Ne se prononce pas" },
] as const;

export const AGE_RANGE = {
  min: 18,
  max: 99,
} as const;

export const PROFESSION_OPTIONS = [
  { value: "medecin", label: "Médecin" },
  { value: "ide", label: "IDE (Infirmier Diplômé d'État)" },
  { value: "as", label: "AS (Aide-Soignant)" },
] as const;

export const TYPE_POSTE_OPTIONS = [
  { value: "externe", label: "Externe" },
  { value: "interne", label: "Interne" },
  { value: "cca", label: "CCA (Chef de Clinique Assistant)" },
  {
    value: "mcu-ph",
    label:
      "MCU-PH (Maître de Conférences Universitaire - Praticien Hospitalier)",
  },
  {
    value: "pu-ph",
    label: "PU-PH (Professeur Universitaire - Praticien Hospitalier)",
  },
  { value: "non-concerne", label: "Non concerné" },
] as const;

export const SPECIALITES = [
  "Anesthésie-réanimation",
  "Biologie médicale",
  "Cardiologie",
  "Chirurgie générale",
  "Chirurgie orthopédique",
  "Dermatologie",
  "Endocrinologie",
  "Gastro-entérologie",
  "Gériatrie",
  "Gynécologie médicale",
  "Gynécologie obstétrique",
  "Hématologie",
  "Médecine générale",
  "Médecine interne",
  "Néphrologie",
  "Neurologie",
  "Oncologie",
  "Ophtalmologie",
  "ORL",
  "Pédiatrie",
  "Pneumologie",
  "Psychiatrie",
  "Radiologie",
  "Rhumatologie",
  "Urologie",
] as const;

export const STRUCTURE_OPTIONS = [
  { value: "chu", label: "CHU (Centre Hospitalier Universitaire)" },
  { value: "ch", label: "CH (Centre Hospitalier)" },
  { value: "clinique", label: "Clinique" },
  { value: "cabinet", label: "Cabinet" },
  { value: "maison-sante", label: "Maison de santé" },
] as const;

export const REGIONS = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Mayotte",
] as const;

export const ORIGINE_ETHNIQUE_OPTIONS = [
  { value: "noire", label: "Noire" },
  { value: "blanche", label: "Blanche" },
  { value: "asiatique", label: "Asiatique" },
  { value: "arabe", label: "Arabe" },
  { value: "autre", label: "Autre" },
] as const;
