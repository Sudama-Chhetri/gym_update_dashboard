'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
  },
})

// PDF Document
function TrainerInvoicePDF({ invoiceData = {} }) {
  const {
    invoice_id = '',
    date = '',
    customerName = '',
    customerPhone = '',
    trainerName = '',
    assignStart = '',
    assignEnd = '',
    paymentMethod = '',
    total = 0,
  } = invoiceData

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Tenzing Gym - Trainer Assignment Bill</Text>
          <Text><Text style={styles.label}>Invoice ID:</Text> {invoice_id}</Text>
          <Text><Text style={styles.label}>Date:</Text> {date}</Text>
          <Text><Text style={styles.label}>Member:</Text> {customerName || 'N/A'} ({customerPhone || 'N/A'})</Text>
          <Text><Text style={styles.label}>Trainer:</Text> {trainerName}</Text>
          <Text><Text style={styles.label}>Assignment Start:</Text> {assignStart}</Text>
          <Text><Text style={styles.label}>Assignment End:</Text> {assignEnd}</Text>
          <Text><Text style={styles.label}>Payment Method:</Text> {paymentMethod}</Text>
          <Text><Text style={styles.label}>Total Paid:</Text> ₹{(Number(total) || 0).toFixed(2)}</Text>
        </View>
      </Page>
    </Document>
  )
}

// Main Component
export default function TrainerInvoiceDrawer({ open, onClose, invoiceData }) {
  if (!invoiceData) return null

  const {
    invoice_id = '',
    date = '',
    customerName = '',
    customerPhone = '',
    trainerName = '',
    assignStart = '',
    assignEnd = '',
    paymentMethod = '',
    total = 0,
  } = invoiceData

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] print:bg-white">
        <DialogHeader>
          <DialogTitle>Trainer Invoice</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-4 text-sm text-black">
          <h2 className="text-lg font-bold mb-2">Tenzing Gym - Trainer Assignment</h2>
          <p><strong>Invoice ID:</strong> {invoice_id}</p>
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Customer Name:</strong> {customerName}</p>
          <p><strong>Phone:</strong> {customerPhone}</p>
          <p><strong>Trainer:</strong> {trainerName}</p>
          <p><strong>Assignment Start:</strong> {assignStart}</p>
          <p><strong>Assignment End:</strong> {assignEnd}</p>
          <p><strong>Payment Method:</strong> {paymentMethod}</p>
          <p><strong>Total Paid:</strong> ₹{(Number(total) || 0).toFixed(2)}</p>
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
