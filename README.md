Français | [English Version](#english-version)

# ESI-Eval : Système d'Évaluation des Enseignements

![Aperçu du tableau de bord admin](https://i.imgur.com/gKqjC3s.png)

ESI-Eval est une application web moderne conçue pour digitaliser et optimiser le processus d'évaluation des enseignements au sein de l'École Supérieure des Ingénieurs (ESI). Elle permet aux étudiants de soumettre des évaluations pour les cours suivis et offre à l'administration un puissant tableau de bord pour analyser les données, générer des statistiques et récompenser les enseignants les plus performants.

---

## 🚀 Fonctionnalités Clés

* **Portail d'Évaluation pour Étudiants :** Interface simple et intuitive pour que les étudiants puissent remplir et soumettre les fiches d'évaluation.
* **Tableau de Bord Administrateur :** Une vue d'ensemble complète avec des statistiques clés (nombre d'évaluations, d'utilisateurs, d'enseignants) et des visualisations de données.
* **Gestion des Utilisateurs :** Interface pour lister, rechercher, et gérer les rôles des utilisateurs (étudiants, administrateurs).
* **Gestion des Entités :** Panneaux dédiés pour administrer les enseignants, les matières, les classes et les enseignements.
* **Rapports et Statistiques :** Génération de classements, comme le "Top 5 des Enseignants", basés sur les scores moyens.
* **Authentification Sécurisée :** Système de connexion et d'inscription basé sur les rôles, avec protection des routes.

---

## 📖 Guide d'Utilisation (Application Déployée)

Vous pouvez tester l'application en direct ici : [https://esi-ten.vercel.app/](https://esi-ten.vercel.app/)

### 1. Effectuer une Évaluation (en tant qu'Étudiant)

1.  **Créez un compte étudiant :** Allez sur la page d'inscription et remplissez le formulaire. Assurez-vous de sélectionner votre classe dans la liste déroulante.
2.  **Connectez-vous :** Utilisez les identifiants que vous venez de créer pour vous connecter.
3.  **Accédez au formulaire :** Vous serez redirigé vers la page de saisie des évaluations.
4.  **Remplissez et soumettez :** Choisissez un enseignement à évaluer, répondez à tous les critères et soumettez le formulaire.

### 2. Accéder au Tableau de Bord Administrateur

Un compte administrateur a été pré-configuré à des fins de démonstration. Vous pouvez l'utiliser pour explorer toutes les fonctionnalités d'administration.

* **Email :** `admin@gmail.com`
* **Mot de passe :** `auroraV`

Connectez-vous avec ces identifiants pour être automatiquement redirigé vers le tableau de bord administrateur.

---

## 🛠️ Stack Technique

* **Framework Frontend :** [Next.js](https://nextjs.org/) (avec App Router)
* **Backend & Base de Données :** [Supabase](https://supabase.io/) (PostgreSQL, Auth, Storage, Functions)
* **Bibliothèque UI :** [Shadcn/UI](https://ui.shadcn.com/)
* **Styling :** [Tailwind CSS](https://tailwindcss.com/)
* **Graphiques :** [Recharts](https://recharts.org/)
* **Gestion de Tableaux :** [TanStack Table (React Table)](https://tanstack.com/table/v8)
* **Déploiement :** [Vercel](https://vercel.com/)

---

## ⚙️ Installation et Lancement Local

Suivez ces étapes pour lancer le projet sur votre machine locale.

### 1. Prérequis

* [Node.js](https://nodejs.org/) (version 18 ou supérieure)
* Un compte [Supabase](https://supabase.com/)

### 2. Cloner le Dépôt

```bash
git clone [https://github.com/chisom-1010/esi.git](https://github.com/chisom-1010/esi.git)
cd esi
```

### 3. Installer les Dépendances

```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

### 4. Configurer les Variables d'Environnement

Créez un fichier `.env.local` à la racine de votre projet et ajoutez-y vos clés Supabase. Vous les trouverez dans **Project Settings > API** sur votre tableau de bord Supabase.

```env
NEXT_PUBLIC_SUPABASE_URL=VOTRE_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=VOTRE_SUPABASE_SERVICE_ROLE_KEY
```

### 5. Configurer la Base de Données

Pour que l'application fonctionne, vous devez créer les tables et les fonctions dans votre base de données Supabase. Exécutez les scripts SQL que nous avons créés dans l'**Éditeur SQL** de Supabase. Assurez-vous d'exécuter dans l'ordre :
1.  Le script de création des tables.
2.  Le script de peuplement des données (pour avoir des classes, enseignants, etc.).
3.  Les scripts de création des fonctions RPC (`get_dashboard_stats`, `get_top_teachers`, `get_all_enseignements`, etc.).

### 6. Lancer le Serveur de Développement

```bash
npm run dev
```

L'application devrait maintenant être accessible à l'adresse `http://localhost:3000`.

---

## 🚀 Déploiement sur Vercel

Pour déployer ce projet sur Vercel, vous devez configurer les mêmes variables d'environnement que celles de votre fichier `.env.local`.
1.  Connectez votre dépôt GitHub à Vercel.
2.  Dans les paramètres de votre projet sur Vercel, allez dans **Settings > Environment Variables**.
3.  Ajoutez les trois variables : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, et `SUPABASE_SERVICE_ROLE_KEY` avec les valeurs correspondantes.
4.  Lancez un nouveau déploiement.

---

## 👨‍💻 Auteurs

* **chisom-1010** - *Développeur principal*

---
---

<a name="english-version"></a>
[Version Française](#) | English

# ESI-Eval: Teacher Evaluation System

![Admin dashboard preview](https://i.imgur.com/gKqjC3s.png)

ESI-Eval is a modern web application designed to digitize and optimize the teaching evaluation process at the École Supérieure des Ingénieurs (ESI). It allows students to submit evaluations for the courses they have taken and provides the administration with a powerful dashboard to analyze data, generate statistics, and reward the top-performing teachers.

---

## 🚀 Key Features

* **Student Evaluation Portal:** A simple and intuitive interface for students to fill out and submit evaluation forms.
* **Administrator Dashboard:** A comprehensive overview with key statistics (number of evaluations, users, teachers) and data visualizations.
* **User Management:** An interface to list, search, and manage user roles (students, administrators).
* **Entity Management:** Dedicated panels to administer teachers, subjects, classes, and courses.
* **Reports and Statistics:** Generation of rankings, such as the "Top 5 Teachers," based on average scores.
* **Secure Authentication:** A role-based login and registration system with protected routes.

---

## 📖 Usage Guide (Live Demo)

You can test the live application here: [https://esi-ten.vercel.app/](https://esi-ten.vercel.app/)

### 1. Submitting an Evaluation (as a Student)

1.  **Create a student account:** Go to the sign-up page and fill out the form. Make sure to select your class from the dropdown list.
2.  **Log in:** Use the credentials you just created to log in.
3.  **Access the form:** You will be redirected to the evaluation entry page.
4.  **Fill out and submit:** Choose a course to evaluate, answer all the criteria, and submit the form.

### 2. Accessing the Admin Dashboard

An administrator account has been pre-configured for demonstration purposes. You can use it to explore all administrative features.

* **Email:** `admin@gmail.com`
* **Password:** `auroraV`

Log in with these credentials to be automatically redirected to the admin dashboard.

---

## 🛠️ Tech Stack

* **Frontend Framework:** [Next.js](https://nextjs.org/) (with App Router)
* **Backend & Database:** [Supabase](https://supabase.io/) (PostgreSQL, Auth, Storage, Functions)
* **UI Library:** [Shadcn/UI](https://ui.shadcn.com/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Charts:** [Recharts](https://recharts.org/)
* **Table Management:** [TanStack Table (React Table)](https://tanstack.com/table/v8)
* **Deployment:** [Vercel](https://vercel.com/)

---

## ⚙️ Local Installation and Setup

Follow these steps to run the project on your local machine.

### 1. Prerequisites

* [Node.js](https://nodejs.org/) (version 18 or higher)
* A [Supabase](https://supabase.com/) account

### 2. Clone the Repository

```bash
git clone [https://github.com/chisom-1010/esi.git](https://github.com/chisom-1010/esi.git)
cd esi
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root of your project and add your Supabase keys. You can find them in **Project Settings > API** on your Supabase dashboard.

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

### 5. Set Up the Database

For the application to work, you need to create the tables and functions in your Supabase database. Run the SQL scripts we created in the **SQL Editor** in Supabase. Make sure to run them in the following order:
1.  The table creation script.
2.  The data seeding script (to have classes, teachers, etc.).
3.  The RPC function creation scripts (`get_dashboard_stats`, `get_top_teachers`, `get_all_enseignements`, etc.).

### 6. Run the Development Server

```bash
npm run dev
```

The application should now be accessible at `http://localhost:3000`.

---

## 🚀 Deployment on Vercel

To deploy this project on Vercel, you need to configure the same environment variables as in your `.env.local` file.
1.  Connect your GitHub repository to Vercel.
2.  In your Vercel project settings, go to **Settings > Environment Variables**.
3.  Add the three variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` with their corresponding values.
4.  Trigger a new deployment.

---

## 👨‍💻 Authors

* **chisom-1010** - *Lead Developer*
