/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { PrescriptionData } from "./standard";

const styles = StyleSheet.create({
  page: {
    padding: "18mm",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    alignItems: "center",
    marginBottom: 6,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: "contain",
    marginBottom: 6,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  clinicInfo: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  doubleDivider: {
    marginBottom: 14,
  },
  dividerThick: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#1a1a1a",
    marginBottom: 2,
  },
  dividerThin: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#1a1a1a",
  },
  doctorBlock: {
    marginBottom: 12,
  },
  doctorLine: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  doctorDetail: {
    fontSize: 9,
    color: "#666",
  },
  patientBlock: {
    backgroundColor: "#f9fafb",
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: "8 12",
    marginBottom: 14,
  },
  patientTitle: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#6b7280",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  patientRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 10,
  },
  patientField: {
    flexDirection: "row",
    gap: 4,
  },
  label: {
    fontWeight: "bold",
    fontSize: 9,
  },
  value: {
    fontSize: 10,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#6b7280",
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d5db",
  },
  sectionContent: {
    fontSize: 10,
    lineHeight: 1.8,
  },
  signatureArea: {
    marginTop: 50,
    alignItems: "flex-end",
  },
  signatureLine: {
    width: 160,
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

export function ElegantTemplate({ data }: { data: PrescriptionData }) {
  const { clinic, doctorName, doctorSpecialty, doctorOrdreNumber, patient, consultationDate, diagnostique, ordonnanceContent, prePrintedTemplate, labels } = data;

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Header with double divider */}
        {prePrintedTemplate ? (
          <View style={{ height: 150 }} />
        ) : (
          <View style={styles.header}>
            {clinic.logoUrl && (
              <Image src={clinic.logoUrl} style={styles.logo} />
            )}
            <Text style={styles.clinicName}>{clinic.name}</Text>
            {clinic.address && <Text style={styles.clinicInfo}>{clinic.address}</Text>}
            {clinic.phone && <Text style={styles.clinicInfo}>{clinic.phone}</Text>}
          </View>
        )}

        <View style={styles.doubleDivider}>
          <View style={styles.dividerThick} />
          <View style={styles.dividerThin} />
        </View>

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

        {/* Patient Info Block (shaded) */}
        <View style={styles.patientBlock}>
          <Text style={styles.patientTitle}>{labels.patient}</Text>
          <View style={styles.patientRow}>
            <View style={styles.patientField}>
              <Text style={styles.label}>{labels.patient}: </Text>
              <Text style={styles.value}>{patient.fullName}</Text>
            </View>
            <View style={styles.patientField}>
              <Text style={styles.label}>{labels.age}: </Text>
              <Text style={styles.value}>{patient.age || ""}</Text>
            </View>
            {patient.gender && (
              <View style={styles.patientField}>
                <Text style={styles.label}>{labels.gender}: </Text>
                <Text style={styles.value}>{patient.gender}</Text>
              </View>
            )}
            {patient.height && (
              <View style={styles.patientField}>
                <Text style={styles.label}>{labels.height}: </Text>
                <Text style={styles.value}>{patient.height} cm</Text>
              </View>
            )}
            {patient.weight && (
              <View style={styles.patientField}>
                <Text style={styles.label}>{labels.weight}: </Text>
                <Text style={styles.value}>{patient.weight} kg</Text>
              </View>
            )}
            <View style={styles.patientField}>
              <Text style={styles.label}>{labels.date}: </Text>
              <Text style={styles.value}>{consultationDate}</Text>
            </View>
          </View>
        </View>

        {/* Diagnosis */}
        {diagnostique && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.diagnosis}</Text>
            <Text style={styles.sectionContent}>{diagnostique}</Text>
          </View>
        )}

        {/* Prescription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.prescription}</Text>
          <Text style={styles.sectionContent}>
            {ordonnanceContent || labels.noPrescription}
          </Text>
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
