export type HospitalChoice = {
  id: string;
  name: string;
  branch: string | null;
  address: string | null;
};

export function hospitalChoiceLabel(hospital: HospitalChoice): string {
  return [
    hospital.name,
    hospital.branch?.trim(),
    hospital.address?.trim() || "주소 미등록",
    `ID ${hospital.id.slice(0, 8)}`,
  ].filter(Boolean).join(" · ");
}
