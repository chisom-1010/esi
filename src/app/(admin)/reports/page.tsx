// app/dashboard/rapports/page.tsx
"use client"; // CE FICHIER EST MAINTENANT UN COMPOSANT CLIENT

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Users, BookOpen, Award } from "lucide-react"; // Icônes
// Importation des composants séparés
import { MeilleurEnseignants } from "@/components/MeilleurEnseignants";
import { ClassementClarte } from "@/components/ClassementClarte";
import { CoursAnimes } from "@/components/CoursAnimes";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("meilleurs-enseignants");

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Rapports d'Évaluation
      </h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        {/* Liste des onglets */}
        <TabsList>
          <TabsTrigger
            value="meilleurs-enseignants"
            className="flex items-center gap-2"
          >
            <Award className="h-4 w-4" /> Meilleurs Enseignants
          </TabsTrigger>
          <TabsTrigger
            value="clarity-ranks"
            className="flex items-center gap-2"
          >
            <BarChart2 className="h-4 w-4" /> Classement Clarté
          </TabsTrigger>
          <TabsTrigger
            value="animated-courses"
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" /> Cours Animés
          </TabsTrigger>
        </TabsList>

        {/* Contenu des onglets */}
        <TabsContent value="meilleurs-enseignants">
          {/* Le composant MeilleurEnseignants gère sa propre récupération et affichage */}
          <MeilleurEnseignants />
        </TabsContent>

        <TabsContent value="clarity-ranks">
          {/* Le composant ClassementClarte gère sa propre récupération et affichage */}
          <ClassementClarte />
        </TabsContent>

        <TabsContent value="animated-courses">
          {/* Le composant CoursAnimes gère sa propre récupération et affichage */}
          <CoursAnimes />
        </TabsContent>
      </Tabs>
    </div>
  );
}
