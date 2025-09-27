import React, { useState } from "react";
import moment from "moment-timezone";
import ExcelJS from "exceljs";

const ADMIN_PASSWORD = "Go0dr!cke2025*"; // replace with your secure admin password
const locations = ["Udita", "Utalika", "South City", "Urbana", "West Wind"];

const products = [
  { name: "Margaret's Hope (100g)", price: 675.0 },
  { name: "Castleton Vintage Caddy (100g)", price: 306.0 },
  { name: "Castleton Vintage Caddy (250g)", price: 594.0 },
  { name: "Castleton Vintage TB (25)", price: 238.5 },
  { name: "Castleton Muscatel (100g)", price: 787.5 },
  { name: "Badamtam (100g)", price: 283.5 },
  { name: "Badamtam (250g)", price: 562.5 },
  { name: "Barnesbeg Organic WL (100g)", price: 162.0 },
  { name: "Barnesbeg Organic TB (25)", price: 184.5 },
  { name: "Thurbo WL (100g)", price: 157.5 },
  { name: "Thurbo WL (250g)", price: 351.0 },
  { name: "Roasted Organic Jar (250g)", price: 301.5 },
  { name: "Roasted carton (250g)", price: 279.0 },
  { name: "Roasted carton (100g)", price: 117.0 },
  { name: "Roasted TB (25 TB)", price: 117.0 },
  { name: "Harmutty (100g)", price: 495.0 },
  { name: "Dejoo (100g)", price: 495.0 },
  { name: "Borbam (150g)", price: 225.0 },
  { name: "Amporia (100g)", price: 225.0 },
  { name: "Symphomy (All Variants)", price: 157.5 },
  { name: "Ice Tea (All Variants, 1 CFC Each)", price: 112.5 },
  { name: "Premix Cardamom (1 CFC)", price: 135.0 },
  { name: "Premix Ginger (1 CFC)", price: 135.0 },
  { name: "Premix Masala (1 CFC)", price: 135.0 },
  { name: "Castleton Vintage TB (Per Cup)", price: 50.0 },
  { name: "Roasted Teabags (Per Cup)", price: 20.0 },
  { name: "Khaass Teabags (Per Cup)", price: 20.0 },
  { name: "Barnesbeg Teabags (Per Cup)", price: 20.0 },
  { name: "Syphony Teabags (Per Cup)", price: 20.0 },
];

const Admin: React.FC = () => {
  const [password, setPassword] = useState("");
  const [date, setDate] = useState(moment().format("DD/MM/YYYY"));
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [authorized, setAuthorized] = useState(false);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
    } else {
      alert("Incorrect admin password!");
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const formattedDate = moment(date).format("DD/MM/YYYY");

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/goodricke/get?date=${formattedDate}`
      );
      const data = await response.json();
      setLoading(false);

      if (!data || !data.success) {
        alert(data.message || "Failed to fetch entries");
        return;
      }

      setEntries(data.data);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching entries:", error);
      alert("Server error. Please try again.");
    }
  };

  const downloadExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Goodricke Stock");

  // ===== HEADER ROWS =====
  const headerRow1: any[] = ["Date", "Product"];
  locations.forEach(() => {
    headerRow1.push("", "", ""); // placeholder for merged cells
  });
  sheet.addRow(headerRow1);

  // Merge cells for location headers
  let startCol = 3;
  locations.forEach((loc) => {
    sheet.mergeCells(1, startCol, 1, startCol + 2); // merge 3 columns per location
    const cell = sheet.getCell(1, startCol);
    cell.value = loc;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFB300" } };
    startCol += 3;
  });

  // Header row 2: Opening, Closing, Sales
  const headerRow2: any[] = ["", ""];
  locations.forEach(() => {
    headerRow2.push("Opening", "Closing", "Sales");
  });
  sheet.addRow(headerRow2);

  // Style row 2
  sheet.getRow(2).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6B46C1" } };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // ===== DATA ROWS =====
  // Gather all products
  const productSet = new Set<string>();
  entries.forEach((entry) => entry.stock.forEach((item: any) => productSet.add(item.product)));
  const allProducts = Array.from(productSet);

  allProducts.forEach((product) => {
    const row: any[] = [entries[0]?.date || "", product];

    locations.forEach((loc) => {
      const entry = entries.find((e) => e.location === loc);
      const item = entry?.stock.find((s: any) => s.product === product);
      const opening = item?.opening || 0;
      const closing = item?.closing || 0;
      const priceObj = products.find((p) => p.name === product);
      const price = priceObj?.price || 0;
      const sales = (opening - closing) * price;

      row.push(opening, closing, sales);
    });

    sheet.addRow(row);
  });

  // Set column widths
  sheet.columns.forEach((col) => (col.width = 15));

  // Generate buffer & download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Goodricke_Stock_${moment(date).format("DD-MM-YYYY")}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const downloadSalesExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Goodricke Sales");

  // ===== HEADER ROWS =====
  const headerRow1: any[] = ["Date", "Product"];
  locations.forEach((loc) => {
    headerRow1.push(loc);
  });
  sheet.addRow(headerRow1);

  // Style headers
  sheet.getRow(1).eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colNumber <= 2 ? "FFFF9800" : "FF6B46C1" }, // Orange for Date/Product, Purple for locations
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // ===== DATA ROWS =====
  const productSet = new Set<string>();
  entries.forEach((entry) =>
    entry.stock.forEach((item: any) => productSet.add(item.product))
  );
  const allProducts = Array.from(productSet);

  allProducts.forEach((product) => {
    const row: any[] = [entries[0]?.date || "", product];

    locations.forEach((loc) => {
      const entry = entries.find((e) => e.location === loc);
      const item = entry?.stock.find((s: any) => s.product === product);
      const opening = item?.opening || 0;
      const closing = item?.closing || 0;
      const priceObj = products.find((p) => p.name === product);
      const price = priceObj?.price || 0;
      const sales = (opening - closing) * price;

      row.push(sales);
    });

    const addedRow = sheet.addRow(row);
    addedRow.eachCell((cell) => {
      cell.font = { size: 9 };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Set column widths
  sheet.columns.forEach((col) => (col.width = 15));

  // ===== DOWNLOAD FILE =====
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Goodricke_Sales_${moment(date).format("DD-MM-YYYY")}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};



  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">Admin Login</h2>
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent mb-4"
          />
          <button
            onClick={handleLogin}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white px-4 py-10">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
          Goodricke Stock Entries
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
          />
          <button
            onClick={fetchEntries}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            {loading ? "Fetching..." : "Fetch Entries"}
          </button>
        </div>

        {entries.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={downloadExcel}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              Download Excel
            </button>
          </div>
        )}

        {entries.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={downloadSalesExcel}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              Download Sales Excel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
