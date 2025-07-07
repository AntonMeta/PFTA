import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TransactionDetail() {
  const router = useRouter();
  const { transactionId } = useLocalSearchParams();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const parseAmountInput = (input: string): number => {
    const normalized = input.replace(/,/g, ".");
    return parseFloat(normalized);
  };

  const categories = [
    "Food",
    "Transport",
    "Utilities",
    "Entertainment",
    "Healthcare",
    "Insurance",
    "Taxes",
    "Investments",
    "Income",
    "Other",
  ];

  useEffect(() => {
    if (transaction) {
      setEditTitle(transaction.title);
      setEditAmount(Math.abs(transaction.amount).toString());
      setEditCategory(transaction.category || "");
    }

    fetch(`http://192.168.33.6:3000/api/transactions/${transactionId}`)
      .then((res) => res.json())
      .then((data) => {
        setTransaction(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [transactionId]);

  if (loading) return <ActivityIndicator style={styles.loader} />;

  if (!transaction)
    return <Text style={styles.notFound}>Transaction not found.</Text>;

  const createTwoButtonAlert = () =>
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want permanently remove this item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Yes", onPress: () => handleDelete() },
      ]
    );

  const handleDelete = async () => {
    try {
      await fetch(
        `http://192.168.33.6:3000/api/transactions/${transactionId}`,
        {
          method: "DELETE",
        }
      );
      router.replace("/transactions");
    } catch (err) {
      Alert.alert("Error", "Failed to delete transaction.");
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim() || !editAmount.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const parsedAmount = parseAmountInput(editAmount);
      if (isNaN(parsedAmount)) {
        Alert.alert("Error", "Please enter a valid amount");
        return;
      }

      const isIncome = editCategory === "Income";

      const response = await fetch(
        `http://192.168.33.6:3000/api/transactions/${transactionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle,
            amount: Number(parsedAmount),
            category: editCategory,
            is_income: isIncome,
          }),
        }
      );
      if (!response.ok) throw new Error("Update failed");

      const updatedTransaction = await response.json();
      setTransaction(updatedTransaction);
      if (router.canGoBack()) {
        router.back();
        router.replace({
          pathname: "/transactions",
          params: { refresh: Date.now() }, // Force refresh
        });
      } else {
        router.replace(`/transactions?refresh= ${Date.now()}`);
      }
      setEditModalVisible(false);
    } catch (err) {
      Alert.alert("Error", "Failed to update transaction.");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Transaction Details",
          headerStyle: {
            backgroundColor: "#23262f",
          },
          headerTintColor: "#fff",
        }}
      />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{transaction.title}</Text>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{transaction.category}</Text>
          </View>

          <Text style={styles.amount}>{transaction.amount} PLN</Text>
          <Text style={styles.date}>
            {new Date(transaction.transaction_date).toLocaleString()}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              onPress={() => {
                setEditTitle(transaction.title);
                setEditAmount(transaction.amount.toString());
                setEditCategory(transaction.category || "");
                setEditModalVisible(true);
              }}
              title="Edit"
            />
            <Button
              color="#e63946"
              onPress={createTwoButtonAlert}
              title="Remove"
            />
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible && !showCategoryPicker}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Transaction</Text>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={editTitle}
                onChangeText={setEditTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Amount"
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[
                  styles.input,
                  { justifyContent: "center", marginBottom: 16 },
                ]}
                onPress={() => setShowCategoryPicker(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    color: editCategory ? "#fff" : "#b2bec3",
                    fontSize: 16,
                    textAlign: "left",
                  }}
                >
                  {editCategory || "Select Category..."}
                </Text>
              </TouchableOpacity>
              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setEditModalVisible(false)}
                  color="#e63946"
                />
                <Button title="Save" onPress={handleEdit} color="#00b894" />
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showCategoryPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#23262f",
                borderRadius: 16,
                padding: 16,
                width: "80%",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#ffd33d",
                  fontWeight: "bold",
                  marginBottom: 12,
                }}
              >
                Select Category
              </Text>
              <Picker
                selectedValue={editCategory}
                style={{ width: "100%", color: "#fff" }}
                dropdownIconColor="#ffd33d"
                onValueChange={(itemValue) => {
                  setEditCategory(itemValue);
                  setShowCategoryPicker(false);
                }}
              >
                <Picker.Item
                  label="Select Category..."
                  value=""
                  color="#b2bec3"
                />
                {categories.map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} color="#fff" />
                ))}
              </Picker>
              <Button
                title="Cancel"
                color="#e63946"
                onPress={() => setShowCategoryPicker(false)}
              />
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181a20",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#23262f",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#ffd33d",
    marginBottom: 12,
    textAlign: "center",
  },
  amount: {
    fontSize: 50,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "600",
  },
  date: {
    fontSize: 16,
    color: "#b2bec3",
    marginBottom: 24,
  },
  notFound: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    marginTop: 40,
  },
  loader: {
    flex: 1,
    alignSelf: "center",
  },
  categoryBadge: {
    backgroundColor: "#00b894",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: "#fff",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#23262f",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffd33d",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 50,
    width: "100%",
    backgroundColor: "#2d2f36",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: "#fff",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
