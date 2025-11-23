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
  "Médecins (généralistes et spécialistes)",
  "Chirurgiens-dentistes (odontologistes)",
  "Sages-femmes",
  "Pharmaciens",
  "Préparateurs en pharmacie",
  "Infirmiers (diplômés d'État, puéricultrices, anesthésistes, infirmiers de bloc opératoire)",
  "Masseur-kinésithérapeutes",
  "Pédicures-podologues",
  "Ergothérapeutes",
  "Psychomotriciens",
  "Orthophonistes",
  "Orthoptistes",
  "Manipulateurs d'électroradiologie médicale",
  "Techniciens de laboratoire médical",
  "Diététiciens",
  "Audioprothésistes",
  "Opticiens-lunetiers",
  "Prothésistes et orthésistes pour l'appareillage des personnes handicapées",
  "Aides-soignants",
  "Auxiliaires de puériculture",
  "Ambulanciers",
  "Assistants de service social en santé",
  "Accompagnants éducatifs et sociaux (AES)",
  "Educateurs spécialisés en santé",
  "Conseillers en économie sociale et familiale dans le secteur médical",
  "Autre",
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
  "Une region chelou"
] as const;

export const ORIGINE_ETHNIQUE_OPTIONS = [
  { value: "noire", label: "Personne non blanche" },
  { value: "blanche", label: "Personne blanche" },
  { value: "anotherone", label: "UN AUTRE LOL" },
  { value: "autre", label: "Ne se prononce pas" },
] as const;
