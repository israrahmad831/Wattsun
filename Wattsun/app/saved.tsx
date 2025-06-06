import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
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
    router.push("/"); // Redirect to the form
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
      <Button title="Back" onPress={() => router.push("/")} />
      <Text style={styles.header}>Saved Invoices</Text>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.invoiceName}>Name: {item.name}</Text>
            <Text style={styles.text}>Type: {item.type}</Text>
            <Text style={styles.text}>To: {item.to}</Text>
            <Text style={styles.text}>Date: {item.date}</Text>
            <Text style={styles.text}>Invoice #: {item.invoiceNumber}</Text>
            <Text style={styles.text}>Telephone: {item.telephone}</Text>
            <Text style={styles.text}>Total: Rs {item.total}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => generatePDF(item)}
            >
              <Text style={styles.buttonText}>Export PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => viewInvoice(item)}
            >
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#e74c3c" }]}
              onPress={() => confirmDelete(item.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
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
                style={styles.modalButton}
                onPress={deleteInvoice}
              >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f4f8",
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
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5,
    color: "#34495e",
  },
  text: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  button: {
    marginVertical: 5,
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
    backgroundColor: "#e74c3c",
    borderRadius: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
