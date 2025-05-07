const User = require("../models/User");
const Income = require("../models/Income");
const xlsx = require("xlsx");
const path = require("path");
//add Income Source
exports.addIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, source, amount, date } = req.body;
    if (!source || !amount || !date) {
      return res.status(400).json({ message: "All Fields are required" });
    }

    const newIncome = new Income({
      userId,
      icon,
      source,
      amount,
      date: new Date(date),
    });
    await newIncome.save();
    res.status(200).json(newIncome);
  } catch (err) {
    res.status(500).json({ message: "server Error" });
  }
};

//get all Income
exports.getAllIncome = async (req, res) => {
  const userId = req.user.id;
  try {
    const income = await Income.find({ userId }).sort({ date: -1 });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: "server Error" });
  }
};

// delete Income
exports.deleteIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: "Income Delete successfully" });
  } catch (error) {
    res.status(500).json({ message: "server Error" });
  }
};

exports.downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const income = await Income.find({ userId }).sort({ date: -1 });

    const data = income.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: item.date,
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Income");

    const filePath = path.join(__dirname, "../income_details.xlsx");
    xlsx.writeFile(wb, filePath); // write file to disk

    res.download(filePath, "income_details.xlsx"); // serve file
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
