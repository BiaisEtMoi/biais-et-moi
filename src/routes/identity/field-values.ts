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
"Allergologie",
"Anesthésie-réanimation",
"Cardiologie",
"Chirurgie générale",
"Chirurgie cardiaque",
"Chirurgie pédiatrique",
"Chirurgie orthopédique et traumatologique",
"Chirurgie maxillo-faciale",
"Chirurgie plastique, reconstructrice et esthétique",
"Chirurgie thoracique et cardio-vasculaire",
"Chirurgie vasculaire",
"Neurochirurgie",
"Dermatologie",
"Endocrinologie-nutrition",
"Gastro-entérologie",
"Gériatrie",
"Gynécologie médicale",
"Hématologie",
"Hépatologie et gastro-entérologie",
"Médecine interne",
"Médecine nucléaire",
"Médecine du travail",
"Médecine générale",
"Médecine physique et de réadaptation",
"Néphrologie",
"Neurologie",
"Oncologie médicale",
"Ophtalmologie",
"Oto-rhino-laryngologie (ORL)",
"Pneumologie",
"Psychiatrie",
"Radiologie",
"Rhumatologie",
"Urologie",
"Santé publique et médecine sociale",
  ] as const;

export const STRUCTURE_OPTIONS = [
  { value: "chu", label: "CHU (Centre Hospitalier Universitaire)" },
  { value: "ch", label: "CH (Centre Hospitalier)" },
  { value: "clinique", label: "Clinique" },
  { value: "cabinet", label: "Cabinet" },
  { value: "maison-sante", label: "Maison de santé" },
  {
    value: "etablissement-medico-social",
    label: "Etablissement médico-social",
  },
  { value: "ssr", label: "SSR (Soins de Suite de Réadaptation)" },
  { value: "had", label: "HAD (Hôpital à domicile)" },
  { value: "sante-mentale", label: "Etablissement de santé mentale" },
  { value: "hopital-local", label: "Hôpital local" },
  { value: "hopital-militaire", label: "Hôpital militaire" },
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
  { value: "noire", label: "Personne non blanche" },
  { value: "blanche", label: "Personne blanche" },
  { value: "ne-se-prononce-pas", label: "Ne se prononce pas" },
] as const;
