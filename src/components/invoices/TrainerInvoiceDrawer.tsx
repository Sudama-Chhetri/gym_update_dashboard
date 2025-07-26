'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
  },
})

const formatINRCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0)

function TrainerInvoicePDF({ invoiceData }) {
  const {
    invoice_id,
    date,
    customerName,
    customerPhone,
    trainerName,
    assignStart,
    assignEnd,
    paymentMethod,
    total,
  } = invoiceData || {}

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Tenzin&apos;s Gym - Trainer Invoice</Text>
          <Text><Text style={styles.label}>Invoice ID:</Text> {invoice_id}</Text>
          <Text><Text style={styles.label}>Date:</Text> {date}</Text>
          <Text><Text style={styles.label}>Customer Name:</Text> {customerName}</Text>
          <Text><Text style={styles.label}>Contact:</Text> {customerPhone}</Text>
          <Text><Text style={styles.label}>Trainer:</Text> {trainerName}</Text>
          <Text><Text style={styles.label}>Assignment Start:</Text> {assignStart}</Text>
          <Text><Text style={styles.label}>Assignment End:</Text> {assignEnd}</Text>
          <Text><Text style={styles.label}>Payment Method:</Text> {paymentMethod}</Text>
          <Text><Text style={styles.label}>Total Paid:</Text> {formatINRCurrency(total)}</Text>
        </View>
        <Text style={{ marginTop: 20, fontSize: 10, color: 'gray' }}>
          Thank you for choosing Tenzing Gym. This is a system-generated invoice.
        </Text>
      </Page>
    </Document>
  )
}

export default function TrainerInvoiceDrawer({ open, onClose, invoiceData }) {
  if (!invoiceData) return null

  const {
    invoice_id,
    date,
    customerName,
    customerPhone,
    trainerName,
    assignStart,
    assignEnd,
    paymentMethod,
    total,
  } = invoiceData

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Trainer Invoice</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-4 text-sm text-black">
          <h2 className="text-lg font-bold mb-2 text-center">Tenzin&apos;s Gym</h2>
          <p className="text-center text-muted-foreground mb-4">{date}</p>

          <p><strong>Invoice ID:</strong> {invoice_id}</p>
          <p><strong>Customer Name:</strong> {customerName}</p>
          <p><strong>Contact:</strong> {customerPhone}</p>
          <p><strong>Trainer:</strong> {trainerName}</p>
          <p><strong>Assignment Start:</strong> {assignStart}</p>
          <p><strong>Assignment End:</strong> {assignEnd}</p>
          <p><strong>Payment Method:</strong> {paymentMethod}</p>
          <p className="mt-2 border-t pt-2">
            <strong>Total Paid:</strong> {formatINRCurrency(total)}
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
                {loading ? 'Preparing PDF...' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </DialogContent>
    </Dialog>
  )
}
