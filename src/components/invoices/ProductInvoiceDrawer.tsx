"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ProductInvoiceData } from "@/types"
import NextImage from "next/image"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image as PDFImage } from "@react-pdf/renderer"

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

function ProductInvoicePDF({ invoiceData }: { invoiceData: ProductInvoiceData }) {
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
          <Text style={{ fontSize: 14, marginBottom: 5 }}>Product Invoice</Text>
          <Text><Text style={styles.label}>Customer:</Text> {invoiceData.customerName || "N/A"} ({invoiceData.customerPhone || "N/A"})</Text>
          <Text><Text style={styles.label}>Payment Method:</Text> {invoiceData.paymentMethod}</Text>

          <Text style={{ marginTop: 10, marginBottom: 5 }}><Text style={styles.label}>Items:</Text></Text>
          {invoiceData.items.map((item, index) => (
            <Text key={index}>
              - {item.name} x {item.quantity} = Rs.{(item.selling_price * item.quantity).toFixed(2)} (each: Rs.{item.selling_price.toFixed(2)})
            </Text>
          ))}

          <Text style={{ marginTop: 10 }}><Text style={styles.label}>Subtotal:</Text> Rs.{invoiceData.total.toFixed(2)}</Text>
          <Text><Text style={styles.label}>Discount:</Text> {invoiceData.discount}%</Text>
          <Text><Text style={styles.label}>Total:</Text> Rs.{invoiceData.discountedTotal.toFixed(2)}</Text>
        </View>

        <Text style={{ marginTop: 20, fontSize: 10, color: 'gray', textAlign: 'center' }}>
            This is a system-generated invoice.
          </Text>
      </Page>
    </Document>
  )
}

export default function ProductInvoiceDrawer({ open, onClose, invoiceData }: { open: boolean; onClose: () => void; invoiceData: ProductInvoiceData | null }) {
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
          <DialogTitle>Product Invoice</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-4 text-sm text-black">
          <div className="flex justify-center mb-4">
            <NextImage src="/logo.png" alt="Tenzin's Gym Logo" width={80} height={40} />
          </div>
          <p className="text-center text-muted-foreground mb-4">{formatISTDate(date)}</p>
          <p><strong>Invoice ID:</strong> {invoice_id}</p>
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Customer Name:</strong> {customerName}</p>
          <p><strong>Phone:</strong> {customerPhone}</p>
          <p><strong>Payment Method:</strong> {paymentMethod}</p>

          <h3 className="mt-4 font-semibold">Items:</h3>
          <ul className="list-disc ml-4">
            {items.map((item) => (
              <li key={item.product_id}>
                {item.name} x {item.quantity} – ₹{(item.selling_price * item.quantity).toFixed(2)} (each: ₹{item.selling_price.toFixed(2)}, MRP: ₹{(item.mrp ?? 0).toFixed(2)})
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
          
          <PDFDownloadLink
            document={<ProductInvoicePDF invoiceData={invoiceData} />}
            fileName={`ProductInvoice-${invoice_id}.pdf`}
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
