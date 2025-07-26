"use client"

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

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount)

const formatISTDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

function ProductInvoicePDF({ invoiceData }) {
  const formattedDate = formatISTDate(invoiceData.date)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Tenzin&apos; Gym - Product Invoice</Text>
          <Text><Text style={styles.label}>Invoice ID:</Text> {invoiceData.invoice_id}</Text>
          <Text><Text style={styles.label}>Date:</Text> {formattedDate}</Text>
          <Text><Text style={styles.label}>Customer Name:</Text> {invoiceData.customerName}</Text>
          <Text><Text style={styles.label}>Phone:</Text> {invoiceData.customerPhone}</Text>
          <Text><Text style={styles.label}>Payment Method:</Text> {invoiceData.paymentMethod}</Text>

          <Text style={{ marginTop: 10, marginBottom: 5 }}><Text style={styles.label}>Items:</Text></Text>
          {invoiceData.items.map((item, index) => (
            <Text key={index}>
              - {item.name} x {item.quantity} = {formatINR(item.selling_price * item.quantity)} ({formatINR(item.selling_price)} each)
            </Text>
          ))}

          <Text style={{ marginTop: 10 }}><Text style={styles.label}>Subtotal:</Text> {formatINR(invoiceData.total)}</Text>
          <Text><Text style={styles.label}>Discount:</Text> {invoiceData.discount}%</Text>
          <Text><Text style={styles.label}>Total After Discount:</Text> {formatINR(invoiceData.discountedTotal)}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default function ProductInvoiceDrawer({ open, onClose, invoiceData }) {
  if (!invoiceData) return null

  const {
    invoice_id,
    customerName,
    customerPhone,
    paymentMethod,
    total,
    discount,
    discountedTotal,
    items,
    date,
  } = invoiceData

  const formattedDate = formatISTDate(date)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Product Invoice</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-4 text-sm text-black">
          <h2 className="text-lg font-bold mb-2 text-center">Tenzin&apos;s Gym</h2>
          <p className="text-center text-muted-foreground mb-4">{formatISTDate(date)}</p>
          
          <p><strong>Invoice ID:</strong> {invoice_id}</p>
          <p><strong>Date:</strong> {formattedDate}</p>
          <p><strong>Customer Name:</strong> {customerName}</p>
          <p><strong>Phone:</strong> {customerPhone}</p>
          <p><strong>Payment Method:</strong> {paymentMethod}</p>

          <h3 className="mt-4 font-semibold">Items:</h3>
          <ul className="list-disc ml-4">
            {items.map((item) => (
              <li key={item.product_id}>
                {item.name} x {item.quantity} – {formatINR(item.selling_price * item.quantity)} ({formatINR(item.selling_price)} each, MRP: {formatINR(item.mrp)})
              </li>
            ))}
          </ul>

          <p className="mt-2"><strong>Subtotal:</strong> {formatINR(total)}</p>
          <p><strong>Discount:</strong> {discount}%</p>
          <p><strong>Total After Discount:</strong> {formatINR(discountedTotal)}</p>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <PDFDownloadLink
            document={<ProductInvoicePDF invoiceData={invoiceData} />}
            fileName={`Invoice-${invoice_id}.pdf`}
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
