// app/(admin)/manage-students/StudentClientTable.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Upload, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Filiere = { id: string; nom_filiere: string; niveau: string };
type AnneeAcademique = { id: string; nom_annee: string };
type Student = {
  id: string;
  nom_complet: string;
  filiere_id: string | null;
  filiere: { nom_filiere: string; niveau: string } | null;
  annee_academique_id: string | null;
  annee_academique: { nom_annee: string } | null;
};

interface StudentClientTableProps {
  students: Student[];
  filieres: Filiere[];
  anneesAcademiques: AnneeAcademique[];
}

type ImportResultRow = {
  email: string;
  status: "created" | "error";
  message?: string;
};

export function StudentClientTable({
  students: initialStudents,
  filieres,
  anneesAcademiques,
}: StudentClientTableProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [filiereFilter, setFiliereFilter] = useState<string>("all");

  // --- Ajout unitaire ---
  const [isSingleOpen, setIsSingleOpen] = useState(false);
  const [nomComplet, setNomComplet] = useState("");
  const [email, setEmail] = useState("");
  const [filiereId, setFiliereId] = useState("");
  const [anneeId, setAnneeId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [singleResultPassword, setSingleResultPassword] = useState<
    string | null
  >(null);

  const resetSingleForm = () => {
    setNomComplet("");
    setEmail("");
    setFiliereId("");
    setAnneeId("");
  };

  const handleCreateSingle = async () => {
    if (!nomComplet.trim() || !email.trim() || !filiereId || !anneeId) {
      toast.error("Tous les champs sont requis.");
      return;
    }
    setIsCreating(true);
    try {
      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom_complet: nomComplet,
          email,
          filiere_id: filiereId,
          annee_academique_id: anneeId,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Échec de la création.");
      }

      const filiere = filieres.find((f) => f.id === filiereId) || null;
      const annee = anneesAcademiques.find((a) => a.id === anneeId) || null;
      setStudents((current) => [
        {
          id: result.student.id,
          nom_complet: result.student.nom_complet,
          filiere_id: filiereId,
          filiere,
          annee_academique_id: anneeId,
          annee_academique: annee,
        },
        ...current,
      ]);
      setSingleResultPassword(result.defaultPassword);
      toast.success("Étudiant créé.");
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setIsCreating(false);
    }
  };

  const closeSingleDialog = () => {
    setIsSingleOpen(false);
    setSingleResultPassword(null);
    resetSingleForm();
  };

  // --- Suppression ---
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/students/${deletingStudent.id}`,
        { method: "DELETE" },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Échec de la suppression.");
      }
      setStudents((current) =>
        current.filter((s) => s.id !== deletingStudent.id),
      );
      toast.success(`"${deletingStudent.nom_complet}" a été supprimé.`);
      setDeletingStudent(null);
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Import CSV ---
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<
    {
      nom_complet: string;
      email: string;
      filiere_id: string;
      annee_academique_id: string;
    }[]
  >([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    createdCount: number;
    errorCount: number;
    defaultPassword: string;
    results: ImportResultRow[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filiereByName = useMemo(() => {
    const map = new Map<string, string>();
    filieres.forEach((f) => map.set(f.nom_filiere.trim().toLowerCase(), f.id));
    return map;
  }, [filieres]);

  const anneeByName = useMemo(() => {
    const map = new Map<string, string>();
    anneesAcademiques.forEach((a) =>
      map.set(a.nom_annee.trim().toLowerCase(), a.id),
    );
    return map;
  }, [anneesAcademiques]);

  // Format CSV attendu (en-tête requis) :
  // nom_complet,email,filiere,annee_academique
  // "filiere" et "annee_academique" doivent correspondre exactement aux noms
  // existants (ex: "SRI-2", "2025-2026"). Séparateur virgule ou
  // point-virgule, les deux sont acceptés.
  const handleFileSelected = (file: File) => {
    setCsvFileName(file.name);
    setImportResults(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setParseErrors(["Le fichier est vide ou ne contient pas de données."]);
        setParsedRows([]);
        return;
      }

      const delimiter = lines[0].includes(";") ? ";" : ",";
      const header = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());
      const idxNom = header.indexOf("nom_complet");
      const idxEmail = header.indexOf("email");
      const idxFiliere = header.indexOf("filiere");
      const idxAnnee = header.indexOf("annee_academique");

      if (idxNom === -1 || idxEmail === -1 || idxFiliere === -1 || idxAnnee === -1) {
        setParseErrors([
          "En-tête invalide. Colonnes attendues : nom_complet,email,filiere,annee_academique",
        ]);
        setParsedRows([]);
        return;
      }

      const rows: {
        nom_complet: string;
        email: string;
        filiere_id: string;
        annee_academique_id: string;
      }[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map((c) => c.trim());
        const nom = cols[idxNom];
        const mail = cols[idxEmail];
        const filiereName = cols[idxFiliere];
        const anneeName = cols[idxAnnee];
        const fId = filiereName
          ? filiereByName.get(filiereName.toLowerCase())
          : undefined;
        const aId = anneeName
          ? anneeByName.get(anneeName.toLowerCase())
          : undefined;

        if (!nom || !mail || !filiereName || !anneeName) {
          errors.push(`Ligne ${i + 1} : champ manquant.`);
          continue;
        }
        if (!fId) {
          errors.push(
            `Ligne ${i + 1} : filière "${filiereName}" introuvable.`,
          );
          continue;
        }
        if (!aId) {
          errors.push(
            `Ligne ${i + 1} : année académique "${anneeName}" introuvable.`,
          );
          continue;
        }
        rows.push({
          nom_complet: nom,
          email: mail,
          filiere_id: fId,
          annee_academique_id: aId,
        });
      }

      setParsedRows(rows);
      setParseErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    try {
      const response = await fetch("/api/admin/students/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedRows }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Échec de l'import.");
      }
      setImportResults(result);
      toast.success(
        `${result.createdCount} étudiant(s) créé(s), ${result.errorCount} erreur(s).`,
      );
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setIsImporting(false);
    }
  };

  const closeImportDialog = () => {
    setIsImportOpen(false);
    setCsvFileName(null);
    setParsedRows([]);
    setParseErrors([]);
    setImportResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredStudents =
    filiereFilter === "all"
      ? students
      : students.filter((s) => s.filiere_id === filiereFilter);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Liste des Étudiants ({filteredStudents.length})
          </h2>
          <Select value={filiereFilter} onValueChange={setFiliereFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filtrer par filière" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les filières</SelectItem>
              {filieres.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.nom_filiere} ({f.niveau})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {/* Import CSV */}
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Importer CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Importer des étudiants (CSV)</DialogTitle>
                <DialogDescription>
                  Colonnes requises :{" "}
                  <code>nom_complet,email,filiere,annee_academique</code>{" "}
                  (les noms de filière et d'année académique doivent
                  correspondre exactement à des valeurs existantes, ex:
                  "SRI-2", "2025-2026"). Emails au format
                  prenom.nom@esgis.org.
                </DialogDescription>
              </DialogHeader>

              {!importResults && (
                <>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelected(file);
                    }}
                  />
                  {csvFileName && (
                    <p className="text-sm text-muted-foreground">
                      {csvFileName} — {parsedRows.length} ligne(s) valide(s)
                      {parseErrors.length > 0 &&
                        `, ${parseErrors.length} erreur(s)`}
                    </p>
                  )}
                  {parseErrors.length > 0 && (
                    <div className="max-h-32 overflow-y-auto text-sm text-red-600 space-y-1">
                      {parseErrors.map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  )}
                </>
              )}

              {importResults && (
                <div className="max-h-72 overflow-y-auto">
                  <p className="text-sm mb-2">
                    {importResults.createdCount} créé(s) ·{" "}
                    {importResults.errorCount} erreur(s) · mot de passe par
                    défaut :{" "}
                    <code className="text-sm">
                      {importResults.defaultPassword}
                    </code>
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importResults.results.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.email}</TableCell>
                          <TableCell
                            className={
                              r.status === "created"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {r.status === "created" ? "Créé" : r.message}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <DialogFooter>
                {importResults ? (
                  <Button
                    type="button"
                    onClick={() => {
                      closeImportDialog();
                      window.location.reload();
                    }}
                  >
                    Fermer et rafraîchir
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeImportDialog}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      onClick={handleImport}
                      disabled={parsedRows.length === 0 || isImporting}
                    >
                      {isImporting
                        ? "Import..."
                        : `Importer ${parsedRows.length} étudiant(s)`}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Ajout unitaire */}
          <Dialog open={isSingleOpen} onOpenChange={setIsSingleOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Nouvel Étudiant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un Étudiant</DialogTitle>
                <DialogDescription>
                  {singleResultPassword
                    ? "Compte créé. Communiquez ces identifiants physiquement à l'étudiant."
                    : "Le compte est créé avec le mot de passe par défaut de l'établissement."}
                </DialogDescription>
              </DialogHeader>

              {singleResultPassword ? (
                <div className="rounded-md bg-muted p-4 text-sm space-y-1">
                  <p>
                    <span className="font-medium">Email :</span> {email}
                  </p>
                  <p>
                    <span className="font-medium">Mot de passe :</span>{" "}
                    <code className="text-base">{singleResultPassword}</code>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nom-etudiant">Nom complet</Label>
                    <Input
                      id="nom-etudiant"
                      value={nomComplet}
                      onChange={(e) => setNomComplet(e.target.value)}
                      placeholder="Prénom Nom"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email-etudiant">
                      Email institutionnel
                    </Label>
                    <Input
                      id="email-etudiant"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="prenom.nom@esgis.org"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="filiere-etudiant">Filière</Label>
                    <Select value={filiereId} onValueChange={setFiliereId}>
                      <SelectTrigger id="filiere-etudiant">
                        <SelectValue placeholder="Sélectionnez une filière" />
                      </SelectTrigger>
                      <SelectContent>
                        {filieres.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.nom_filiere} ({f.niveau})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="annee-etudiant">Année académique</Label>
                    <Select value={anneeId} onValueChange={setAnneeId}>
                      <SelectTrigger id="annee-etudiant">
                        <SelectValue placeholder="Sélectionnez une année académique" />
                      </SelectTrigger>
                      <SelectContent>
                        {anneesAcademiques.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.nom_annee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <DialogFooter>
                {singleResultPassword ? (
                  <Button type="button" onClick={closeSingleDialog}>
                    Fermer
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsSingleOpen(false)}
                      disabled={isCreating}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateSingle}
                      disabled={isCreating}
                    >
                      {isCreating ? "Création..." : "Créer"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom Complet</TableHead>
            <TableHead>Filière</TableHead>
            <TableHead>Niveau</TableHead>
            <TableHead>Année Académique</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.nom_complet}</TableCell>
              <TableCell>{s.filiere?.nom_filiere || "N/A"}</TableCell>
              <TableCell>{s.filiere?.niveau || "N/A"}</TableCell>
              <TableCell>{s.annee_academique?.nom_annee || "N/A"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Ouvrir le menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => setDeletingStudent(s)}
                    >
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {filteredStudents.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Aucun étudiant pour le moment.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Confirmation de suppression */}
      <Dialog
        open={!!deletingStudent}
        onOpenChange={(open) => !open && setDeletingStudent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cet étudiant ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive. "{deletingStudent?.nom_complet}"
              perdra l'accès à l'application. Ses évaluations déjà soumises
              restent conservées (anonymisées, non rattachées à un compte
              supprimé).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingStudent(null)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
