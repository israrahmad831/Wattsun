import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Button,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function EditableInvoice() {
  const router = useRouter();
  const [items, setItems] = useState([
    { qty: "", name: "", price: "", total: 0 },
    { qty: "", name: "", price: "", total: 0 },
    { qty: "", name: "", price: "", total: 0 },
    { qty: "", name: "", price: "", total: 0 },
    { qty: "", name: "", price: "", total: 0 },
  ]);
  const [invoiceName, setInvoiceName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [tempInvoiceName, setTempInvoiceName] = useState("");
  const [invoiceDetails, setInvoiceDetails] = useState({
    type: "",
    to: "",
    date: new Date().toLocaleDateString(),
    invoiceNumber: 0,
    telephone: "",
  });
  const [isSaving, setIsSaving] = useState(false); // New state to track saving

  useEffect(() => {
    const loadCurrentInvoice = async () => {
      const currentInvoice = await AsyncStorage.getItem("currentInvoice");
      const existingInvoices = JSON.parse(
        (await AsyncStorage.getItem("invoices")) || "[]"
      );
      const nextInvoiceNumber = existingInvoices.length + 1;

      if (currentInvoice) {
        const parsedInvoice = JSON.parse(currentInvoice);
        setItems(parsedInvoice.items);
        setInvoiceName(parsedInvoice.name || "");
        setInvoiceDetails({
          ...invoiceDetails,
          invoiceNumber: nextInvoiceNumber,
        });
        await AsyncStorage.removeItem("currentInvoice"); // Clear after loading
      } else {
        setInvoiceDetails({
          ...invoiceDetails,
          invoiceNumber: nextInvoiceNumber,
        });
      }
    };
    loadCurrentInvoice();
  }, []);

  const handleChange = (value, index, field) => {
    const updated = [...items];
    updated[index][field] = value;

    // Auto-calculate total
    const qty = parseFloat(updated[index].qty) || 0;
    const price = parseFloat(updated[index].price) || 0;
    updated[index].total = qty * price;

    setItems(updated);
  };

  const addRow = () => {
    setItems([...items, { qty: "", name: "", price: "", total: 0 }]);
  };

  const clearAll = async () => {
    setItems([
      { qty: "", name: "", price: "", total: 0 },
      { qty: "", name: "", price: "", total: 0 },
      { qty: "", name: "", price: "", total: 0 },
      { qty: "", name: "", price: "", total: 0 },
      { qty: "", name: "", price: "", total: 0 },
    ]);
    setInvoiceName("");
    await AsyncStorage.removeItem("currentInvoice"); // Clear any opened invoice
    setModalVisible(false);
  };

  const saveInvoice = async () => {
    if (isSaving) return; // Prevent multiple saves
    setIsSaving(true); // Disable save button

    if (!invoiceName) {
      setSaveModalVisible(true);
      setIsSaving(false); // Re-enable save button if modal is shown
      return;
    }

    const cleaned = items.filter((i) => i.name && i.qty && i.price);
    const invoice = {
      id: Date.now().toString(),
      name: invoiceName,
      type: invoiceDetails.type,
      to: invoiceDetails.to,
      date: invoiceDetails.date,
      invoiceNumber: invoiceDetails.invoiceNumber,
      telephone: invoiceDetails.telephone,
      items: cleaned,
      total: cleaned.reduce((sum, i) => sum + i.total, 0),
    };
    const existing = JSON.parse(
      (await AsyncStorage.getItem("invoices")) || "[]"
    );
    await AsyncStorage.setItem(
      "invoices",
      JSON.stringify([invoice, ...existing])
    );
    alert("Invoice saved!");
    setIsSaving(false); // Re-enable save button after saving
  };

  const confirmSaveInvoice = async () => {
    setInvoiceName(tempInvoiceName);
    setSaveModalVisible(false); // Close the modal
    await saveInvoice(); // Call saveInvoice after setting the name
  };

  const grandTotal = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>[Your Logo Here]</Text>
      </View>

      <Text style={styles.invoiceName}>{invoiceName}</Text>

      <Text style={styles.title}>Wattsun Solar Energy Invoice Form</Text>

      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Qty</Text>
        <Text style={styles.cellHeader}>Description</Text>
        <Text style={styles.cellHeader}>Price</Text>
        <Text style={styles.cellHeader}>Total</Text>
      </View>

      {items.map((item, index) => (
        <View key={index} style={styles.row}>
          <TextInput
            style={styles.qtyCell} // Use the updated style for quantity
            placeholder="Qty"
            keyboardType="numeric"
            value={item.qty}
            onChangeText={(text) => handleChange(text, index, "qty")}
          />
          <TextInput
            style={styles.descriptionCell} // Use the updated style for description
            placeholder="Description"
            value={item.name}
            onChangeText={(text) => handleChange(text, index, "name")}
          />
          <TextInput
            style={styles.priceCell} // Use the updated style for price
            placeholder="Price"
            keyboardType="numeric"
            value={item.price}
            onChangeText={(text) => handleChange(text, index, "price")}
          />
          <Text style={styles.totalCell}>Rs {item.total.toFixed(2)}</Text>
        </View>
      ))}

      <Button title="Add New Row" onPress={addRow} />
      <Button title="Clear All" onPress={() => setModalVisible(true)} />
      <Text style={styles.grandTotal}>
        Grand Total: Rs {grandTotal.toFixed(2)}
      </Text>

      <Button
        title="Save Invoice"
        onPress={saveInvoice}
        disabled={isSaving} // Disable button while saving
      />
      <Button
        title="View Saved Invoices"
        onPress={() => router.push("/saved")}
      />

      {/* Clear All Confirmation Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Are you sure you want to clear all rows and start a new invoice?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={clearAll}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Save Invoice Details Modal */}
      <Modal
        visible={saveModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Enter Invoice Details:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Invoice Name"
              value={tempInvoiceName}
              onChangeText={setTempInvoiceName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Type"
              value={invoiceDetails.type}
              onChangeText={(text) =>
                setInvoiceDetails({ ...invoiceDetails, type: text })
              }
            />
            <TextInput
              style={styles.modalInput}
              placeholder="To (Name)"
              value={invoiceDetails.to}
              onChangeText={(text) =>
                setInvoiceDetails({ ...invoiceDetails, to: text })
              }
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Telephone"
              keyboardType="phone-pad"
              value={invoiceDetails.telephone}
              onChangeText={(text) =>
                setInvoiceDetails({ ...invoiceDetails, telephone: text })
              }
            />
            <Text style={styles.modalText}>
              Date: {invoiceDetails.date} | Invoice #:{" "}
              {invoiceDetails.invoiceNumber}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={confirmSaveInvoice}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setSaveModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f4f8",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#34495e",
  },
  invoiceName: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
    color: "#2c3e50",
  },
  headerRow: {
    flexDirection: "row",
    marginBottom: 8,
    backgroundColor: "#ecf0f1",
    padding: 10,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cellHeader: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    color: "#34495e",
  },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    padding: 8,
    marginRight: 4,
    borderRadius: 4,
    backgroundColor: "#ecf0f1",
  },
  qtyCell: {
    flex: 0.5, // Decrease width for quantity input
    borderWidth: 1,
    borderColor: "#bdc3c7",
    padding: 8,
    marginRight: 4,
    borderRadius: 4,
    backgroundColor: "#ecf0f1",
  },
  descriptionCell: {
    flex: 2, // Increase width for description input
    borderWidth: 1,
    borderColor: "#bdc3c7",
    padding: 8,
    marginRight: 4,
    borderRadius: 4,
    backgroundColor: "#ecf0f1",
  },
  priceCell: {
    flex: 0.8, // Decrease width for price input
    borderWidth: 1,
    borderColor: "#bdc3c7",
    padding: 8,
    marginRight: 4,
    borderRadius: 4,
    backgroundColor: "#ecf0f1",
  },
  totalCell: {
    flex: 1,
    textAlign: "center",
    paddingTop: 10,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  grandTotal: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "right",
    color: "#27ae60",
  },
  button: {
    marginVertical: 10,
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    opacity: 1, // Default opacity
  },
  buttonDisabled: {
    opacity: 0.6, // Reduced opacity for disabled state
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#34495e",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: "#3498db",
    borderRadius: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#ecf0f1",
  },
});
