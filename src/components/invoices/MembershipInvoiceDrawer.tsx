'use client'
/* eslint-disable jsx-a11y/alt-text */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { MembershipInvoiceData } from "@/types"

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

const formatINRCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)

function MembershipInvoicePDF({ invoiceData }: { invoiceData: MembershipInvoiceData }) {
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
    isRenewal = false,
  } = invoiceData

  const membershipPrice = amountPaid - (showJoiningFee ? 5000 : 0)
  const membershipType = isRenewal ? "Renewal" : "New Membership"
  const logoBase64 = ""

  return (  
    <Document>
      <Page size="A4" orientation='portrait' style={styles.page}>
        <View style={styles.header}>
        <Image src={logoBase64} style={styles.logo} />
        <View style={styles.gymInfo}>
          <Text style={{ fontSize: 30, fontWeight: 'bold' }}>TENZIN&apos;S GYM</Text>
          <Text>Beachwood, Ladenla Road</Text>
          <Text>Darjeeling 734101</Text>
        </View>
        <View style={styles.invoiceMeta}>
          <Text>Invoice ID: {invoice_id}</Text>
          <Text>Date: {formatISTDate(date)}</Text>
        </View>
      </View>
      <Text style={{ textAlign: 'center', fontSize: 20, marginBottom: 10 }}>
        Membership Invoice
      </Text>
        <View style={styles.section}>
          <Text><Text style={styles.label}>Type:</Text> {membershipType}</Text>
          <Text><Text style={styles.label}>Customer Name:</Text> {customerName}</Text>
          <Text><Text style={styles.label}>Contact:</Text> {customerPhone}</Text>
          <Text><Text style={styles.label}>Join Date:</Text> {formatISTDate(joinDate)}</Text>
          <Text><Text style={styles.label}>Membership Plan:</Text> {plan}</Text>
          <Text><Text style={styles.label}>Membership Start:</Text> {formatISTDate(startDate, true)}</Text>
          <Text><Text style={styles.label}>Membership End:</Text> {formatISTDate(endDate, true)}</Text>
          <Text><Text style={styles.label}>Category:</Text> {category?.charAt(0).toUpperCase() + category?.slice(1)}</Text>
          <Text><Text style={styles.label}>Payment Method:</Text> {paymentMethod}</Text>
          <Text><Text style={styles.label}>Membership Price:</Text> Rs.{membershipPrice}</Text>
          {showJoiningFee && (
            <Text><Text style={styles.label}>Joining Fee:</Text> Rs.5000</Text>
          )}
          <Text><Text style={styles.label}>Total Paid:</Text> Rs.{amountPaid}</Text>
        </View>

        <Text style={{ marginTop: 20, fontSize: 10, color: 'gray', textAlign: 'center' }}>
          Thank you for choosing Tenzin&apos; Gym. This is a system-generated invoice.
        </Text>
      </Page>
    </Document>
  )
}

export default function MembershipInvoiceDrawer({ open, onClose, invoiceData }: { open: boolean; onClose: () => void; invoiceData: MembershipInvoiceData | null }) {
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
    isRenewal = false,
  } = invoiceData

  const joiningFee = showJoiningFee ? 5000 : 0
  const membershipPrice = Math.max(0, amountPaid - joiningFee)
  const membershipType = isRenewal ? "Renewal" : "New Membership"

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
          <p><strong>Type:</strong> {membershipType}</p>
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