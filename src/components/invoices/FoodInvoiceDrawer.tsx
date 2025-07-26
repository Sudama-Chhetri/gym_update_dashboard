"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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


function FoodInvoicePDF({ invoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Tenzin&apos;s Gym - Restaurant Invoice</Text>
          <Text><Text style={styles.label}>Invoice ID:</Text> {invoiceData.invoice_id}</Text>
          <Text><Text style={styles.label}>Date:</Text> {invoiceData.date}</Text>
          <Text><Text style={styles.label}>Customer:</Text> {invoiceData.customerName || "N/A"} ({invoiceData.customerPhone || "N/A"})</Text>
          <Text><Text style={styles.label}>Payment Method:</Text> {invoiceData.paymentMethod}</Text>

          <Text style={{ marginTop: 10, marginBottom: 5 }}><Text style={styles.label}>Items:</Text></Text>
          {invoiceData.items.map((item, index) => (
            <Text key={index}>
              - {item.name} x {item.quantity} = ₹{(item.cost * item.quantity).toFixed(2)}
            </Text>
          ))}

          <Text style={{ marginTop: 10 }}><Text style={styles.label}>Subtotal:</Text> ₹{invoiceData.total.toFixed(2)}</Text>
          <Text><Text style={styles.label}>Discount:</Text> {invoiceData.discount}%</Text>
          <Text><Text style={styles.label}>Total:</Text> ₹{invoiceData.discountedTotal.toFixed(2)}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default function FoodInvoiceDrawer({ open, onClose, invoiceData }) {
  if (!invoiceData) return null

  const {
    invoice_id,
    items = [],
    total = 0,
    discount = 0,
    discountedTotal = 0,
    customerName = "",
    customerPhone = "",
    paymentMethod = "",
    date = ""
  } = invoiceData

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] print:bg-white">
        <DialogHeader>
          <DialogTitle>Restaurant Invoice</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-4 text-sm text-black">
          <h2 className="text-lg font-bold mb-2 text-center">Tenzin&apos;s Gym</h2>
          <p className="text-center text-muted-foreground mb-4">{formatISTDate(date)}</p>
          <p><strong>Invoice ID:</strong> {invoice_id}</p>
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Customer Name:</strong> {customerName}</p>
          <p><strong>Phone:</strong> {customerPhone}</p>
          <p><strong>Payment Method:</strong> {paymentMethod}</p>

          <h3 className="mt-4 font-semibold">Items:</h3>
          <ul className="list-disc ml-4">
            {items.map((item) => (
              <li key={item.food_id}>
                {item.name} x {item.quantity} – ₹{(item.cost * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t pt-4">
            <p><strong>Subtotal:</strong> ₹{total.toFixed(2)}</p>
            <p><strong>Discount:</strong> {discount}%</p>
            <p><strong>Total:</strong> ₹{discountedTotal.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <PDFDownloadLink
            document={<FoodInvoicePDF invoiceData={invoiceData} />}
            fileName={`FoodInvoice-${invoice_id}.pdf`}
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
