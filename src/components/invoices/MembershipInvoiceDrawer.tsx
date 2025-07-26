'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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

const formatISTDate = (dateStr, compact = false) => {
  if (!dateStr) return "N/A"
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return "Invalid"
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: compact ? "2-digit" : "long",
    year: "numeric",
  })
}

const formatINRCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)

function MembershipInvoicePDF({ invoiceData }) {
  const {
    invoice_id,
    date,
    customerName,
    customerPhone,
    joinDate,
    plan,
    startDate,
    endDate,
    category,
    paymentMethod,
    amountPaid,
    showJoiningFee,
  } = invoiceData

  const membershipPrice = amountPaid - (showJoiningFee ? 5000 : 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Tenzin&apos;s Gym - Membership Invoice</Text>
          <Text><Text style={styles.label}>Invoice ID:</Text> {invoice_id}</Text>
          <Text><Text style={styles.label}>Date:</Text> {formatISTDate(date)}</Text>
          <Text><Text style={styles.label}>Customer Name:</Text> {customerName}</Text>
          <Text><Text style={styles.label}>Contact:</Text> {customerPhone}</Text>
          <Text><Text style={styles.label}>Join Date:</Text> {formatISTDate(joinDate)}</Text>
          <Text><Text style={styles.label}>Membership Plan:</Text> {plan}</Text>
          <Text><Text style={styles.label}>Membership Start:</Text> {formatISTDate(startDate, true)}</Text>
          <Text><Text style={styles.label}>Membership End:</Text> {formatISTDate(endDate, true)}</Text>
          <Text><Text style={styles.label}>Category:</Text> {category?.charAt(0).toUpperCase() + category?.slice(1)}</Text>
          <Text><Text style={styles.label}>Payment Method:</Text> {paymentMethod}</Text>
          <Text><Text style={styles.label}>Membership Price:</Text> ₹{membershipPrice}</Text>
          {showJoiningFee && (
            <Text><Text style={styles.label}>Joining Fee:</Text> ₹5000</Text>
          )}
          <Text><Text style={styles.label}>Total Paid:</Text> ₹{amountPaid}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default function MembershipInvoiceDrawer({ open, onClose, invoiceData }) {
  if (!invoiceData) return null

  const {
    invoice_id,
    customerName,
    customerPhone,
    joinDate,
    plan,
    paymentMethod,
    amountPaid,
    date,
    startDate,
    endDate,
    category,
    showJoiningFee = false,
  } = invoiceData

  const joiningFee = showJoiningFee ? 5000 : 0
  const membershipPrice = Math.max(0, amountPaid - joiningFee)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Membership Invoice</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-4 text-sm text-black">
          <h2 className="text-lg font-bold mb-2 text-center">Tenzin&apos;s Gym</h2>
          <p className="text-center text-muted-foreground mb-4">{formatISTDate(date)}</p>

          <p><strong>Invoice ID:</strong> {invoice_id}</p>
          <p><strong>Customer Name:</strong> {customerName}</p>
          <p><strong>Contact:</strong> {customerPhone}</p>
          <p><strong>Join Date:</strong> {formatISTDate(joinDate)}</p>
          <p><strong>Membership Plan:</strong> {plan}</p>
          <p><strong>Membership Start:</strong> {formatISTDate(startDate, true)}</p>
          <p><strong>Membership End:</strong> {formatISTDate(endDate, true)}</p>
          <p><strong>Category:</strong> {category?.charAt(0).toUpperCase() + category?.slice(1)}</p>
          <p><strong>Payment Method:</strong> {paymentMethod}</p>

          {showJoiningFee && (
            <p><strong>Joining Fee:</strong> {formatINRCurrency(joiningFee)}</p>
          )}
          <p><strong>Membership Price:</strong> {formatINRCurrency(membershipPrice)}</p>
          <p className="mt-2 border-t pt-2"><strong>Total Amount Paid:</strong> {formatINRCurrency(amountPaid)}</p>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <PDFDownloadLink
            document={<MembershipInvoicePDF invoiceData={invoiceData} />}
            fileName={`MembershipInvoice-${invoice_id}.pdf`}
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
