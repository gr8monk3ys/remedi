import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getHealthProfile, getMedications } from "@/lib/db";
import { HealthProfileForm } from "@/components/dashboard/HealthProfileForm";
import { MedicationCabinetList } from "@/components/dashboard/MedicationCabinetList";

export const metadata = {
  title: "Health Profile | Remedi Dashboard",
  description: "Manage your health profile and medication cabinet",
};

export default async function HealthProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [profile, medications] = await Promise.all([
    getHealthProfile(user.id),
    getMedications(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Health Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your health preferences and medication cabinet
        </p>
      </div>

      <HealthProfileForm
        initialData={
          profile ?? {
            categories: [],
            goals: [],
            allergies: [],
            conditions: [],
            dietaryPrefs: [],
          }
        }
      />

      <MedicationCabinetList
        initialMedications={medications.map((m) => ({
          ...m,
          startDate: m.startDate?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
