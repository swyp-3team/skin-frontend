import { useState } from "react";
import "./App.css";

function App() {
  const [selectedType, setSelectedType] = useState("");

  const options = ["건성", "지성", "복합성", "민감성"];

  return (
    <div className="layout">
      <div className="container">
        <h1 className="title">피부 타입을 선택해주세요</h1>

        <ul className="options">
          {options.map((type) => (
            <li key={type}>
              <button
                type="button"
                className={`option ${selectedType === type ? "selected" : ""}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            </li>
          ))}
        </ul>

        <p className="result">선택한 타입: {selectedType || "없음"}</p>
      </div>
    </div>
  );
}

export default App;