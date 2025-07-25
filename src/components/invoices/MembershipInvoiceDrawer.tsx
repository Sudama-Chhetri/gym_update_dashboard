'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

const formatCompactDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN")

const formatINRCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)


function MembershipInvoicePDF({ invoiceData }) {
  const formattedDate = new Date(invoiceData.date).toLocaleString()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Tenzing Gym - Membership Invoice</Text>
          <Text><Text style={styles.label}>Invoice ID:</Text> {invoiceData.invoice_id}</Text>
          <Text><Text style={styles.label}>Date:</Text> {formattedDate}</Text>
          <Text><Text style={styles.label}>Customer Name:</Text> {invoiceData.customerName}</Text>
          <Text><Text style={styles.label}>Contact:</Text> {invoiceData.customerPhone}</Text>
          <Text><Text style={styles.label}>Join Date:</Text> {invoiceData.joinDate}</Text>
          <Text><Text style={styles.label}>Membership Plan:</Text> {invoiceData.membershipPlan}</Text>
          <Text><Text style={styles.label}>Membership Start:</Text> {new Date(invoiceData.membershipStart).toLocaleDateString("en-IN")}</Text>
          <Text><Text style={styles.label}>Membership End:</Text> {new Date(invoiceData.membershipEnd).toLocaleDateString("en-IN")}</Text>
          <Text><Text style={styles.label}>Category:</Text> {invoiceData.category?.charAt(0).toUpperCase() + invoiceData.category?.slice(1)}</Text>
          <Text><Text style={styles.label}>Payment Method:</Text> {invoiceData.paymentMethod}</Text>
          <Text><Text style={styles.label}>Membership Price:</Text> ₹{invoiceData.amountPaid - (invoiceData.joiningFee || 0)}</Text>
          {invoiceData.joiningFee > 0 && (
            <Text><Text style={styles.label}>Joining Fee:</Text> ₹{invoiceData.joiningFee}</Text>
          )}
          <Text><Text style={styles.label}>Total Paid:</Text> ₹{invoiceData.amountPaid}</Text>

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
    membershipPlan,
    paymentMethod,
    amountPaid,
    date,
    membershipStart,
    membershipEnd,
    category,
  } = invoiceData

  const formattedDate = new Date(date).toLocaleString()
  const formattedJoinDate = new Date(joinDate).toLocaleDateString("en-IN", {
  year: "numeric",
  month: "long",
  day: "numeric",
})

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Membership Invoice</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-4 text-sm text-black">
          <h2 className="text-lg font-bold mb-2 text-center">Tenzin&apos;s Gym</h2>
          <p className="text-center text-muted-foreground mb-4">{formatDate(date)}</p>

          <p><strong>Invoice ID:</strong> {invoice_id}</p>
          <p><strong>Customer Name:</strong> {customerName}</p>
          <p><strong>Contact:</strong> {customerPhone}</p>
          <p><strong>Join Date:</strong> {formatDate(joinDate)}</p>
          <p><strong>Membership Plan:</strong> {membershipPlan}</p>
          <p><strong>Membership Start:</strong> {formatCompactDate(membershipStart)}</p>
          <p><strong>Membership End:</strong> {formatCompactDate(membershipEnd)}</p>
          <p><strong>Category:</strong> {category?.charAt(0).toUpperCase() + category?.slice(1)}</p>
          <p><strong>Payment Method:</strong> {paymentMethod}</p>

          {invoiceData.joiningFee > 0 && (
            <p><strong>Joining Fee:</strong> {formatINRCurrency(invoiceData.joiningFee)}</p>
          )}
          <p><strong>Membership Price:</strong> {formatINRCurrency(amountPaid - (invoiceData.joiningFee || 0))}</p>

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
