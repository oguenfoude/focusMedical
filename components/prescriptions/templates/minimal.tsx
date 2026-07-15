/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { PrescriptionData } from "./standard";

const styles = StyleSheet.create({
  page: {
    padding: "15mm",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 35,
    height: 35,
    objectFit: "contain",
  },
  clinicName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  clinicInfo: {
    fontSize: 8,
    color: "#666",
    marginTop: 1,
  },
  fullDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d5db",
    marginBottom: 12,
  },
  doctorLine: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  doctorDetail: {
    fontSize: 9,
    color: "#666",
    marginBottom: 10,
  },
  patientInfo: {
    fontSize: 10,
    lineHeight: 1.8,
    marginBottom: 14,
  },
  patientLabel: {
    fontWeight: "bold",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
  },
  prescriptionItem: {
    fontSize: 10,
    lineHeight: 1.8,
    paddingLeft: 12,
    marginBottom: 1,
  },
  noPrescription: {
    fontSize: 10,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  signatureArea: {
    marginTop: 50,
    borderTopWidth: 0.5,
    borderTopColor: "#d1d5db",
    paddingTop: 12,
    alignItems: "flex-end",
  },
  signatureLine: {
    width: 140,
    borderBottomWidth: 0.5,
    borderBottomColor: "#9ca3af",
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#9ca3af",
    letterSpacing: 0.5,
  },
});

export function MinimalTemplate({ data }: { data: PrescriptionData }) {
  const { clinic, doctorName, doctorSpecialty, doctorOrdreNumber, patient, consultationDate, diagnostique, ordonnanceContent, prePrintedTemplate, labels } = data;

  const patientParts: string[] = [];
  patientParts.push(`${labels.patient}: ${patient.fullName}`);
  if (patient.age) patientParts.push(`${labels.age}: ${patient.age}`);
  if (patient.gender) patientParts.push(`${labels.gender}: ${patient.gender}`);
  if (patient.height) patientParts.push(`${labels.height}: ${patient.height} cm`);
  if (patient.weight) patientParts.push(`${labels.weight}: ${patient.weight} kg`);
  patientParts.push(`${labels.date}: ${consultationDate}`);

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Split Header: Logo + Name LEFT, Address + Phone RIGHT */}
        {prePrintedTemplate ? (
          <View style={{ height: 150 }} />
        ) : (
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {clinic.logoUrl && (
                <Image src={clinic.logoUrl} style={styles.logo} />
              )}
              <Text style={styles.clinicName}>{clinic.name}</Text>
            </View>
            <View style={styles.headerRight}>
              {clinic.address && <Text style={styles.clinicInfo}>{clinic.address}</Text>}
              {clinic.phone && <Text style={styles.clinicInfo}>{clinic.phone}</Text>}
            </View>
          </View>
        )}

        <View style={styles.fullDivider} />

        {/* Doctor */}
        {!prePrintedTemplate && doctorName && (
          <>
            <Text style={styles.doctorLine}>{doctorName}</Text>
            {(doctorSpecialty || doctorOrdreNumber) && (
              <Text style={styles.doctorDetail}>
                {[doctorSpecialty, doctorOrdreNumber ? `${labels.ordreNumber}: ${doctorOrdreNumber}` : null].filter(Boolean).join(" — ")}
              </Text>
            )}
          </>
        )}

        {/* Patient Info (plain text) */}
        <Text style={styles.patientInfo}>
          {patientParts.join("  ·  ")}
        </Text>

        {/* Diagnosis */}
        {diagnostique && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.diagnosis}</Text>
            <Text>{diagnostique}</Text>
          </View>
        )}

        {/* Prescription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.prescription}</Text>
          {ordonnanceContent ? (
            ordonnanceContent.split("\n").filter(Boolean).map((line, i) => (
              <Text key={i} style={styles.prescriptionItem}>· {line}</Text>
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
