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

function ProductInvoicePDF({ invoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Tenzing Gym - Product Invoice</Text>
          <Text>
            <Text style={styles.label}>Invoice ID:</Text> {invoiceData.invoice_id}
          </Text>
          <Text>
            <Text style={styles.label}>Date:</Text> {invoiceData.date}
          </Text>
          <Text>
            <Text style={styles.label}>Customer Name:</Text> {invoiceData.customerName}
          </Text>
          <Text>
            <Text style={styles.label}>Phone:</Text> {invoiceData.customerPhone}
          </Text>
          <Text>
            <Text style={styles.label}>Payment Method:</Text> {invoiceData.paymentMethod}
          </Text>
          <Text style={{ marginTop: 10, marginBottom: 5 }}>
            <Text style={styles.label}>Items:</Text>
          </Text>
          {invoiceData.items.map((item, index) => (
            <Text key={index}>
              - {item.name} x {item.quantity} = ₹{item.selling_price * item.quantity} (₹{item.selling_price} each)
            </Text>
          ))}
          <Text style={{ marginTop: 10 }}>
            <Text style={styles.label}>Subtotal:</Text> ₹{invoiceData.total.toFixed(2)}
          </Text>
          <Text>
            <Text style={styles.label}>Discount:</Text> {invoiceData.discount}%
          </Text>
          <Text>
            <Text style={styles.label}>Total After Discount:</Text> ₹{invoiceData.discountedTotal.toFixed(2)}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default function ProductInvoiceDrawer({ open, onClose, invoiceData }) {
  if (!invoiceData) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invoice</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-4 text-sm text-black">
          <h2 className="text-lg font-bold mb-2">Tenzing Gym - Product Invoice</h2>
          <p>
            <strong>Invoice ID:</strong> {invoiceData.invoice_id}
          </p>
          <p>
            <strong>Date:</strong> {invoiceData.date}
          </p>
          <p>
            <strong>Customer Name:</strong> {invoiceData.customerName}
          </p>
          <p>
            <strong>Phone:</strong> {invoiceData.customerPhone}
          </p>
          <p>
            <strong>Payment Method:</strong> {invoiceData.paymentMethod}
          </p>
          <h3 className="mt-4 font-semibold">Items:</h3>
          <ul className="list-disc ml-4">
            {invoiceData.items.map((item) => (
              <li key={item.product_id}>
                {item.name} x {item.quantity} – ₹{item.selling_price * item.quantity} (₹{item.selling_price} each, MRP: ₹{item.mrp})
              </li>
            ))}
          </ul>
          <p className="mt-2">
            <strong>Subtotal:</strong> ₹{invoiceData.total.toFixed(2)}
          </p>
          <p>
            <strong>Discount:</strong> {invoiceData.discount}%
          </p>
          <p>
            <strong>Total After Discount:</strong> ₹{invoiceData.discountedTotal.toFixed(2)}
          </p>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <PDFDownloadLink
            document={<ProductInvoicePDF invoiceData={invoiceData} />}
            fileName={`Invoice-${invoiceData.invoice_id}.pdf`}
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
