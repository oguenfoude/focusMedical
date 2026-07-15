/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { PrescriptionData } from "./standard";

const styles = StyleSheet.create({
  page: {
    padding: "12mm",
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    objectFit: "contain",
  },
  headerText: {
    flex: 1,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  clinicInfo: {
    fontSize: 8,
    color: "#666",
    marginTop: 1,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    marginBottom: 10,
  },
  doctorBlock: {
    marginBottom: 10,
  },
  doctorLine: {
    fontSize: 9,
    fontWeight: "bold",
  },
  doctorDetail: {
    fontSize: 8,
    color: "#666",
    marginTop: 1,
  },
  patientTable: {
    borderWidth: 0.5,
    borderColor: "#d1d5db",
    marginBottom: 10,
  },
  patientRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  patientRowLast: {
    flexDirection: "row",
  },
  patientLabel: {
    width: "30%",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#6b7280",
    padding: "3 6",
    borderRightWidth: 0.5,
    borderRightColor: "#e5e7eb",
  },
  patientValue: {
    flex: 1,
    fontSize: 9,
    padding: "3 6",
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#6b7280",
    letterSpacing: 0.5,
    marginBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d5db",
    paddingBottom: 2,
  },
  prescriptionLine: {
    fontSize: 9,
    lineHeight: 1.8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
    marginBottom: 2,
  },
  noPrescription: {
    fontSize: 9,
    color: "#9ca3af",
    fontStyle: "italic",
    paddingLeft: 8,
  },
  signatureArea: {
    marginTop: 40,
    alignItems: "flex-end",
  },
  signatureLine: {
    width: 120,
    borderBottomWidth: 0.5,
    borderBottomColor: "#9ca3af",
    marginBottom: 3,
  },
  signatureLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    color: "#9ca3af",
    letterSpacing: 0.5,
  },
});

export function CompactTemplate({ data }: { data: PrescriptionData }) {
  const { clinic, doctorName, doctorSpecialty, doctorOrdreNumber, patient, consultationDate, diagnostique, ordonnanceContent, prePrintedTemplate, labels } = data;

  const patientFields = [
    { label: labels.patient, value: patient.fullName },
    { label: labels.age, value: patient.age || "" },
    patient.gender ? { label: labels.gender, value: patient.gender } : null,
    patient.height ? { label: labels.height, value: `${patient.height} cm` } : null,
    patient.weight ? { label: labels.weight, value: `${patient.weight} kg` } : null,
    { label: labels.date, value: consultationDate },
  ].filter((f): f is { label: string; value: string } => f !== null);

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Header: Logo + Clinic Info (left-aligned) */}
        {prePrintedTemplate ? (
          <View style={{ height: 150 }} />
        ) : (
          <View style={styles.header}>
            {clinic.logoUrl && (
              <Image src={clinic.logoUrl} style={styles.logo} />
            )}
            <View style={styles.headerText}>
              <Text style={styles.clinicName}>{clinic.name}</Text>
              {clinic.address && <Text style={styles.clinicInfo}>{clinic.address}</Text>}
              {clinic.phone && <Text style={styles.clinicInfo}>{clinic.phone}</Text>}
            </View>
          </View>
        )}

        <View style={styles.divider} />

        {/* Doctor */}
        {!prePrintedTemplate && doctorName && (
          <View style={styles.doctorBlock}>
            <Text style={styles.doctorLine}>{doctorName}</Text>
            {(doctorSpecialty || doctorOrdreNumber) && (
              <Text style={styles.doctorDetail}>
                {[doctorSpecialty, doctorOrdreNumber ? `${labels.ordreNumber}: ${doctorOrdreNumber}` : null].filter(Boolean).join(" — ")}
              </Text>
            )}
          </View>
        )}

        {/* Patient Info Table */}
        <View style={styles.patientTable}>
          {patientFields.map((field, i) => (
            <View key={field.label} style={i === patientFields.length - 1 ? styles.patientRowLast : styles.patientRow}>
              <Text style={styles.patientLabel}>{field.label}</Text>
              <Text style={styles.patientValue}>{field.value}</Text>
            </View>
          ))}
        </View>

        {/* Diagnosis */}
        {diagnostique && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.diagnosis}</Text>
            <Text style={styles.prescriptionLine}>{diagnostique}</Text>
          </View>
        )}

        {/* Prescription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.prescription}</Text>
          {ordonnanceContent ? (
            ordonnanceContent.split("\n").filter(Boolean).map((line, i) => (
              <Text key={i} style={styles.prescriptionLine}>{line}</Text>
            ))
          ) : (
            <Text style={styles.noPrescription}>{labels.noPrescription}</Text>
          )}
        </View>

        {/* Signature */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>{labels.signature}</Text>
        </View>
      </Page>
    </Document>
  );
}
