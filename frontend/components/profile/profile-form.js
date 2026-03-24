"use client";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const departments = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Emergency"];

export function ProfileForm({ isHospital, patientForm, setPatientForm, hospitalForm, setHospitalForm, onSave, locked = false }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {!isHospital ? (
        <>
          <FormField label="Name" required>
            <Input disabled={locked} value={patientForm.name} onChange={(event) => setPatientForm((prev) => ({ ...prev, name: event.target.value }))} />
          </FormField>
          <FormField label="Email" required>
            <Input disabled={locked} value={patientForm.email} onChange={(event) => setPatientForm((prev) => ({ ...prev, email: event.target.value }))} />
          </FormField>
          <FormField label="Phone" required>
            <Input disabled={locked} value={patientForm.phone} onChange={(event) => setPatientForm((prev) => ({ ...prev, phone: event.target.value }))} />
          </FormField>
          <FormField label="Blood Group">
            <Input disabled={locked} value={patientForm.bloodGroup} onChange={(event) => setPatientForm((prev) => ({ ...prev, bloodGroup: event.target.value }))} />
          </FormField>
          <FormField label="Age">
            <Input disabled={locked} value={patientForm.age} onChange={(event) => setPatientForm((prev) => ({ ...prev, age: event.target.value }))} />
          </FormField>
          <FormField label="DOB">
            <Input disabled={locked} type="date" value={patientForm.dob} onChange={(event) => setPatientForm((prev) => ({ ...prev, dob: event.target.value }))} />
          </FormField>
          <FormField label="Emergency Contact" className="md:col-span-2">
            <Input disabled={locked} value={patientForm.emergencyContact} onChange={(event) => setPatientForm((prev) => ({ ...prev, emergencyContact: event.target.value }))} />
          </FormField>
          <FormField label="Address" className="md:col-span-2">
            <Textarea disabled={locked} rows={3} value={patientForm.address} onChange={(event) => setPatientForm((prev) => ({ ...prev, address: event.target.value }))} />
          </FormField>
          <FormField label="Allergies (comma separated)" className="md:col-span-2">
            <Input disabled={locked} value={patientForm.allergies} onChange={(event) => setPatientForm((prev) => ({ ...prev, allergies: event.target.value }))} placeholder="e.g. Penicillin, Pollen" />
          </FormField>
          <FormField label="Medical Conditions (comma separated)" className="md:col-span-2">
            <Input disabled={locked} value={patientForm.medicalConditions} onChange={(event) => setPatientForm((prev) => ({ ...prev, medicalConditions: event.target.value }))} placeholder="e.g. Hypertension, Asthma" />
          </FormField>
          <FormField label="Medications (comma separated)" className="md:col-span-2">
            <Input disabled={locked} value={patientForm.medications} onChange={(event) => setPatientForm((prev) => ({ ...prev, medications: event.target.value }))} placeholder="e.g. Metformin, Aspirin" />
          </FormField>
        </>
      ) : (
        <>
          <FormField label="Hospital Name" required>
            <Input disabled={locked} value={hospitalForm.hospitalName} onChange={(event) => setHospitalForm((prev) => ({ ...prev, hospitalName: event.target.value }))} />
          </FormField>
          <FormField label="License Number" required>
            <Input disabled={locked} value={hospitalForm.licenseNumber} onChange={(event) => setHospitalForm((prev) => ({ ...prev, licenseNumber: event.target.value }))} />
          </FormField>
          <FormField label="Contact Email" required>
            <Input disabled={locked} value={hospitalForm.contactEmail} onChange={(event) => setHospitalForm((prev) => ({ ...prev, contactEmail: event.target.value }))} />
          </FormField>
          <FormField label="Contact Phone" required>
            <Input disabled={locked} value={hospitalForm.contactPhone} onChange={(event) => setHospitalForm((prev) => ({ ...prev, contactPhone: event.target.value }))} />
          </FormField>
          <FormField label="Departments" className="md:col-span-2">
            <div className="flex flex-wrap gap-2">
              {departments.map((item) => {
                const active = hospitalForm.departments.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setHospitalForm((prev) => ({
                        ...prev,
                        departments: active
                          ? prev.departments.filter((entry) => entry !== item)
                          : [...prev.departments, item]
                      }))
                    }
                    disabled={locked}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </FormField>
          <FormField label="Hospital Address" className="md:col-span-2">
            <Textarea disabled={locked} rows={3} value={hospitalForm.address} onChange={(event) => setHospitalForm((prev) => ({ ...prev, address: event.target.value }))} />
          </FormField>
        </>
      )}

      <div className="flex flex-col gap-2 md:col-span-2 md:flex-row md:justify-end">
        <Button variant="secondary" className="w-full md:w-auto" disabled={locked}>Edit Profile</Button>
        <Button onClick={onSave} className="w-full md:w-auto" disabled={locked}>Save Profile</Button>
      </div>
    </div>
  );
}
