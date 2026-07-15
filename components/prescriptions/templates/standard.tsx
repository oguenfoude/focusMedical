/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: "15mm",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 55,
    height: 55,
    objectFit: "contain",
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  clinicInfo: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d5db",
    marginBottom: 12,
  },
  doctorLine: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  doctorDetail: {
    fontSize: 9,
    color: "#666",
    marginBottom: 10,
  },
  patientRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    fontSize: 10,
    marginBottom: 14,
  },
  label: {
    fontWeight: "bold",
  },
  separator: {
    color: "#9ca3af",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#6b7280",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 10,
    lineHeight: 1.6,
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

export interface PrescriptionData {
  clinic: {
    name: string;
    address: string | null;
    phone: string | null;
    logoUrl: string | null;
  };
  doctorName: string | null;
  doctorSpecialty?: string | null;
  doctorOrdreNumber?: string | null;
  patient: {
    fullName: string;
    age: string | null;
    gender?: string | null;
    height?: number | null;
    weight?: number | null;
  };
  consultationDate: string;
  diagnostique: string | null;
  ordonnanceContent: string | null;
  prePrintedTemplate?: boolean;
  labels: {
    doctor: string;
    patient: string;
    age: string;
    date: string;
    diagnosis: string;
    prescription: string;
    signature: string;
    noPrescription: string;
    specialty?: string;
    ordreNumber?: string;
    gender?: string;
    height?: string;
    weight?: string;
  };
}

export function StandardTemplate({ data }: { data: PrescriptionData }) {
  const { clinic, doctorName, doctorSpecialty, doctorOrdreNumber, patient, consultationDate, diagnostique, ordonnanceContent, prePrintedTemplate, labels } = data;

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* Clinic Header */}
        {prePrintedTemplate ? (
          <View style={{ height: 150 }} />
        ) : (
          <View style={styles.header}>
            {clinic.logoUrl && (
              <Image src={clinic.logoUrl} style={styles.logo} />
            )}
            <Text style={styles.clinicName}>{clinic.name}</Text>
            {clinic.address && (
              <Text style={styles.clinicInfo}>{clinic.address}</Text>
            )}
            {clinic.phone && (
              <Text style={styles.clinicInfo}>{clinic.phone}</Text>
            )}
          </View>
        )}

        <View style={styles.divider} />

        {/* Doctor */}
        {!prePrintedTemplate && doctorName && (
          <Text style={styles.doctorLine}>
            {labels.doctor}: {doctorName}
          </Text>
        )}
        {!prePrintedTemplate && (doctorSpecialty || doctorOrdreNumber) && (
          <Text style={styles.doctorDetail}>
            {[doctorSpecialty, doctorOrdreNumber ? `${labels.ordreNumber}: ${doctorOrdreNumber}` : null].filter(Boolean).join(" — ")}
          </Text>
        )}

        {/* Patient Info */}
        <View style={styles.patientRow}>
          <Text>
            <Text style={styles.label}>{labels.patient}: </Text>
            {patient.fullName}
          </Text>
          <Text style={styles.separator}>|</Text>
          <Text>
            <Text style={styles.label}>{labels.age}: </Text>
            {patient.age || ""}
          </Text>
          {patient.gender && (
            <>
              <Text style={styles.separator}>|</Text>
              <Text>
                <Text style={styles.label}>{labels.gender}: </Text>
                {patient.gender}
              </Text>
            </>
          )}
          {patient.height && (
            <>
              <Text style={styles.separator}>|</Text>
              <Text>
                <Text style={styles.label}>{labels.height}: </Text>
                {patient.height} cm
              </Text>
            </>
          )}
          {patient.weight && (
            <>
              <Text style={styles.separator}>|</Text>
              <Text>
                <Text style={styles.label}>{labels.weight}: </Text>
                {patient.weight} kg
              </Text>
            </>
          )}
          <Text style={styles.separator}>|</Text>
          <Text>
            <Text style={styles.label}>{labels.date}: </Text>
            {consultationDate}
          </Text>
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
