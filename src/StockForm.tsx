import React, { useState } from "react";
import moment from "moment-timezone";

// Your existing imports: products, locations, locationPasswords
const locations = ["Udita", "Utalika", "South City", "Urbana", "West Wind"];

const locationPasswords: Record<string, string> = {
  "Udita": "passUdita123",
  "Utalika": "passUtalika123",
  "South City": "passSouth123",
  "Urbana": "passUrbana123",
  "West Wind": "passWest123"
};

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
const StockForm: React.FC = () => {
  const [formData, setFormData] = useState(
    products.map((p) => ({ product: p.name, opening: "", closing: "" }))
  );
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const currentDate = moment().tz("Asia/Kolkata").format("DD/MM/YYYY");

  const handleStockChange = (
    index: number,
    field: "opening" | "closing",
    value: string
  ) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (locationPasswords[location] !== password) {
      alert("Invalid password for the selected location!");
      return;
    }

    const payload = {
      location,
      date: currentDate,
      stock: formData,
    };

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/goodricke/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setLoading(false);

      if (!data || !data.success) {
        alert(data.message ||"Failed to submit form");
        return;
      }

      setSubmitted(true);
    } catch (error) {
      setLoading(false);
      console.error("Error submitting form:", error);
      alert("Server error. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">
            Submission Successful!
          </h2>
          <p className="text-gray-700 mb-6">
            Your stock entry has been submitted successfully.
          </p>
          <button
            onClick={() => {
              setFormData(products.map((p) => ({ product: p.name, opening: "", closing: "" })));
              setLocation("");
              setPassword("");
              setSubmitted(false);
            }}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Submit Another Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-700">
          Stock Entry Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
        {/*date */}
        <div>
  <label className="block font-medium mb-1">Date</label>
  <input
    type="string"
    value={moment().tz("Asia/Kolkata").format("DD/MM/YYYY")}
    disabled
    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-100 text-gray-700 focus:outline-none transition"
  />
</div>
          {/* Location */}
          <div>
            <label className="block font-medium mb-1">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
            />
          </div>

          {/* Products */}
          <div className="space-y-4">
            {formData.map((item, index) => (
              <div
                key={item.product}
                className="p-4 border border-gray-200 rounded-2xl shadow-sm bg-purple-50"
              >
                <p className="font-semibold text-purple-700 mb-2 flex justify-between">
                  <span>{item.product}</span>
                  <span className="text-gray-700">{products[index].price} ₹</span>
                </p>

                {/* Opening & Closing always in same row */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-600 mb-1">Opening Stock</label>
                    <input
                      type="number"
                      value={item.opening}
                      onChange={(e) => handleStockChange(index, "opening", e.target.value)}
                      required
                      min={0}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-600 mb-1">Closing Stock</label>
                    <input
                      type="number"
                      value={item.closing}
                      onChange={(e) => handleStockChange(index, "closing", e.target.value)}
                      required
                      min={0}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Sales (calculated) */}
          <div>
  <label className="block font-medium mb-1">Total Sales Amount</label>
  <input
    type="number"
    value={formData.reduce((total, item, index) => {
      const sold = Math.max(Number(item.opening) - Number(item.closing), 0);
      return total + sold * products[index].price;
    }, 0)}
    disabled
    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-100 text-gray-700 focus:outline-none transition"
  />
</div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-purple-600 text-white font-semibold rounded-2xl hover:bg-purple-700 transition-colors flex justify-center items-center ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            )}
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StockForm;
