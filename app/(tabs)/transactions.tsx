import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

const sortData = [
  { label: "Newest", value: "1" },
  { label: "Oldest", value: "2" },
  { label: "Greatest amount", value: "3" },
  { label: "Lowest amount", value: "4" },
  { label: "Alphabetical ascending", value: "5" },
  { label: "Alphabetical descending", value: "6" },
];

class Transaction {
  id: number;
  title: string;
  category: string;
  amount: number;
  date: number;
  is_income: boolean;
  constructor(
    id: number,
    title: string,
    category: string,
    amount: number,
    date: number,
    is_income: boolean
  ) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.amount = amount;
    this.date = date;
    this.is_income = is_income;
  }
}

// arr.sort((a, b) => b.date - a.date);
export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [Sorting, setSorting] = useState("date");
  const [transactionsModal, setTransactionsModal] = useState(false);
  const [transactionTitle, setTransactionTitle] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionCategory, setTransactionCategory] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const { refresh } = useLocalSearchParams();

  const parseAmountInput = (input: string): number => {
    const normalized = input.replace(/,/g, ".");
    return parseFloat(normalized);
  };

  const refreshTransactions = async () => {
    try {
      const response = await fetch("http://192.168.33.6:3000/api/transactions");
      const data = await response.json();
      if (Array.isArray(data)) {
        setTransactions(
          data.map(
            (t: any) =>
              new Transaction(
                t.id,
                t.title,
                t.category,
                Number(t.amount),
                new Date(t.transaction_date).getTime(),
                !!t.is_income
              )
          )
        );
      }
      setRefreshKey((prev) => prev + 1); // Force refresh
    } catch (err) {
      console.error("Refresh error:", err);
    }
  };

  useEffect(() => {
    refreshTransactions();
  }, [refresh]);

  useEffect(() => {
    fetch("http://192.168.33.6:3000/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTransactions(
            data.map(
              (t: any) =>
                new Transaction(
                  t.id,
                  t.title,
                  t.category,
                  Number(t.amount),
                  new Date(t.transaction_date).getTime(),
                  !!t.is_income
                )
            )
          );
        } else {
          console.error("API did not return an array:", data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

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

  return (
    <>
      <Modal
        visible={transactionsModal && !showCategoryPicker}
        onRequestClose={() => setTransactionsModal(false)}
        animationType="slide"
        transparent
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: "rgba(24,26,32,0.85)" },
          ]}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <TextInput
              style={styles.TextInput}
              value={transactionTitle}
              onChangeText={setTransactionTitle}
              placeholder="Transaction Title"
              placeholderTextColor="#b2bec3"
            />
            <TextInput
              style={styles.TextInput}
              value={transactionAmount}
              onChangeText={setTransactionAmount}
              placeholder="Amount"
              placeholderTextColor="#b2bec3"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[
                styles.TextInput,
                {
                  justifyContent: "center",
                  marginBottom: 16,
                },
              ]}
              onPress={() => setShowCategoryPicker(true)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: transactionCategory ? "#fff" : "#b2bec3",
                  fontSize: 16,
                  textAlign: "left",
                }}
              >
                {transactionCategory || "Select Category..."}
              </Text>
            </TouchableOpacity>
            <View style={styles.modalButtonRow}>
              <Button
                title="Cancel"
                color="#e63946"
                onPress={() => {
                  setTransactionsModal(false);
                  setTransactionTitle("");
                  setTransactionAmount("");
                  setTransactionCategory("");
                }}
              />
              <Button
                title="Add"
                color="#00b894"
                onPress={async () => {
                  if (
                    transactionTitle.trim() !== "" &&
                    transactionAmount.trim() !== ""
                  ) {
                    try {
                      const parsedAmount = parseAmountInput(transactionAmount);
                      const isIncome = transactionCategory === "Income";

                      const response = await fetch(
                        "http://192.168.33.6:3000/api/transactions",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            title: transactionTitle,
                            amount: Number(parsedAmount),
                            category: transactionCategory,
                            is_income: isIncome,
                            transaction_date: new Date(),
                            user_id: 1,
                          }),
                        }
                      );
                      await response.json();
                      // Refresh the list from the server
                      fetch("http://192.168.33.6:3000/api/transactions")
                        .then((res) => res.json())
                        .then((data) => {
                          setTransactions(
                            data.map(
                              (t: any) =>
                                new Transaction(
                                  t.id,
                                  t.title,
                                  t.category,
                                  Number(t.amount),
                                  new Date(t.transaction_date).getTime(),
                                  !!t.is_income
                                )
                            )
                          );
                        });
                    } catch (err) {
                      console.error(err);
                    }
                    setTransactionsModal(false);
                    setTransactionTitle("");
                    setTransactionAmount("");
                    setTransactionCategory("");
                  } else {
                    alert("Please enter a title and amount.");
                  }
                }}
              />
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
              selectedValue={transactionCategory}
              style={{ width: "100%", color: "#fff" }}
              dropdownIconColor="#ffd33d"
              onValueChange={(itemValue) => {
                setTransactionCategory(itemValue);
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
      <View style={styles.container}>
        <View style={styles.buttonViev}>
          <Button
            title="Add Transaction"
            onPress={() => setTransactionsModal(true)}
          />
          <View style={styles.buttonFD}>
            <Button title="Filter" />
            <Button title="Sort" />
          </View>
        </View>
        <FlatList
          key={refreshKey}
          style={styles.list}
          data={transactions}
          keyExtractor={(_, index) => index.toString()}
          refreshing={false}
          onRefresh={refreshTransactions}
          renderItem={({ item }) => (
            <TouchableHighlight
              underlayColor="#2d3038"
              style={{ borderRadius: 12 }}
              onPress={() => {
                router.push(`/transactions/${item.id}`);
              }}
            >
              <View style={styles.itemRow}>
                <Text style={styles.titleItem}>{item.title}</Text>
                <Text style={styles.dateItem}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
                <Text
                  style={[
                    styles.amountItem,
                    { color: item.is_income ? "#00ff00" : "#e63946" },
                  ]}
                >
                  {item.amount == Math.floor(item.amount)
                    ? item.amount
                    : Number(item.amount).toFixed(2)}{" "}
                  PLN
                </Text>
              </View>
            </TouchableHighlight>
          )}
        />
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
  text: {
    color: "#fff",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#23262f",
    borderRadius: 12,
    height: 60,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  titleItem: {
    width: "40%",
    fontSize: 18,
    color: "#ffd33d",
    fontWeight: "bold",
  },
  dateItem: {
    fontSize: 16,
    color: "#b2bec3",
    width: "30%",
    textAlign: "center",
  },
  amountItem: {
    width: "30%",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "right",
  },
  buttonViev: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 0,
    paddingVertical: 16,
    backgroundColor: "transparent",
    marginBottom: 8,
  },
  buttonFD: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    marginLeft: 12,
  },
  list: {
    width: "100%",
    backgroundColor: "transparent",
  },
  TextInput: {
    height: 50,
    width: "100%",
    backgroundColor: "#2d2f36",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#181a20",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#23262f",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  modalTitle: {
    color: "#ffd33d",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
  },
});
