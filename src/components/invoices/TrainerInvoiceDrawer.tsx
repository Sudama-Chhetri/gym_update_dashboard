"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import NextImage from "next/image"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image as PDFImage } from "@react-pdf/renderer"
import { TrainerInvoiceData } from "@/types"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  gymInfo: {
    textAlign: 'center',
    flex: 1,
  },
  invoiceMeta: {
    textAlign: 'right',
    width: 150,
  },
  logo: {
    width: 120,
    height: 120,
  },
  section: {
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 12,
  },
})

const formatISTDate = (dateStr: string, compact: boolean = false) => {
  if (!dateStr) return "N/A"
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return "Invalid"
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: compact ? "2-digit" : "long",
    year: "numeric",
  })
}

function TrainerInvoicePDF({ invoiceData }: { invoiceData: TrainerInvoiceData }) {
  const logoBase64 = ""
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.header}>
          {/* eslint-disable jsx-a11y/alt-text */}
          <PDFImage src={logoBase64} style={styles.logo} />
          <View style={styles.gymInfo}>
            <PDFImage src="/logo.png" style={{ width: 80, height: 40, alignSelf: 'center' }} />
            <Text>Beachwood, Ladenla Road</Text>
            <Text>Darjeeling 734101</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text>Invoice ID: {invoiceData.invoice_id}</Text>
            <Text>Date: {formatISTDate(invoiceData.date)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 14, marginBottom: 5 }}>Trainer Invoice</Text>
          <Text><Text style={styles.label}>Customer:</Text> {invoiceData.customerName || "N/A"} ({invoiceData.customerPhone || "N/A"})</Text>
          <Text><Text style={styles.label}>Trainer:</Text> {invoiceData.trainerName}</Text>
          <Text><Text style={styles.label}>Assignment:</Text> {formatISTDate(invoiceData.assignStart, true)} to {formatISTDate(invoiceData.assignEnd, true)}</Text>
          <Text><Text style={styles.label}>Payment Method:</Text> {invoiceData.paymentMethod}</Text>
          <Text style={{ marginTop: 10 }}><Text style={styles.label}>Total Paid:</Text> ₹{invoiceData.total.toFixed(2)}</Text>
        </View>

        <Text style={{ marginTop: 20, fontSize: 10, color: 'gray', textAlign: 'center' }}>
          Thank you for choosing Tenzin&apos;s Gym. This is a system-generated invoice.
        </Text>
      </Page>
    </Document>
  )
}

export default function TrainerInvoiceDrawer({ open, onClose, invoiceData }: { open: boolean; onClose: () => void; invoiceData: TrainerInvoiceData | null }) {
  if (!invoiceData) return null

  const {
    invoice_id,
    total = 0,
    trainerName = "",
    assignStart = "",
    assignEnd = "",
    customerName = "",
    customerPhone = "",
    paymentMethod = "",
    date = ""
  } = invoiceData

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] print:bg-white">
        <DialogHeader>
          <DialogTitle>Trainer Invoice</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-4 text-sm text-black">
          <h2 className="text-lg font-bold mb-2 text-center">Tenzin&apos;s Gym</h2>
          <div className="flex justify-center mb-4">
            <NextImage src="/logo.png" alt="Tenzin's Gym Logo" width={80} height={40} />
          </div>
          <p className="text-center text-muted-foreground mb-4">{formatISTDate(date)}</p>
          <p><strong>Invoice ID:</strong> {invoice_id}</p>
          <p><strong>Customer Name:</strong> {customerName}</p>
          <p><strong>Contact:</strong> {customerPhone}</p>
          <p><strong>Trainer:</strong> {trainerName}</p>
          <p><strong>Assignment:</strong> {formatISTDate(assignStart, true)} to {formatISTDate(assignEnd, true)}</p>
          <p><strong>Payment Method:</strong> {paymentMethod}</p>
          <p className="mt-2 border-t pt-2">
            <strong>Total Paid:</strong> ₹{total.toFixed(2)}
          </p>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <PDFDownloadLink
            document={<TrainerInvoicePDF invoiceData={invoiceData} />}
            fileName={`TrainerInvoice-${invoice_id}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading}>
                {loading ? "Preparing PDF..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </DialogContent>
    </Dialog>
  )
}
