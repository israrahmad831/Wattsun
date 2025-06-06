import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generatePDF } from "../utils/pdf";
import { useRouter } from "expo-router";

export default function SavedInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem("invoices");
      setInvoices(JSON.parse(stored || "[]"));
    };
    load();
  }, []);

  const viewInvoice = async (invoice) => {
    await AsyncStorage.setItem("currentInvoice", JSON.stringify(invoice));
    router.push("/");
  };

  const confirmDelete = (id) => {
    setSelectedInvoiceId(id);
    setModalVisible(true);
  };

  const deleteInvoice = async () => {
    const updatedInvoices = invoices.filter(
      (invoice) => invoice.id !== selectedInvoiceId
    );
    setInvoices(updatedInvoices);
    await AsyncStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    setModalVisible(false);
    setSelectedInvoiceId(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Saved Invoices</Text>

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.invoiceName}>{item.name}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{item.type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To:</Text>
              <Text style={styles.detailValue}>{item.to}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{item.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invoice #:</Text>
              <Text style={styles.detailValue}>{item.invoiceNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Telephone:</Text>
              <Text style={styles.detailValue}>{item.telephone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total:</Text>
              <Text style={[styles.detailValue, styles.totalValue]}>
                Rs {item.total.toFixed(2)}
              </Text>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.actionButton, styles.pdfButton]}
                onPress={() => generatePDF(item)}
              >
                <Text style={styles.buttonText}>Export PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton]}
                onPress={() => viewInvoice(item)}
              >
                <Text style={styles.buttonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => confirmDelete(item.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Are you sure you want to delete this invoice?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={deleteInvoice}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f4f8",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  backButtonText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    color: "#2c3e50",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "bold",
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: "#34495e",
  },
  totalValue: {
    color: "#27ae60",
    fontWeight: "bold",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  pdfButton: {
    backgroundColor: "#3498db",
  },
  viewButton: {
    backgroundColor: "#2ecc71",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
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
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
