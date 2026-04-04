import { useEffect, useState } from "react";
import "./SurveyPage.css";

function SurveyPage() {
  const [selectedSkinType, setSelectedSkinType] = useState("");

  const skinTypes = ["건성", "지성", "복합성", "민감성"];

  useEffect(() => {
    const saved = localStorage.getItem("selectedSkinType");
    if (saved) {
      setSelectedSkinType(saved);
    }
  }, []);

  const handleSelect = (type: string) => {
    setSelectedSkinType(type);
    localStorage.setItem("selectedSkinType", type);
  };


  return (
    <div className="layout">
      <div className="menu">
        <div className="title"></div>
      </div>
      <div className="container">
        <div className="title">Q1. 당신의 피부 타입은?</div>

        <ul className="options">
          {skinTypes.map((type) => (
            <li key={type}>
              <button
                onClick={() => handleSelect(type)}
                className={selectedSkinType === type ? "option selected" : "option"}
              >
                {type}
              </button> 
            </li>
          ))}
          </ul>

        <div className="result">선택한 피부 타입: {selectedSkinType || "없음"}</div>

      </div>
    </div>
  );
}
export default SurveyPage;