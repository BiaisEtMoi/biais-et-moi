// Field values and display names for the identity form
// Centralized for easy maintenance

export const SEXE_OPTIONS = [
  { value: "homme", label: "Homme" },
  { value: "femme", label: "Femme" },
  { value: "non-binaire", label: "Non-binaire" },
  { value: "prefere-ne-pas-repondre", label: "Je préfère ne pas répondre" },
] as const;

export const AGE_OPTIONS = [
  { value: "18-25", label: "18-25 ans" },
  { value: "26-35", label: "26-35 ans" },
  { value: "36-45", label: "36-45 ans" },
  { value: "46-55", label: "46-55 ans" },
  { value: "56-65", label: "56-65 ans" },
  { value: "66-75", label: "66-75 ans" },
  { value: "76+", label: "76 ans et plus" },
] as const;

export const PROFESSION_OPTIONS = [
  { value: "medecin", label: "Médecin" },
  { value: "ide", label: "IDE (Infirmier Diplômé d'État)" },
  { value: "as", label: "AS (Aide-Soignant)" },
  { value: "dentiste", label: "Chirurgien-dentiste" },
  { value: "SF", label: "Sage-femme" },
  { value: "pharmacien", label: "Pharmacien" },
  { value: "préparateur en pharmacie", label: "Préparateur en pharmacie" },
  { value: "kine", label: "Masseur-kinésithérapeute" },
  { value: "podologue", label: "Pédicure-podologue" },
  { value: "ergo", label: "Ergothérapeute" },
  { value: "psychomotricien", label: "Psychomotricien" },
  { value: "orthophoniste", label: "Orthophoniste" },
  { value: "orthoptiste", label: "Orthoptiste" },
  { value: "manip radio", label: "Manipulateur d'électroradiologie médicale" },
  { value: "technicien de labo", label: "Technicien de laboratoire médical" },
  { value: "diet", label: "Diététicien" },
  { value: "audioprothesiste", label: "Audioprothésiste" },
  { value: "opticien", label: "Opticien-lunetiers" },
  { value: "prothesiste", label: "Prothésiste et orthoprothésiste" },
  { value: "puer", label: "Auxiliaire de puéricultrice" },
  { value: "ambulancier", label: "Ambulancier" },
  {
    value: "assistante sociale",
    label: "Assistant de service social en santé",
  },
  {
    value: "accompagnant educatif",
    label: "Accompagnant éducatif et sociaux (AES)",
  },
  { value: "educ spe", label: "Educateur spécialisé en santé" },
  { value: "autre", label: "Autre" },
  { value: "ne-se-prononce-pas", label: "Ne se prononce pas" },
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
  { value: "ne-se-prononce-pas", label: "Ne se prononce pas" },
] as const;

export const SPECIALITES = [
  "Allergologie​",
  "Anatomie et cytologie pathologiques",
  "Chirurgie maxillo‑faciale",
  "Chirurgie orale​",
  "Chirurgie orthopédique et traumatologique​",
  "Chirurgie pédiatrique​",
  "Chirurgie plastique, reconstructrice et esthétique​",
  "Chirurgie thoracique et cardiovasculaire​",
  "Chirurgie vasculaire​",
  "Chirurgie viscérale et digestive​",
  "Dermatologie​",
  "Endocrinologie‑diabétologie‑nutrition​",
  "Génétique médicale​",
  "Gériatrie​",
  "Gynécologie médicale​",
  "Hématologie​",
  "Hépato‑gastro‑entérologie​",
  "Maladies infectieuses et tropicales​",
  "Médecine cardiovasculaire",
  "Médecine d’urgence​",
  "Médecine générale​",
  "Médecine intensive – réanimation​",
  "Médecine interne et immunologie clinique​",
  "Médecine légale et expertises médicales​",
  "Médecine nucléaire​",
  "Médecine physique et de réadaptation",
  "Médecine et santé au travail​",
  "Médecine vasculaire​",
  "Néphrologie​",
  "Neurochirurgie​",
  "Neurologie​",
  "Oncologie​",
  "Ophtalmologie​",
  "ORL et chirurgie cervico‑faciale​",
  "Pédiatrie​",
  "Pneumologie",
  "Psychiatrie​",
  "Radiologie et imagerie médicale",
  "Rhumatologie​",
  "Santé publique",
  "Urologie​",
  "Autre spécialité non repertoriée",
  "Ne se prononce pas",
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
  { value: "ne-se-prononce-pas", label: "Ne se prononce pas" },
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
  { value: "prefere-ne-pas-repondre", label: "Je préfère ne pas répondre" },
] as const;
