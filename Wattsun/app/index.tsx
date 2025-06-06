import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import logo from "../assets/images/Wattsun.png";

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
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewingSaved, setIsViewingSaved] = useState(false);

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
          type: parsedInvoice.type || "",
          to: parsedInvoice.to || "",
          date: parsedInvoice.date || new Date().toLocaleDateString(),
          invoiceNumber: parsedInvoice.invoiceNumber || nextInvoiceNumber,
          telephone: parsedInvoice.telephone || "",
        });
        setIsViewingSaved(true);
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
    if (!isEditMode && isViewingSaved) return;

    const updated = [...items];
    updated[index][field] = value;

    // Auto-calculate total
    const qty = parseFloat(updated[index].qty) || 0;
    const price = parseFloat(updated[index].price) || 0;
    updated[index].total = qty * price;

    setItems(updated);
  };

  const addRow = () => {
    if (!isEditMode && isViewingSaved) return;
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
    setInvoiceDetails({
      type: "",
      to: "",
      date: new Date().toLocaleDateString(),
      invoiceNumber: invoiceDetails.invoiceNumber + 1,
      telephone: "",
    });
    await AsyncStorage.removeItem("currentInvoice");
    setModalVisible(false);
    setIsViewingSaved(false);
    setIsEditMode(false);
  };

  const saveInvoice = async () => {
    if (isSaving) return;
    setIsSaving(true);

    if (!invoiceName) {
      setSaveModalVisible(true);
      setIsSaving(false);
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
    setIsSaving(false);
    setIsViewingSaved(false);
    setIsEditMode(false);
  };

  const confirmSaveInvoice = async () => {
    setInvoiceName(tempInvoiceName);
    setSaveModalVisible(false);
    await saveInvoice();
  };

  const closeSavedInvoice = async () => {
    await AsyncStorage.removeItem("currentInvoice");
    setIsViewingSaved(false);
    setIsEditMode(false);
    clearAll();
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const grandTotal = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logoImage} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>WATTSUN ENERGY</Text>
          <Text style={styles.headerSubtitle}>
            MAIN SAMUNDRI ROAD GOJRA PH# 03236677706
          </Text>
        </View>
      </View>

      {isViewingSaved && (
        <View style={styles.viewModeControls}>
          {!isEditMode ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={toggleEditMode}
            >
              <Text style={styles.buttonText}>Edit Invoice</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={saveInvoice}>
              <Text style={styles.buttonText}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeSavedInvoice}
          >
            <Text style={styles.buttonText}>Close Invoice</Text>
          </TouchableOpacity>
        </View>
      )}
      {invoiceName && (
        <TextInput
          style={styles.invoiceNameInput}
          placeholder="Invoice Name"
          value={invoiceName}
          onChangeText={setInvoiceName}
          editable={!isViewingSaved || isEditMode}
        />
      )}

      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Qty</Text>
        <Text style={styles.cellHeader}>Description</Text>
        <Text style={styles.cellHeader}>Price</Text>
        <Text style={styles.cellHeader}>Total</Text>
      </View>

      {items.map((item, index) => (
        <View key={index} style={styles.row}>
          <TextInput
            style={styles.qtyCell}
            placeholder="Qty"
            keyboardType="numeric"
            value={item.qty}
            onChangeText={(text) => handleChange(text, index, "qty")}
            editable={!isViewingSaved || isEditMode}
          />
          <TextInput
            style={styles.descriptionCell}
            placeholder="Description"
            value={item.name}
            onChangeText={(text) => handleChange(text, index, "name")}
            editable={!isViewingSaved || isEditMode}
          />
          <TextInput
            style={styles.priceCell}
            placeholder="Price"
            keyboardType="numeric"
            value={item.price}
            onChangeText={(text) => handleChange(text, index, "price")}
            editable={!isViewingSaved || isEditMode}
          />
          <Text style={styles.totalCell}>Rs {item.total.toFixed(2)}</Text>
        </View>
      ))}

      {(!isViewingSaved || isEditMode) && (
        <TouchableOpacity style={styles.addButton} onPress={addRow}>
          <Text style={styles.buttonText}>Add New Row</Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonRow}>
        {!isViewingSaved && (
          <>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.buttonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveInvoice}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>
                {isSaving ? "Saving..." : "Save Invoice"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={styles.grandTotal}>
        Grand Total: Rs {grandTotal.toFixed(2)}
      </Text>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => router.push("/saved")}
      >
        <Text style={styles.buttonText}>View Saved Invoices</Text>
      </TouchableOpacity>

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
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 130,
    height: 130,
    resizeMode: "contain",
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#34495e",
  },
  viewModeControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  invoiceNameInput: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
    color: "#2c3e50",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  headerRow: {
    flexDirection: "row",
    marginBottom: 8,
    backgroundColor: "#2c3e50",
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
    color: "#fff",
  },
  qtyCell: {
    flex: 0.5,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    padding: 8,
    marginRight: 4,
    borderRadius: 4,
    backgroundColor: "#ecf0f1",
  },
  descriptionCell: {
    flex: 2,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    padding: 8,
    marginRight: 4,
    borderRadius: 4,
    backgroundColor: "#ecf0f1",
  },
  priceCell: {
    flex: 0.8,
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
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  viewButton: {
    backgroundColor: "#9b59b6",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#f39c12",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  closeButton: {
    backgroundColor: "#95a5a6",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
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
