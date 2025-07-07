import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CURRENCY = "PLN";

export default function Index() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://192.168.33.6:3000/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Calculate totals
  const income = transactions
    .filter((t) => t.is_income)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => !t.is_income)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.balance}>
          {loading ? "..." : Math.floor(balance) + " " + CURRENCY}
        </Text>
        <Text style={styles.income}>
          {loading ? "..." : "Monthly Income: " + Math.floor(income)}
        </Text>
        <Text style={styles.expenses}>
          {loading ? "..." : "Monthly Expenses: " + (Math.floor(expenses) + 1)}
        </Text>
        <Link href="/transactions" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Go to My Transactions</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
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
    borderRadius: 18,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  balance: {
    color: "#ffd33d",
    fontSize: 54,
    fontWeight: "bold",
    marginBottom: 30,
    marginTop: 10,
    textAlign: "center",
    letterSpacing: 1,
  },
  income: {
    color: "#00b894",
    fontSize: 22,
    marginVertical: 10,
    width: "100%",
    textAlign: "center",
    borderColor: "#00b894",
    borderWidth: 1,
    paddingVertical: 10,
    backgroundColor: "#1f1f1f",
    borderRadius: 8,
  },
  expenses: {
    color: "#e63946",
    fontSize: 22,
    marginVertical: 10,
    width: "100%",
    textAlign: "center",
    borderColor: "#e63946",
    borderWidth: 1,
    paddingVertical: 10,
    backgroundColor: "#1f1f1f",
    borderRadius: 8,
  },
  button: {
    marginTop: 32,
    backgroundColor: "#ffd33d",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: "#23262f",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
